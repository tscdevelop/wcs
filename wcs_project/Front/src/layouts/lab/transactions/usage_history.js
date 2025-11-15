import React, { useEffect, useState } from "react";
import {
  Card,
  Grid,
  InputAdornment,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SweetAlertComponent from "../components/sweetAlert";
import ReusableDataTable from "../components/table_component_v2";
import WaitingFormDialog from "./usage_form";
import ScanQtyDialog from "./scan_qty_form";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WaitingAPI from "api/WaitingAPI";
import ExecutionAPI from "api/TaskAPI";

const UsageHistory = () => {
  const [loading, setLoading] = useState(true);
  const [deleteUsage, setDeleteUsage] = useState(""); 
  const [alert, setAlert] = useState({ show: false, type: "success", title: "", message: "" });
  const [waitingList, setWaitingList] = useState([]);
  const [filteredWaiting, setFilteredWaiting] = useState([]);
  const [searchWaiting, setSearchWaiting] = useState({ date: "", time: "" });

  // Waiting Form Dialog
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingUsage, setEditingUsage] = useState(null);

  // Scan Qty Dialog
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Confirm Delete
  const [confirmAlert, setConfirmAlert] = useState(false);

  // --- Fetch Data ---
  const fetchDataAll = async () => {
    try {
      const response = await WaitingAPI.WaitingUsageAll();
      const list = Array.isArray(response?.data) ? response.data : [];
      setWaitingList(list);
    } catch (error) {
      console.error(error);
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

  // --- Waiting Form Handlers ---
  const handleAdd = () => {
    setFormMode("create");
    setEditingUsage(null);
    setFormOpen(true);
  };

  const fetchDataById = async (order_id) => {
    try {
      const response = await WaitingAPI.getUsageByID(order_id);
      if (response.isCompleted) {
        const data = response.data;
        setEditingUsage({
          order_id: data.order_id,
          type: data.type ?? "",
          status: data.status ?? "",
          work_order: data.work_order ?? "",
          usage_num: data.usage_num ?? "",
          line: data.line ?? "",
          stock_item: data.stock_item ?? "",
          plan_qty: data.plan_qty ?? 0,
          from_location: data.from_location ?? "",
          usage_type: data.usage_type ?? "",
          cond: data.cond ?? "",
          split: data.split ?? "",
          actual_qty: data.actual_qty ?? 0,
          is_confirm: data.is_confirm ?? false,
        });
        setFormOpen(true);
      } else {
        console.error("Failed to fetch usage:", response.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (row) => {
    setFormMode("edit");
    fetchDataById(row.order_id);
  };

  const handleSubmitUser = async (payload) => {
    try {
      const finalPayload = { ...payload, store_type: "T1M", priority: 5, type: "USAGE", usage_type: "ISSUE" };
      let res;
      if (formMode === "edit") {
        res = await WaitingAPI.updateWaiting(editingUsage.order_id, finalPayload);
      } else {
        res = await WaitingAPI.createWaiting(finalPayload);
      }
      if (res?.isCompleted) {
        setAlert({ show: true, type: "success", title: formMode === "edit" ? "Updated" : "Created", message: res.message });
        await fetchDataAll();
        return true;
      }
      setAlert({ show: true, type: "error", title: "Error", message: res?.message || "Failed" });
      return false;
    } catch (err) {
      console.error(err);
      setAlert({ show: true, type: "error", title: "Error", message: err?.response?.data?.message || "Unexpected error" });
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      const response = await WaitingAPI.deleteWaiting(deleteUsage);
      if (response.isCompleted) {
        setAlert({ show: true, type: "success", title: "Success", message: response.message });
        await fetchDataAll();
      } else {
        setAlert({ show: true, type: "error", title: "Error", message: response.message });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmAlert(false);
    }
  };

  const columns = [
    { field: "requested_at", label: "Date" },
    { field: "requested_by", label: "User" },
    { field: "work_order", label: "Work Order" },
    { field: "usage_num", label: "Usage" },
    { field: "line", label: "Line" },
    { field: "stock_item", label: "Stock Item ID" },
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
      type: "confirmSku",
    },
  ];



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2}>
          <MDTypography variant="h3">Usage History</MDTypography>
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
                  InputProps={{ endAdornment: (<InputAdornment position="end"><CalendarMonthIcon fontSize="small" /></InputAdornment>) }}
                />
              </Grid>
              <Grid item xs={3}>
                <MDTypography variant="h6">Time</MDTypography>
                <MDInput
                  placeholder="-- : --"
                  value={searchWaiting.time}
                  onChange={(e) => setSearchWaiting({ ...searchWaiting, time: e.target.value })}
                  InputProps={{ endAdornment: (<InputAdornment position="end"><AccessTimeIcon fontSize="small" /></InputAdornment>) }}
                />
              </Grid>
            </Grid>

            <MDBox mb={5} display="flex" justifyContent="flex-end">
              <MDButton color="dark" onClick={handleAdd}>Create</MDButton>
            </MDBox>

            {loading ? (<div>Loading...</div>) : (
              <ReusableDataTable
                columns={columns}
                rows={filteredWaiting}
                idField="order_id"
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50]}
                showActions={["edit", "delete"]}
                onEdit={(row) => row.status === "WAITING" ? handleEditClick(row) : null}
                onDelete={(row) => ["WAITING","QUEUED","FINISHED","CANCELLED","FAILED"].includes(row.status) ? (() => { setDeleteUsage(row.order_id); setConfirmAlert(true); })() : null }
                confirmSkuDisabled={(row) => row.status !== "AISLE_OPEN"}
                onConfirmSku={(row) => { setSelectedOrder(row); setScanDialogOpen(true); }}
              />
            )}
          </MDBox>
        </Card>
      </MDBox>

      {/* Scan Qty Dialog */}
      <ScanQtyDialog
        open={scanDialogOpen}
        order={selectedOrder}
        onClose={() => setScanDialogOpen(false)}
        onSubmit={async (order_id, actual_qty) => {
          try {
            const response = await ExecutionAPI.handleOrderItem(order_id, actual_qty);
            if (response.isCompleted) {
              setAlert({ show: true, type: "success", title: "Confirmed", message: response.message });
              await fetchDataAll();
            } else {
              setAlert({ show: true, type: "error", title: "Error", message: response.message || "Failed" });
            }
          } catch (err) {
            console.error(err);
          } finally {
            setScanDialogOpen(false);
          }
        }}
      />

      {/* Waiting Form Dialog */}
      <WaitingFormDialog
        open={formOpen}
        mode={formMode}
        initialData={editingUsage}
         onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitUser}
      />

      {/* Delete Confirm */}
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

      {/* Alert */}
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
