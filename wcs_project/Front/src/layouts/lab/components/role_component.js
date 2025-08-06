import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Table, TableHead, useMediaQuery, TableRow, TableCell, TableBody, Checkbox } from "@mui/material";
import DropDownAPI from "api/DropDownAPI";
import AccessAPI from "api/AccessAPI";
import SweetAlertComponent from "./sweetAlert";
const RoleManagementTable = ({ onStateChange, userID }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [factoryData, setFactoryData] = useState([]);
  const [checkedState, setCheckedState] = useState({});
  const [warehouseData, setWarehouseData] = useState([]);
  const [warehouseCheckedState, setWarehouseCheckedState] = useState({});
  const isTablet = useMediaQuery("(max-width: 768px)");
  const [alert, setAlert] = useState({
    show: false,
    type: "error",
    title: "",
    message: "",
  });
  // 🔎 ดึงข้อมูลโรงงานทั้งหมด
  useEffect(() => {
    const fetchFactoryData = async () => {
      try {
        const response = await DropDownAPI.getFactoryDropdown();
        if (response.isCompleted) {
          const data = response.data || [];
          setFactoryData(data);

          const initialCheckedState = {};
          data.forEach((factory) => {
            initialCheckedState[factory.value] = false;
          });
          setCheckedState(initialCheckedState);
        } else {
          console.error("Error fetching factory data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching factory data:", error);
      }
    };

    fetchFactoryData();
  }, []);

  // 🔎 ดึงข้อมูลการเข้าถึงของผู้ใช้และทำการ Check Box
  useEffect(() => {
    const fetchUserAccessData = async () => {
      try {
        const response = await AccessAPI.getUserID(userID);
        if (response.isCompleted) {
          const userAccessData = response.data || [];

          // ✅ อัปเดต Checkbox ของโรงงาน (Factory)
          const updatedFactoryCheckedState = {};
          userAccessData.forEach(item => {
            updatedFactoryCheckedState[item.fty_id] = true;  // Check fty_id
          });

          // ✅ อัปเดต Checkbox ของคลัง (Warehouse)
          const updatedWarehouseCheckedState = {};
          userAccessData.forEach(item => {
            item.warehouses.forEach(warehouse => {
              updatedWarehouseCheckedState[warehouse.wh_id] = true;  // Check wh_id
            });
          });

          // อัปเดตสถานะ Checkbox
          setCheckedState(updatedFactoryCheckedState);
          setWarehouseCheckedState(updatedWarehouseCheckedState);

          console.log("Factory Checked State:", updatedFactoryCheckedState);
          console.log("Warehouse Checked State:", updatedWarehouseCheckedState);

        } else {
          console.error("Error fetching user access data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching user access data:", error);
      }
    };

    if (userID) {
      fetchUserAccessData();  // ✅ ดึงข้อมูลเมื่อมี userID
    }
  }, [userID]);

  // 📦 ดึงข้อมูลคลังตามโรงงานที่ถูกเลือก
  useEffect(() => {
    const selectedFactories = Object.keys(checkedState).filter((key) => checkedState[key]);

    if (selectedFactories.length > 0) {
      const fetchWarehouseData = async () => {
        try {
          const response = await AccessAPI.searchWH(selectedFactories);
          if (response.isCompleted) {
            const data = response.data || [];
            const filteredData = data.filter((warehouse) => selectedFactories.includes(warehouse.fty_id.toString()));
            setWarehouseData(filteredData);

            const initialWarehouseCheckedState = {};
            filteredData.forEach((warehouse) => {
              initialWarehouseCheckedState[warehouse.wh_id] = warehouseCheckedState[warehouse.wh_id] || false;
            });
            setWarehouseCheckedState(initialWarehouseCheckedState);
          } else {
            console.error("Error fetching warehouse data:", response.message);
          }
        } catch (error) {
          console.error("Error fetching warehouse data:", error);
        }
      };

      fetchWarehouseData();
    } else {
      setWarehouseData([]);
      setWarehouseCheckedState({});
    }
  }, [checkedState]);

  // 📥 ส่งสถานะ Checkbox กลับไปยัง RoleFactory
  useEffect(() => {
    onStateChange({ factoryCheckedState: checkedState, warehouseCheckedState });
  }, [checkedState, warehouseCheckedState, onStateChange]);

  // ✅ จัดการ Checkbox ของโรงงาน
  const handleCheckboxChange = (factoryValue) => {
    setCheckedState((prev) => ({
      ...prev,
      [factoryValue]: !prev[factoryValue],
    }));
  };

  // ✅ จัดการ Checkbox ของคลัง
  const handleWarehouseCheckboxChange = (warehouseValue) => {
    setWarehouseCheckedState((prev) => ({
      ...prev,
      [warehouseValue]: !prev[warehouseValue],
    }));
  };

  const handleTabChange = (event, newValue) => {
    const hasSelectedFactory = Object.values(checkedState).some((checked) => checked);
    if (newValue === 1 && !hasSelectedFactory) {
      setAlert({
        show: true,
        type: "error",
        title: "ข้อผิดพลาด",
        message: "กรุณาเลือกโรงงานอย่างน้อยหนึ่งรายการก่อนเข้าสู่แท็บคลัง",
      });
      return;
    }
    setSelectedTab(newValue);
  };

  return (
    <Box>
      <Tabs value={selectedTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
        <Tab label="โรงงาน" />
        <Tab label="คลัง" />
      </Tabs>

      {selectedTab === 0 && (
        <Box mt={3}>
          <Table style={{ borderCollapse: "collapse", tableLayout: isTablet ? "auto" : "fixed", width: "100%" }}>
            <TableHead  style={{ display: "table-header-group" }}>
              <TableRow style={{ backgroundColor: "#F2B600", height: isTablet ? "50px" : "60px" }}>
                <TableCell align="center" style={{ fontWeight: "bold" }}>โรงงาน</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold" }}>ใช้งานได้</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {factoryData.map((factory) => (
                <TableRow key={factory.value}>
                  <TableCell align="center">{factory.text}</TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={checkedState[factory.value] || false}
                      onChange={() => handleCheckboxChange(factory.value)}
                      color="primary"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {selectedTab === 1 && (
        <Box mt={3}>
          <Table style={{ borderCollapse: "collapse", tableLayout: isTablet ? "auto" : "fixed", width: "100%" }}>
            <TableHead  style={{ display: "table-header-group" }}>
              <TableRow style={{ backgroundColor: "#F2B600", height: isTablet ? "50px" : "60px" }}>
                <TableCell align="center" style={{ fontWeight: "bold" }}>คลัง</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold" }}>ใช้งานได้</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {warehouseData.map((warehouse) => (
                <TableRow key={warehouse.wh_id}>
                  <TableCell align="center">{warehouse.wh_name}</TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={warehouseCheckedState[warehouse.wh_id] || false}
                      onChange={() => handleWarehouseCheckboxChange(warehouse.wh_id)}
                      color="primary"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      <SweetAlertComponent
      show={alert.show}
      type={alert.type}
      title={alert.title}
      message={alert.message}
      onConfirm={() => setAlert({ ...alert, show: false })}
    />
    </Box>
    
  );
};

export default RoleManagementTable;
