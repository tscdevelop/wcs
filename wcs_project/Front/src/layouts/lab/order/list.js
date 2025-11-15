// import React, { useState, useEffect } from "react";
// import {
//   Grid,
//   Card,
//   IconButton,
//   InputAdornment,
// } from "@mui/material";
// import AddCircleIcon from "@mui/icons-material/AddCircle";
// import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
// import SearchIcon from "@mui/icons-material/Search";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import MDBox from "components/MDBox";
// import MDTypography from "components/MDTypography";
// import MDInput from "components/MDInput";
// import ReusableDataTable from "../components/table_component_v2";
// import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
// import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// import WaitingAPI from "api/WaitingAPI";

// const WaitingExecutionPage = () => {
//   const [waitingList, setWaitingList] = useState([
//     { id: 1, orderId: "ORD-001", customer: "A", qty: 10, location: "T1" },
//     { id: 2, orderId: "ORD-002", customer: "B", qty: 5, location: "T2" },
//   ]);
//   const [executionList, setExecutionList] = useState([]);

//   const [selectedWaiting, setSelectedWaiting] = useState(null);
//   const [selectedExecution, setSelectedExecution] = useState(null);

//   // ย้ายจาก Waiting -> Execution
//   const handleMoveToExecution = () => {
//     if (!selectedWaiting) return;
//     const record = waitingList.find((r) => r.id === selectedWaiting);
//     if (record) {
//       setWaitingList(waitingList.filter((r) => r.id !== selectedWaiting));
//       setExecutionList([...executionList, record]);
//       setSelectedWaiting(null);
//     }
//   };

//   // ย้ายจาก Execution -> Waiting
//   const handleMoveToWaiting = () => {
//     if (!selectedExecution) return;
//     const record = executionList.find((r) => r.id === selectedExecution);
//     if (record) {
//       setExecutionList(executionList.filter((r) => r.id !== selectedExecution));
//       setWaitingList([...waitingList, record]);
//       setSelectedExecution(null);
//     }
//   };

//   const columns = [
//     { field: "requested_at", label: "Date/Time" },
//     { field: "order_id", label: "Order ID" },
//     { field: "requested_by", label: "Customer" },
//     { field: "plan_qty", label: "QTY" },
//     { field: "from_location", label: "Location" },
//   ];

//   const columnsExecute = [
//     { field: "date", label: "Date/Time" },
//     { field: "orderId", label: "Order ID" },
//     { field: "customer", label: "Customer" },
//     { field: "qty", label: "QTY" },
//     { field: "location", label: "Location" },
//     { field: "status", label: "Status" },
//   ];

//     const [loading, setLoading] = useState(true);
//     const [waitingAll, setWaitingAll] = useState([]);

//     const fetchDataAll = async () => {
//         try {
//             const response = await WaitingAPI.WaitingAll();
//              console.log("Waiting API response:", response);
//             if (response?.isCompleted) {
//                 setWaitingAll(response.data);
//             } else {
//                 console.error("API response error: ", response?.message);
//             }
//         } catch (error) {
//             console.error("Error fetching data: ", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchDataAll();
//     }, []);

//   return (
//     <DashboardLayout>
//       <DashboardNavbar />
//       <MDBox mt={5}>
//         <MDTypography variant="h3" mb={2}>
//           Waiting and Execution List
//         </MDTypography>
//         <Grid container spacing={1.5} alignItems="stretch">
//         {/* LEFT: Waiting List */}
//         <Grid item xs={12} md={5.8} sx={{ mx: 0 }}>
//             <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: "500px" }}>

//                 <MDTypography variant="h5" mb={1}>
//                     Waiting List
//               </MDTypography>

//               {/* Filters */}
//               <Grid container spacing={1} mb={1}>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Date</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="dd/mm/yyyy"

//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <CalendarMonthIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Time</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="-- : -- AM/PM"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <AccessTimeIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Order ID</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="Order ID"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <SearchIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Customer</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="Customer"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <SearchIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Location</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="Location"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <SearchIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//               </Grid>

