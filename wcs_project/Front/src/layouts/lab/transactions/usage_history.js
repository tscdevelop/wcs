import React, { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
import { Card, Grid, InputAdornment } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import SweetAlertComponent from "../components/sweetAlert";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
import { useNavigate } from "react-router-dom"; // นำเข้า Link และ useNavigate สำหรับการจัดการ routing
// import TableComponent from "../components/table_component";
import MDTypography from "components/MDTypography";
import WaitingAPI from "api/WaitingAPI";
// import { GlobalVar } from "../../../common/GlobalVar";
import ReusableDataTable from "../components/table_component_v2";
import MDButton from "components/MDButton";
import WaitingFormDialog from "./usage_form";
import MDInput from "components/MDInput";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TaskAPI from "api/TaskAPI";

const UsageHistory = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  // const [waitingAll, setWaitingAll] = useState([]);
  const [deleteUsage, setDeleteUsage] = useState(""); // รหัสที่จะลบ
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [waitingList, setWaitingList] = useState([]);
  const [filteredWaiting, setFilteredWaiting] = useState([]);
  const [searchWaiting, setSearchWaiting] = useState({ date: "", time: "" });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [editingUsage, setEditingUsage] = useState(null);

  const fetchDataAll = async () => {
    try {
      const response = await WaitingAPI.WaitingUsageAll();

      const list = Array.isArray(response?.data?.data) ? response.data.data : [];
      setWaitingList(list);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setWaitingList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAll();
  }, []);

  // --- Filter Logic ---
  useEffect(() => {
    const filtered = waitingList.filter(
      (item) =>
        (item.requested_at || "").includes(searchWaiting.date) &&
        (item.requested_at || "").includes(searchWaiting.time)
    );
    setFilteredWaiting(filtered);
  }, [waitingList, searchWaiting]);

  const handleAdd = () => {
    setFormMode("create");
    setEditingUsage(null);
    setFormOpen(true);
  };

  const fetchDataById = async (waiting_id) => {
    try {
      const response = await WaitingAPI.getUsageByID(waiting_id);
      console.log("Usage By ID: ", response);
      if (response.isCompleted) {
        const data = response.data;
        setEditingUsage({
          waiting_id: data.waiting_id,
          type: data.type ?? "",
          status: data.status ?? "",
          work_order: data.work_order ?? "",
          usage_num: data.usage_num ?? "",
          line: data.line ?? "",
          stock_item: data.stock_item ?? "",
          item_desc: data.item_desc ?? "",
          plan_qty: data.plan_qty ?? 0,
          from_location: data.from_location ?? "",
          usage_type: data.usage_type ?? "",
          cond: data.cond ?? "",
          split: data.split ?? "",
          actual_qty: data.actual_qty ?? 0,
          is_confirm: data.is_confirm ?? false,
        });
        setFormOpen(true); // เปิดฟอร์มหลังได้ข้อมูล
      } else {
        console.error("Failed to fetch usage:", response.message);
      }
    } catch (error) {
      console.error("Error fetching usage by id:", error);
    }
  };

  const handleEditClick = (row) => {
    setFormMode("edit");
    fetchDataById(row.waiting_id); // ใช้ waiting_id ดึงข้อมูล
  };

  const handleSubmitUser = async (payload) => {
    try {
      // ✅ เพิ่ม default field ที่ต้องบังคับส่งเสมอ
      const finalPayload = {
        ...payload,
        store_type: "T1M",
        priority: 5,
        type: "USAGE",
        usage_type: "ISSUE",
      };

      let res;
      if (formMode === "edit") {
        res = await WaitingAPI.updateWaiting(editingUsage.waiting_id, finalPayload);
      } else {
        res = await WaitingAPI.createWaiting(finalPayload);
      }

      if (res?.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: formMode === "edit" ? "Updated" : "Created",
          message: res.message,
        });
        await fetchDataAll();
        return true;
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "Error",
          message: res?.message || "Failed",
        });
        return false;
      }
    } catch (err) {
      console.error("Error in handleSubmitUser:", err);
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      const response = await WaitingAPI.deleteWaiting(deleteUsage);
      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "Success",
          message: response.message,
        });
        await fetchDataAll();
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "Error",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("Error during submit:", error);
    } finally {
      setConfirmAlert(false); // ซ่อน SweetAlert ยืนยัน
    }
  };

  const columns = [
    { field: "requested_at", label: "Date" },
    { field: "requested_by", label: "User" },
    { field: "work_order", label: "Work Order" },
    { field: "usage_num", label: "Usage" },
    { field: "line", label: "Line" },
    { field: "stock_item", label: "Stock Item ID" },
    { field: "item_desc", label: "Stock Item Description" },
    { field: "from_location", label: "From Location" },
    { field: "usage_type", label: "Usage Type" },
    { field: "cond", label: "Condition" },
    { field: "split", label: "Split" },
    { field: "actual_qty", label: "Scanned Quantity" },
    { field: "plan_qty", label: "Quantity to be handled" },
    { field: "status", label: "Order Status" },
    {
      field: "is_confirm",
      label: "Confirm",
      type: "confirmSku", // บอกว่าเป็นปุ่ม confirm
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2}>
          <MDTypography variant="h3" color="inherit">
            Usage History
          </MDTypography>
        </MDBox>
      </MDBox>

      <MDBox mt={5}>
        <Card>
          <MDBox mt={3} p={3}>
            <Grid container spacing={1} mb={1}>
              <Grid item xs={3}>
                <MDTypography variant="h6">Date</MDTypography>
                <MDInput
                  placeholder="dd/mm/yyyy"
                  value={searchWaiting.date}
                  onChange={(e) => setSearchWaiting({ ...searchWaiting, date: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarMonthIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <MDTypography variant="h6">Time</MDTypography>
                <MDInput
                  placeholder="-- : --"
                  value={searchWaiting.time}
                  onChange={(e) => setSearchWaiting({ ...searchWaiting, time: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <AccessTimeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <MDBox mb={5} display="flex" justifyContent="flex-end">
              <MDButton color="dark" onClick={handleAdd}>
                Create
              </MDButton>
            </MDBox>
            {/* <ReusableDataTable
              columns={columns}
              rows={filteredWaiting}
              idField="waiting_id"
              defaultPageSize={10}
              pageSizeOptions={[10, 25, 50]}
              showActions={["edit", "delete"]}
              onEdit={(row) => {
                if (row.status === "WAITING") {
                  handleEditClick(row);
                } else {
                  alert("You can only edit rows with status WAITING.");
                }
              }}
              onDelete={(row) => {
                if (["WAITING", "COMPLETED", "CANCELLED"].includes(row.status)) {
                  setDeleteUsage(row.waiting_id);
                  setConfirmAlert(true);
                } else {
                  alert("You cannot delete this row.");
                }
              }} */}
            <ReusableDataTable
              columns={columns}
              rows={filteredWaiting}
              idField="waiting_id"
              defaultPageSize={10}
              pageSizeOptions={[10, 25, 50]}
              showActions={["edit", "delete"]}
              onEdit={(row) => {
                // ถ้า status ไม่ตรง ให้ return null → ปุ่มจะซ่อน
                return row.status === "WAITING" ? handleEditClick(row) : null;
              }}
              onDelete={(row) => {
                return ["WAITING", "COMPLETED", "CANCELLED"].includes(row.status)
                  ? (() => {
                      setDeleteUsage(row.waiting_id);
                      setConfirmAlert(true);
                    })()
                  : null;
              }}
              // ✅ กำหนดว่า disable ปุ่ม confirm ตาม status
              confirmSkuDisabled={(row) => row.status !== "WAITING_CONFIRM"}
              // ✅ callback เวลากด confirm
              onConfirmSku={async (row) => {
                try {
                  const taskItem = waitingList.find((item) => item.waiting_id === row.waiting_id);
                  if (!taskItem || !taskItem.task_id) {
                    alert("Cannot find corresponding task ID");
                    return;
                  }
                  console.log("task_id", taskItem);
                  const response = await TaskAPI.confirm(taskItem.task_id);
                  console.log("after task_id", response);
                  if (response.isCompleted) {
                    setAlert({
                      show: true,
                      type: "success",
                      title: "Confirmed",
                      message: response.message,
                    });
                    await fetchDataAll(); // refresh table
                  } else {
                    setAlert({
                      show: true,
                      type: "error",
                      title: "Error",
                      message: response.message || "Failed to confirm",
                    });
                  }
                } catch (err) {
                  console.error("Confirm error:", err);
                }
              }}
            />
          </MDBox>
        </Card>
      </MDBox>

      {/* Pop-up */}
      <WaitingFormDialog
        open={formOpen}
        mode={formMode}
        initialData={editingUsage}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitUser}
      />

      {confirmAlert && (
        <SweetAlertComponent
          type="error"
          title="Confirm Deletion"
          message="Are you sure you want to delete this data?"
          show={confirmAlert}
          showCancel
          confirmText="OK"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setConfirmAlert(false)}
        />
      )}
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
export default UsageHistory;
