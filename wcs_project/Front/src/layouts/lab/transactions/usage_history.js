import React, { useEffect, useState } from "react";
import { Grid, Card, InputAdornment, FormControl } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { StyledMenuItem, StyledSelect } from "common/Global.style";
import SweetAlertComponent from "../components/sweetAlert";
import ReusableDataTable from "../components/table_component_v2";
import WaitingFormDialog from "./usage_form";
import ScanQtyDialog from "./scan_qty_form";

import { StoreType } from "common/dataMain";
import WaitingAPI from "api/WaitingAPI";
import ExecutionAPI from "api/TaskAPI";

const UsageHistory = () => {
  const [loading, setLoading] = useState(true);
  const [deleteUsage, setDeleteUsage] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  const [waitingList, setWaitingList] = useState([]);
  const [filteredWaiting, setFilteredWaiting] = useState([]);
  const [searchWaiting, setSearchWaiting] = useState({ date: "", time: "" });

  // Dialog States
  const location = useLocation();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingUsage, setEditingUsage] = useState(null);

  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delete confirm
  const [confirmAlert, setConfirmAlert] = useState(false);

  // Store Type Filter
  const [storeType, setStoreType] = useState("");

  const navigate = useNavigate();

  /* ---------------------- Fetch All Usage Waiting ---------------------- */
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

  /* ---------------------- Filter Logic ---------------------- */
  useEffect(() => {
    const filtered = waitingList.filter((item) => {
      const matchesDate = (item.requested_at || "").includes(searchWaiting.date);
      const matchesTime = (item.requested_at || "").includes(searchWaiting.time);
      const matchesStore = storeType === "" || item.store_type === storeType;

      return matchesDate && matchesTime && matchesStore;
    });

    setFilteredWaiting(filtered);
  }, [waitingList, searchWaiting, storeType]);

  /* ---------------------- Form Handlers ---------------------- */
  const handleAdd = () => {
    setFormMode("create");
    setEditingUsage(null);
    setFormOpen(true);
  };

  // 🔹 เปิดอัตโนมัติถ้ามี state autoCreate
  useEffect(() => {
    if (location.state?.autoCreate) {
      handleAdd();
    }
  }, [location.state]);

  const fetchDataById = async (order_id) => {
    try {
      const response = await WaitingAPI.getUsageByID(order_id);

      if (response.isCompleted) {
        const data = response.data;

        setEditingUsage({
          order_id: data.order_id,
          type: data.type ?? "",
          status: data.status ?? "",
          mc_code: data.mc_code ?? "",
          work_order: data.work_order ?? "",
          usage_num: data.usage_num ?? "",
          line: data.line ?? "",
          plan_qty: data.plan_qty ?? 0,
          usage_type: data.usage_type ?? "",
          cond: data.cond ?? "",
          split: data.split ?? "",
          is_confirm: data.is_confirm ?? false,
          item_id: data.item_id ?? "",
          stock_item: data.stock_item ?? "",
          item_name: data.item_name ?? "",
          loc_id: data.loc_id ?? "",
          loc: data.loc ?? "",
          box_loc: data.box_loc ?? ""
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
    // สร้าง payload ใหม่ให้เป็นรูปแบบที่ backend ต้องการ
    const finalPayload = {
      type: "USAGE",
      item_id: payload.item_id,
      mc_code: payload.mc_code,
      loc_id: payload.loc_id,
      cond: payload.cond,
      plan_qty: payload.plan_qty,
      usage: {
        work_order: payload.work_order,
        usage_num: payload.usage_num,
        line: payload.line,
        usage_type: payload.usage_type,
        split: payload.split
      }
    };

      let res;

      if (formMode === "edit") {
        res = await WaitingAPI.updateWaiting(editingUsage.order_id, finalPayload);
      } else {
        res = await WaitingAPI.createWaiting(finalPayload);
      }

      if (res?.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: formMode === "edit" ? "Updated" : "Created",
          message: res.message,
          onConfirm: () => {
            // ไปหน้า WaitingExecutionPage หลังจากกด OK
            if (formMode === "create") {
              navigate("/order/list");
            }
          },
        });

        await fetchDataAll();
        return true;
      }

      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: res?.message || "Failed",
      });

      return false;
    } catch (err) {
      console.error(err);

      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: err?.response?.data?.message || "Unexpected error",
      });

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
      console.error(error);
    } finally {
      setConfirmAlert(false);
    }
  };

  /* ---------------------- Table Columns ---------------------- */
  const columns = [
    { field: "requested_at", label: "Date" },
    { field: "requested_by", label: "User" },
    { field: "work_order", label: "Work Order" },
    { field: "usage_num", label: "Usage" },
    { field: "line", label: "Line" },
    { field: "stock_item", label: "Stock Item ID" },
    { field: "item_name", label: "Stock Item Name" },
    { field: "loc", label: "Source Location" },
    { field: "box_loc", label: "Source Box Location" },
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

  /* ---------------------- UI ---------------------- */
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox mt={5}>
        <MDTypography variant="h3" mb={2}>
          Usage History
        </MDTypography>

        {/* Navigate Button */}
        <MDBox display="flex" justifyContent="flex-end" px={3}>
          <MDButton variant="contained" color="success" onClick={() => navigate("/order/list")}>
            Orders
          </MDButton>
        </MDBox>

        <MDBox mt={3}>
          <Card>
            <MDBox mt={3} p={3}>
              {/* Filters */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={3}>
                  <MDTypography variant="h6">Date</MDTypography>
                  <MDInput
                    fullWidth
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
                    sx={{ height: "45px" }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <MDTypography variant="h6">Time</MDTypography>
                  <MDInput
                    fullWidth
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
                    sx={{ height: "45px" }}
                  />
                </Grid>

                {/* Store Type Drop-down */}
                <Grid item xs={12} md={3}>
                  <MDTypography variant="h6">Store Type</MDTypography>
                  <FormControl fullWidth>
                    <StyledSelect
                      sx={{ width: "100%", height: "45px" }}
                      name="storeType"
                      value={storeType}
                      onChange={(e) => setStoreType(e.target.value)}
                      displayEmpty
                    >
                      <StyledMenuItem value="">All Store Types</StyledMenuItem>

                      {StoreType.map((s) => (
                        <StyledMenuItem key={s.value} value={s.value}>
                          {s.text}
                        </StyledMenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </Grid>
                {/* Create button */}
                <Grid item xs={12} md={3} display="flex" alignItems="flex-end" justifyContent="flex-end">
                  <MDButton color="dark" onClick={handleAdd}>
                    + New Order
                  </MDButton>
                </Grid>
              </Grid>

              {/* Table */}
              {loading ? (
                <div>Loading...</div>
              ) : (
                <ReusableDataTable
                  columns={columns}
                  rows={filteredWaiting}
                  idField="order_id"
                  defaultPageSize={10}
                  pageSizeOptions={[10, 25, 50]}
                  showActions={["edit", "delete"]}
                  onEdit={(row) => (row.status === "WAITING" ? handleEditClick(row) : null)}
                  onDelete={(row) =>
                    ["WAITING"].includes(row.status)
                      ? (() => {
                          setDeleteUsage(row.order_id);
                          setConfirmAlert(true);
                        })()
                      : null
                  }
                  confirmSkuDisabled={(row) => row.status !== "AISLE_OPEN"}
                  onConfirmSku={(row) => {
                    setSelectedOrder(row);
                    setScanDialogOpen(true);
                  }}
                />
              )}
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      {/* Scan Qty Dialog */}
      {selectedOrder && (
        <ScanQtyDialog
          open={scanDialogOpen}
          order={selectedOrder}
          onClose={() => setScanDialogOpen(false)}
          onSubmit={async (order_id, actual_qty) => {
            try {
              const response = await ExecutionAPI.handleOrderItem(order_id, actual_qty);

              if (response.isCompleted) {
                setAlert({
                  show: true,
                  type: "success",
                  title: "Confirmed",
                  message: response.message,
                });

                await fetchDataAll();
              } else {
                setAlert({
                  show: true,
                  type: "error",
                  title: "Error",
                  message: response.message || "Failed",
                });
              }
            } catch (err) {
              console.error(err);
            } finally {
              setScanDialogOpen(false);
            }
          }}
        />
      )}

      {/* Waiting Form Dialog */}
      <WaitingFormDialog
        open={formOpen}
        mode={formMode}
        initialData={editingUsage}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitUser}
      />

      {/* Delete Confirm Popup */}
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

      {/* General Alert */}
      <SweetAlertComponent
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={() => {
          alert.onConfirm?.(); // เรียก callback
          setAlert({ ...alert, show: false });
        }}
      />
    </DashboardLayout>
  );
};

export default UsageHistory;