//               {/* Table (fixed height zone) */}
//               <MDBox sx={{ fontSize: "0.85rem", maxHeight: "600px", overflowY: "auto" }}>
//                 <ReusableDataTable
//                   columns={columns}
//                   rows={waitingAll}
//                   idField="id"
//                   onRowClick={(row) => setSelectedWaiting(row.id)}
//                   selectedId={selectedWaiting}
//                 />
//               </MDBox>
//             </Card>
//           </Grid>

//         {/* CENTER: + / - */}
//         <Grid
//             item
//             xs={12}
//             md={0.4}
//             container
//             direction="column"
//             alignItems="center"
//             justifyContent="center"
//             sx={{ gap: 3 }}  // 🔥 ลดช่องว่างปุ่มให้ชิดกว่าเดิม
//         >
//             <IconButton
//             color="primary"
//             onClick={handleMoveToExecution}
//             disabled={!selectedWaiting}
//             sx={{ p: 0.3 }}
//             >
//             <AddCircleIcon sx={{ fontSize: 36 }} />
//             </IconButton>
//             <IconButton
//             color="error"
//             onClick={handleMoveToWaiting}
//             disabled={!selectedExecution}
//             sx={{ p: 0.3 }}
//             >
//             <RemoveCircleIcon sx={{ fontSize: 36 }} />
//             </IconButton>
//         </Grid>

//         {/* RIGHT: Execution List */}
//         <Grid item xs={12} md={5.8} sx={{ mx: 0 }}>
//            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: "500px" }}>
//               <MDTypography variant="h5" mb={1}>
//                 Execution List
//               </MDTypography>

//               {/* Filters */}
//               <Grid container spacing={1} mb={1}>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Date</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="dd/mm/yyyy"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <CalendarMonthIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Time</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="-- : -- AM/PM"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <AccessTimeIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Order ID</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="Order ID"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <SearchIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Customer</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="Customer"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <SearchIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Location</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="Location"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <SearchIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                     <MDBox>
//                         <MDTypography variant="h6">Status</MDTypography>
//                     </MDBox>
//                   <MDInput
//                     placeholder="Status"
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <SearchIcon fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
//               </Grid>

//               {/* Table */}
//               <MDBox sx={{ fontSize: "0.85rem", maxHeight: "600px", overflowY: "auto" }}>
//                 <ReusableDataTable
//                   columns={[...columnsExecute]}
//                   rows={executionList}
//                   idField="id"
//                   onRowClick={(row) => setSelectedExecution(row.id)}
//                   selectedId={selectedExecution}
//                 />
//               </MDBox>
//             </Card>
//           </Grid>
//         </Grid>
//       </MDBox>
//     </DashboardLayout>
//   );
// };

// export default WaitingExecutionPage;

import React, { useState, useEffect } from "react";
import { Grid, Card, IconButton, InputAdornment } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import ReusableDataTable from "../components/table_component_v2";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import WaitingAPI from "api/WaitingAPI";
import ExecutionAPI from "api/TaskAPI";
import SweetAlertComponent from "../components/sweetAlert";

