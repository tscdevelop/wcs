import React, { useState, useEffect } from "react";
import { Card, Box, Grid,} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import CounterAPI from "api/CounterAPI";
import ReusableDataTable from "../components/table_component_v2";
import CounterBox from "../components/counter_box";
import ScanQtyDialog from "../transactions/scan_qty_form";
import SweetAlertComponent from "../components/sweetAlert";
import ExecutionAPI from "api/TaskAPI";

import { GlobalVar } from "common/GlobalVar";

const CheckOutTPage = () => {
  const [loading, setLoading] = useState(true);
  const [ordersList, setOrdersList] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  const storeType = GlobalVar.getStoreType();

  /* ---------------- Fetch Orders ---------------- */
  const fetchDataAll = async () => {
    setLoading(true);
    try {
      const response = await CounterAPI.getAllOrders({
        isExecution: true,
        store_type: storeType === "WCS" ? undefined : storeType,
      });
      setOrdersList(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      setOrdersList([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Fetch Counters ---------------- */
  const fetchCounters = async () => {
    try {
      const res = await CounterAPI.getCounterAll();
      const list = Array.isArray(res?.data)
        ? res.data.map(c => ({ ...c, color: c.color || "#FFFFFF" })) // default color
        : [];
      setCounters(list);
    } catch (err) {
      console.error(err);
      setCounters([]);
    }
  };

  useEffect(() => {
    fetchDataAll();
    fetchCounters();
  }, []);

  const counterGroups = React.useMemo(() => [
    counters.slice(0, 2),
    counters.slice(2, 4),
    counters.slice(4, 6),
  ], [counters]);

  /* ---------------- Table Columns ---------------- */
  const columns = [
    { field: "mc_code", label: "Maintenance Contract" },
    { field: "type", label: "Transaction Type" },
    { field: "spr_no", label: "SPR No." },
    { field: "work_order", label: "Work Order" },
    { field: "requested_at", label: "Date" },
    { field: "stock_item", label: "Stock Item ID" },
    { field: "cond", label: "Condition" },
    { field: "actual_qty", label: "Scanned Quantity" },
    { field: "plan_qty", label: "Required Quantity" },
    { field: "counter_id", label: "Counter" },
    { field: "is_confirm", label: "Confirm", type: "confirmSku" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDTypography variant="h3" color="inherit">
          {storeType} - Check Out
        </MDTypography>
        <Box mb={2} sx={{ width: "120px", height: "5px", backgroundColor: "#FFA726" }} />
      </MDBox>

      {/* Counters */}
      <MDBox mt={1}>
        <MDBox mb={1} display="flex" alignItems="center">
          <MDTypography variant="h4">Counters</MDTypography>
        </MDBox>
        <Grid container spacing={6}>
          {counterGroups.map((group, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <MDBox p={3}>
                  <Grid container spacing={2} justifyContent="center">
                    {group.map(counter => (
                      <Grid item xs={6} key={counter.id}>
                        <Box
                          sx={{ cursor: "pointer" }}
                          onClick={() => {
                            // ส่ง counterId ผ่าน URL
                            const url = `/checkout/counter/${counter.id}`;
                            window.open(url, "_blank"); // เปิดแท็บใหม่
                          }}
                        >
                          <CounterBox counter={counter} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>

      {/* Orders Table */}
      <MDBox mt={3}>
        <MDBox mb={1} display="flex" alignItems="center">
          <MDTypography variant="h4" color="inherit">Orders</MDTypography>
        </MDBox>
        <Card>
          <MDBox p={3}>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <MDBox sx={{ fontSize: "0.85rem", maxHeight: "600px", overflowY: "auto" }}>
                <ReusableDataTable
                  columns={columns}
                  rows={ordersList}
                  idField="order_id"
                  defaultPageSize={10}
                  pageSizeOptions={[10, 25, 50]}
                  fontSize="0.8rem"
                  confirmSkuDisabled={row => row.status !== "PROCESSING"}
                  onConfirmSku={row => {
                    setSelectedOrder(row);
                    setScanDialogOpen(true);
                  }}
                />
              </MDBox>
            )}
          </MDBox>
        </Card>
      </MDBox>

      {/* Scan Qty Dialog */}
      {selectedOrder && (
        <ScanQtyDialog
          open={scanDialogOpen}
          order={selectedOrder}
          onClose={() => setScanDialogOpen(false)}
          onSubmit={async (order_id, actual_qty) => {
            try {
              const response = await ExecutionAPI.handleOrderItemT1(order_id, actual_qty);
              console.log("response",response);
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
      )}

      {/* General Alert */}
      <SweetAlertComponent
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={() => { alert.onConfirm?.(); setAlert({ ...alert, show: false }); }}
      />
    </DashboardLayout>
  );
};

export default CheckOutTPage;
