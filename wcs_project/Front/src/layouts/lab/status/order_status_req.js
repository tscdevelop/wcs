import React, { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
import { Card, Grid, InputAdornment, FormControl, Box } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import OrdersAPI from "api/OrdersAPI";
import ReusableDataTable from "../components/table_component_v2";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import { useNavigate } from "react-router-dom";
import { GlobalVar } from "common/GlobalVar";
import { normalizeStatus } from "common/utils/statusUtils";
import StatusBadge from "../components/statusBadge";
import { OrderStatus, Condition } from "common/dataMain";

const OrderStatusReqPage = () => {
  const [loading, setLoading] = useState(true);
  const [ordersList, setOrdersList] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchOrders, setSearchOrders] = useState({
    mc_code: "",
    spr_no: "",
    work_order: "",
    usage_num: "", 
    line: "",
    stock_item: "", 
    item_desc: "",
    cond: "",
    from_loc: "",
    from_box_loc: "",
    unit_cost: "",  
    total_cost: "",
    actual_qty: "",  
    cap_new_qty: "",
    recond_qty: "",  
    date: "",  
    status: "",
  });

  const [filterCondition, setFilterCondition] = useState("");
  const [filterStatusOrder, setFilterStatusOrders] = useState("");

  const navigate = useNavigate();

  // ดึงจาก localStorage
  const mcCodes = GlobalVar.getMcCodes();
  const storeType = GlobalVar.getStoreType();

  const handleNext = () => {
    const checkoutStores = ["T1M", "T1", "AGMB"];

    if (checkoutStores.includes(storeType)) {
      navigate("/checkout-t1");
    } else {
      navigate("/home");
    }
  };

  const fetchDataAll = async () => {
    setLoading(true);
    try {
      const response = await OrdersAPI.OrdersStatusAll({
        isExecution: false,
        mc_code: mcCodes,
        store_type: storeType === "WCS" ? undefined : storeType,
        type: "USAGE",
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      setOrdersList(list);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setOrdersList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAll();
  }, []);


  // --- Filter Logic ---
  useEffect(() => {
    const filtered = ordersList.filter(
      (item) =>
        (item.mc_code || "").includes(searchOrders.mc_code) &&
        (item.spr_no || "").includes(searchOrders.spr_no) &&
        (item.work_order || "").includes(searchOrders.work_order) &&
        (item.usage_num || "").includes(searchOrders.usage_num) &&
        (item.line || "").includes(searchOrders.line) &&
        (item.stock_item || "").includes(searchOrders.stock_item) &&
        (item.item_desc || "").includes(searchOrders.item_desc) &&
        (filterCondition === "" || item.cond === filterCondition) &&
        (item.from_loc || "").includes(searchOrders.from_loc) &&
        (item.from_box_loc || "").includes(searchOrders.from_box_loc) &&
        String(item.unit_cost ?? "").includes(searchOrders.unit_cost) &&
        String(item.total_cost ?? "").includes(searchOrders.total_cost) &&
        String(item.actual_qty ?? "").includes(searchOrders.actual_qty) &&
        String(item.capital_qty || item.new_qty || "").includes(searchOrders.cap_new_qty) &&
        String(item.recond_qty ?? "").includes(searchOrders.recond_qty) &&
        (item.requested_at || "").includes(searchOrders.date) &&
        (
          filterStatusOrder === "" ||
          normalizeStatus(item.status) === filterStatusOrder
        )
    );
    setFilteredOrders(filtered);
  }, [ordersList, searchOrders, filterStatusOrder, filterCondition]);

  // table
  const columns = [
    { field: "mc_code", label: "Maintenance Contract" },
    { field: "type", label: "Transaction Type" },
    { field: "spr_no", label: "SPR No." },
    { field: "work_order", label: "Work Order" },
    { field: "usage_num", label: "Usage No." },
    { field: "line", label: "Usage Line" },
    { field: "requested_at", label: "Date" },
    { field: "stock_item", label: "Stock Item ID" },
    { field: "item_desc", label: "Stock Item Description" },
    { field: "cond", label: "Condition" },
    { field: "from_loc", label: "From Location" },
    { field: "from_box_loc", label: "From Box Location" },
    { field: "split", label: "Split" },
    { field: "unit_cost", label: "Unit Cost" },
    { field: "total_cost", label: "Total Cost" },
    { field: "actual_qty", label: "Scanned Quantity" },
    { field: "new_qty", label: "NEW Quantity" },
    { field: "capital_qty", label: "CAPITAL Quantity" },
    { field: "recond_qty", label: "RECOND Quantity" },
    {
          field: "status",
          label: "Order Status",
          valueGetter: (row) => row.status, // เอาไว้ filter / sort
          renderCell: (status) => <StatusBadge status={status} />,
      }
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2} display="flex" alignItems="stretch">
        {/* 🔵 ซ้าย : Title */}
        <MDBox flex={1} display="flex" alignItems="center">
          <MDTypography variant="h3" color="inherit">
            Status - Requester
          </MDTypography>
        </MDBox>

        {/* 🟠 ขวา : ปุ่ม (แบ่งบน / ล่าง) */}
        <MDBox
          flex={1}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="flex-end"
          gap={2}
        >
          {/* ครึ่งบน : Next */}
          <MDButton variant="contained" color="info" onClick={handleNext}>
            Next
          </MDButton>

          {/* ครึ่งล่าง : Back */}
          <MDButton variant="contained" color="secondary" onClick={() => navigate("/home")}>
            Back
          </MDButton>
        </MDBox>
      </MDBox>

      <MDBox mt={1}>
        <Card>
          <MDBox p={3}>
            <Box sx={{ flexGrow: 1 }} mb={3}>
            <Grid container spacing={2} sx={{ mb: 0.5 }}>
              {/* Maintenance Contract */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Maintenance Contract</MDTypography>
                <MDInput
                  placeholder="Text Field"
                  sx={{ height: "45px" }}
                  value={searchOrders.mc_code}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, mc_code: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              
              {/* SPR No. */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">SPR No.</MDTypography>
                <MDInput
                  placeholder="Text Field"
                  sx={{ height: "45px" }}
                  value={searchOrders.spr_no}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, spr_no: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* Work Order */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Work Order</MDTypography>
                <MDInput
                  placeholder="Text Field"
                  sx={{ height: "45px" }}
                  value={searchOrders.work_order}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, work_order: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* Usage No. */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Usage No.</MDTypography>
                <MDInput
                  placeholder="Text Field"
                  sx={{ height: "45px" }}
                  value={searchOrders.usage_num}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, usage_num: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* Usage Line */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Usage Line</MDTypography>
                <MDInput
                  placeholder="Text Field"
                  sx={{ height: "45px" }}
                  value={searchOrders.line}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, line: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mb: 0.5 }}>
              {/* Stock Item ID */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Stock Item ID</MDTypography>
                <MDInput
                  placeholder="Text Field"
                  sx={{ height: "45px" }}
                  value={searchOrders.stock_item}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, stock_item: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* Stock Item Description */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Stock Item Description</MDTypography>
                <MDInput
                  placeholder="Text Field"
                  sx={{ height: "45px" }}
                  value={searchOrders.item_desc}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, item_desc: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* Condition */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Condition</MDTypography>
                <FormControl fullWidth>
                  <StyledSelect
                      sx={{ height: "45px" }}
                      name="filterCondition"
                      value={filterCondition}
                      onChange={(e) => setFilterCondition(e.target.value)}
                      displayEmpty
                  >
                      <StyledMenuItem value="">Pull Down List</StyledMenuItem>

                      {Condition.map((t) => (
                      <StyledMenuItem key={t.value} value={t.value}>
                          {t.text}
                      </StyledMenuItem>
                      ))}
                  </StyledSelect>
                  </FormControl>
              </Grid>
              
              {/* From Location */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">From Location</MDTypography>
                <MDInput
                  placeholder="Text Field"
                  sx={{ height: "45px" }}
                  value={searchOrders.from_loc}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, from_loc: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* From Box Location */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">From Box Location</MDTypography>
                <MDInput
                  placeholder="Text Field"
                  sx={{ height: "45px" }}
                  value={searchOrders.from_box_loc}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, from_box_loc: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              {/* Unit Cost */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Unit Cost</MDTypography>
                <MDInput
                  placeholder="Select Range"
                  sx={{ height: "45px" }}
                  value={searchOrders.unit_cost}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, unit_cost: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              
              {/* Total Cost */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Total Cost</MDTypography>
                <MDInput
                  placeholder="Select Range"
                  sx={{ height: "45px" }}
                  value={searchOrders.total_cost}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, total_cost: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* Scanned Quantity */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Scanned Quantity</MDTypography>
                <MDInput
                  placeholder="Select Range"
                  sx={{ height: "45px" }}
                  value={searchOrders.actual_qty}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, actual_qty: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* CAPITAL/NEW Quantity */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">
                  CAPITAL/NEW Quantity
                </MDTypography>

                <MDInput
                  //type="number"
                  placeholder="Select Range"
                  sx={{ height: "45px" }}
                  value={searchOrders.cap_new_qty ?? ""}
                  inputProps={{
                    min: 1,
                    step: 1,
                  }}
                  onChange={(e) => {
                    const value = e.target.value;

                    // กรณีลบค่าออก (clear)
                    if (value === "") {
                      setSearchOrders({ ...searchOrders, cap_new_qty: "" });
                      return;
                    }

                    const num = Number(value);

                    // ❌ ไม่รับ 0 หรือติดลบ
                    if (num <= 0) return;

                    setSearchOrders({
                      ...searchOrders,
                      cap_new_qty: num,
                    });
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* RECOND Quantity */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">RECOND Quantity</MDTypography>
                <MDInput
                  placeholder="Select Range"
                  sx={{ height: "45px" }}
                  value={searchOrders.recond_qty}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, recond_qty: e.target.value })
                  }
                  displayEmpty
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>

              {/* Date */}
              <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Date</MDTypography>
                <MDInput
                  placeholder="Calendar"
                  value={searchOrders.date}
                  onChange={(e) =>
                    setSearchOrders({ ...searchOrders, date: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarMonthIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  sx={{ height: "45px" }}
                />
              </Grid>

              {/* Order Status */}
                <Grid item xs={12} md={1.71}>
                <MDTypography variant="caption" fontWeight="bold">Order Status</MDTypography>
                    <FormControl fullWidth>
                    <StyledSelect
                        sx={{ height: "45px" }}
                        name="filterStatusOrder"
                        value={filterStatusOrder}
                        onChange={(e) => setFilterStatusOrders(e.target.value)}
                        displayEmpty
                    >
                        <StyledMenuItem value="">Pull Down List</StyledMenuItem>

                        {OrderStatus.map((t) => (
                        <StyledMenuItem key={t.value} value={t.value}>
                            {t.text}
                        </StyledMenuItem>
                        ))}
                    </StyledSelect>
                    </FormControl>
                </Grid>
            </Grid>
            </Box>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <MDBox sx={{ fontSize: "0.85rem", maxHeight: "600px", overflowY: "auto" }}>
                {/* Table */}
                <ReusableDataTable
                  columns={columns}
                  rows={filteredOrders}
                  idField="order_id"
                  defaultPageSize={10}
                  pageSizeOptions={[10, 25, 50]}
                  fontSize="0.8rem"
                />
              </MDBox>
            )}
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
};
export default OrderStatusReqPage;
