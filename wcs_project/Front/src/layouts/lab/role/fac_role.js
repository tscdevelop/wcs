import { React, useState } from "react"; // นำเข้า useState และ useEffect จาก React
import { Grid, Card } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
// import { useNavigate } from "react-router-dom"; // นำเข้า Link และ useNavigate สำหรับการจัดการ routing
import * as lang from "utils/langHelper";
import RoleManagementTable from "../components/role_component";
import MDTypography from "components/MDTypography";
import ButtonComponent from "../components/ButtonComponent";
import AccessAPI from "api/AccessAPI";
import { useNavigate } from "react-router-dom";
import SweetAlertComponent from "../components/sweetAlert";
const RoleFactory = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const roleCode = searchParams.get("role_code");
  const empName = searchParams.get("emp_name");
  const userID = parseInt(searchParams.get("user_id"), 10); // เปลี่ยนเป็นตัวเลข
  // const navigate = useNavigate();
  const [factoryCheckedState, setFactoryCheckedState] = useState({});
  const [warehouseCheckedState, setWarehouseCheckedState] = useState({});

   const [alert, setAlert] = useState({
      show: false,
      type: "success",
      title: "",
      message: "",
    });

    const handleCreateAccess = async () => {
      try {
        // ตรวจสอบค่าก่อนใช้งาน
        const hasFactorySelected = Object.values(factoryCheckedState || {}).some((val) => val);
        const hasWarehouseSelected = Object.values(warehouseCheckedState || {}).some((val) => val);
    
        if (!hasFactorySelected || !hasWarehouseSelected) {
          setAlert({
            show: true,
            type: "error",
            title: "ข้อผิดพลาด",
            message: "กรุณาเลือกข้อมูลโรงงานและคลังให้ครบถ้วน",
          });
          return;
        }
    
        // สร้าง payload สำหรับส่ง API
        const fty_ids = Object.keys(factoryCheckedState || {})
          .filter((key) => factoryCheckedState[key])
          .map(Number);
        const wh_ids = Object.keys(warehouseCheckedState || {})
          .filter((key) => warehouseCheckedState[key])
          .map(Number);
    
        const payload = {
          user_id: userID,
          fty_ids,
          wh_ids,
        };
    
        console.log("📌 Payload ที่ส่งไปยัง API:", payload);
    
        // เรียก API
        const response = await AccessAPI.createAccess(payload);
        if (response.isCompleted) {
          setAlert({
            show: true,
            type: "success",
            title: "ดำเนินการสำเร็จ",
            message: response.message,
          });
    
          setTimeout(() => {
            navigate("/data/role");
          }, 1500);
        } else {
          setAlert({
            show: true,
            type: "error",
            title: "เกิดข้อผิดพลาด",
            message: response.message,
          });
        }
      } catch (error) {
        console.error("❌ Error creating access:", error);
      }
    };
    

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/data/role");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2} ml={5}>
          <MDTypography variant="h3" color="inherit" fontWeight="bold">
            ตั้งค่า / สิทธิ์การเข้าใช้งาน
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox mt={2}>
        <Card>
          <MDBox p={2}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6} lg={6}>
                <Grid container>
                  <Grid item xs={12} sm={4} lg={3}>
                    <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                      <MDTypography variant="body02" color="inherit">
                        ชื่อ-นานสกุล
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={8} lg={9}>
                    <MDInput
                      name="empName"
                      variant="outlined"
                      value={empName}
                      onChange
                      sx={{ width: "100%", height: "auto", maxWidth: "100%" }}
                      disabled
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6} lg={6}>
                <Grid container>
                  <Grid item xs={12} sm={4} lg={3}>
                    <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                      <MDTypography variant="body02" color="inherit">
                        {lang.msg("role.role_code")}
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={8} lg={9}>
                    <MDInput
                      name="roleCode"
                      value={roleCode}
                      disabled
                      // onChange={(e) => setFormData({ ...formData, role_code: e.target.value.toUpperCase() })}
                      sx={{ width: "100%", height: "auto", maxWidth: "100%" }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>

      <MDBox mt={5}>
        <Card>
          <MDBox mt={3} p={3}>
            <RoleManagementTable
              userID={userID}
              onStateChange={({ factoryCheckedState, warehouseCheckedState }) => {
                setFactoryCheckedState(factoryCheckedState);
                setWarehouseCheckedState(warehouseCheckedState);
              }} // ส่งฟังก์ชันไปยัง RoleManagementTable
            />
          </MDBox>
          <Grid container>
        <Grid item xs={12}>
          <MDBox m={3} display="flex" alignItems="center" justifyContent="flex-end" mt="20px" gap={3}>
            <ButtonComponent type="cancel" onClick={handleCancel}>
              {lang.btnCancel()}
            </ButtonComponent>
            <ButtonComponent type="ConfirmUse" onClick={handleCreateAccess} />
          </MDBox>
        </Grid>
      </Grid>
        </Card>
      </MDBox>

     
          <SweetAlertComponent
              show={alert.show}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onConfirm={() => setAlert({ ...alert, show: false })}
            />
    </DashboardLayout>
  );
};
export default RoleFactory;