const WaitingExecutionPage = () => {
  const [waitingList, setWaitingList] = useState([]);
  const [executionList, setExecutionList] = useState([]);
  const [filteredWaiting, setFilteredWaiting] = useState([]);
  const [filteredExecution, setFilteredExecution] = useState([]);
  const [searchWaiting, setSearchWaiting] = useState({ date: "", time: "" });
  const [searchExecution, setSearchExecution] = useState({ date: "", time: "" });
  const [selectedWaiting, setSelectedWaiting] = useState(null); // store id
  const [selectedExecution, setSelectedExecution] = useState(null); // store id
  const [loading, setLoading] = useState(false);
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // ฟังก์ชันที่จะรันหลัง confirm
  const [confirmMessage, setConfirmMessage] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });


  // --- Fetch Data ---
  const fetchDataWaitingAll = async () => {
    setLoading(true);
    try {
      const response = await WaitingAPI.WaitingAll();
      const list = Array.isArray(response?.data) ? response.data : [];
      setWaitingList(list);
    } catch (err) {
      console.error(err);
      setWaitingList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataExecuteAll = async () => {
    setLoading(true);
    try {
      const response = await ExecutionAPI.TaskAll();
      const list = Array.isArray(response?.data) ? response.data : [];
      setExecutionList(list);
    } catch (err) {
      console.error(err);
      setExecutionList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataWaitingAll();
    fetchDataExecuteAll();
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

  useEffect(() => {
    const filtered = executionList.filter(
      (item) =>
        (item.requested_at || "").includes(searchExecution.date) &&
        (item.requested_at || "").includes(searchExecution.time)
    );
    setFilteredExecution(filtered);
  }, [executionList, searchExecution]);

  // --- + (Move to Execution) ---
const handleMoveToExecution = async () => {
  if (!selectedWaiting) return;

  const row = waitingList.find((item) => item.order_id === selectedWaiting);
  if (!row) return;

  const payload = { 
    order_id: row.order_id 
  };

  console.log("Sending payload:", payload);

  try {
    const response = await ExecutionAPI.createTask(payload);

    // ❌ ถ้า API ส่งว่าไม่สำเร็จ → ขึ้น error alert + return
    if (!response?.isCompleted) {
      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: response?.message || "API rejected",
      });
      return;
    }

    // ✅ ถ้าสำเร็จ → ทำงานต่อ
    await Promise.all([fetchDataWaitingAll(), fetchDataExecuteAll()]);
    setSelectedWaiting(null);

    setAlert({
      show: true,
      type: "success",
      title: "Success",
      message: "Confirm to execution list",
    });

  } catch (err) {
    console.error("API error:", err.response?.data || err);

    setAlert({
      show: true,
      type: "error",
      title: "Error",
      message: err.response?.data?.message || "Something went wrong",
    });
  }
};


  // --- - (Delete Execution Task) ---
const handleDeleteTask = async () => {
  if (!selectedExecution) return;

  const row = executionList.find((item) => item.order_id === selectedExecution);
  if (!row) return;

  try {
    const response = await ExecutionAPI.changeToWaiting(row.order_id);

    // ❌ ถ้า API ส่งว่าไม่สำเร็จ → ขึ้น error alert + return
    if (!response?.isCompleted) {
      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: response?.message || "API rejected",
      });
      return;
    }

    // ✅ ถ้าสำเร็จ → ทำงานต่อ
    await Promise.all([fetchDataWaitingAll(), fetchDataExecuteAll()]);
    setSelectedExecution(null);

    setAlert({
      show: true,
      type: "success",
      title: "Success",
      message: "Confirm to order list",
    });

  } catch (err) {
    console.error("API error:", err.response?.data || err);

    setAlert({
      show: true,
      type: "error",
      title: "เกิดข้อผิดพลาด",
      message: err.response?.data?.message || "Something went wrong",
    });
  }
};



  const columnsWaiting = [
    { field: "type", label: "Transaction Type" },
    { field: "requested_at", label: "Date" },
    { field: "stock_item", label: "Stock Item ID" },
    { field: "item_name", label: "Stock Item Name" },
    { field: "item_desc", label: "Stock Item Description" },
    { field: "from_location", label: "Location" },
    { field: "cond", label: "Condition" },
    { field: "plan_qty", label: "Quantity to be handled" },
    { field: "actual_qty", label: "Scanned Quantity" },
    { field: "status", label: "Status" },

  ];

  const columnsExecute = [
    { field: "type", label: "Transaction Type" },
    { field: "requested_at", label: "Date" },
    { field: "stock_item", label: "Stock Item ID" },
    { field: "item_name", label: "Stock Item Name" },
    { field: "item_desc", label: "Stock Item Description" },
    { field: "from_location", label: "Location" },
    { field: "cond", label: "Condition" },
    { field: "plan_qty", label: "Quantity to be handled" },
    { field: "actual_qty", label: "Scanned Quantity" },
    { field: "status", label: "Status" },

  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={5}>
        <MDTypography variant="h3" mb={2}>
          Waiting and Execution List
        </MDTypography>
        <Grid container spacing={1.5} alignItems="stretch">
          {/* LEFT: Waiting List */}
          <Grid item xs={12} md={5.8}>
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: "500px" }}>
              <MDTypography variant="h5" mb={1}>
                Waiting List
              </MDTypography>
              <Grid container spacing={1} mb={1}>
                <Grid item xs={6}>
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
                <Grid item xs={6}>
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
              <MDBox sx={{ fontSize: "0.85rem", maxHeight: "600px", overflowY: "auto" }}>
                <ReusableDataTable
                  columns={columnsWaiting}
                  rows={filteredWaiting}
                  idField="order_id"
                  onRowClick={(row) => setSelectedWaiting(row.order_id)} // เก็บ row ทั้งหมด
                  selectedId={selectedWaiting} // สำหรับ highlight
                  fontSize="0.8rem"
                  autoHeight
                  
                />
              </MDBox>
            </Card>
          </Grid>

          {/* MIDDLE Buttons */}
          <Grid
            item
            xs={12}
            md={0.4}
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ gap: 3 }}
          >
            <IconButton
              color="primary"
              onClick={() => {
    setConfirmMessage("Are you sure you want to move this Waiting to Execution?");
    setConfirmAction(() => handleMoveToExecution); // เก็บฟังก์ชันที่จะรัน
    setConfirmAlert(true); // เปิด SweetAlert
  }}
              disabled={!selectedWaiting || loading}
              sx={{ p: 0.3 }}
            >
              <AddCircleIcon sx={{ fontSize: 36 }} />
            </IconButton>
            <IconButton
              color="error"
                onClick={() => {
    setConfirmMessage("Are you sure you want to move this Execution to Waiting?");
    setConfirmAction(() => handleDeleteTask);
    setConfirmAlert(true);
  }}
              disabled={!selectedExecution || loading}
              sx={{ p: 0.3 }}
            >
              <RemoveCircleIcon sx={{ fontSize: 36 }} />
            </IconButton>
          </Grid>

          {/* RIGHT: Execution List */}
          <Grid item xs={12} md={5.8}>
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: "500px" }}>
              <MDTypography variant="h5" mb={1}>
                Execution List
              </MDTypography>
              <Grid container spacing={1} mb={1}>
                <Grid item xs={6}>
                  <MDTypography variant="h6">Date</MDTypography>
                  <MDInput
                    placeholder="dd/mm/yyyy"
                    value={searchExecution.date}
                    onChange={(e) =>
                      setSearchExecution({ ...searchExecution, date: e.target.value })
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarMonthIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MDTypography variant="h6">Time</MDTypography>
                  <MDInput
                    placeholder="-- : --"
                    value={searchExecution.time}
                    onChange={(e) =>
                      setSearchExecution({ ...searchExecution, time: e.target.value })
                    }
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
              <MDBox sx={{ fontSize: "0.85rem", maxHeight: "600px", overflowY: "auto" }}>
                <ReusableDataTable
                  columns={columnsExecute}
                  rows={filteredExecution}
                  idField="order_id"
                  onRowClick={(row) => setSelectedExecution(row.order_id)}
                  selectedId={selectedExecution}
                  fontSize="0.8rem"
                  autoHeight
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

{confirmAlert && (
  <SweetAlertComponent
    type="warning"
    title="Confirmation"
    message={confirmMessage}
    show={confirmAlert}
    showCancel
    confirmText="Yes"
    cancelText="No"
    onConfirm={() => {
      if (confirmAction) confirmAction(); // รันฟังก์ชันจริง
      setConfirmAlert(false); // ปิด alert
    }}
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

export default WaitingExecutionPage;
