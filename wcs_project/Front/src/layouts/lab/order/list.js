import React, { useState, useEffect } from "react";
import { Grid, Card, IconButton, InputAdornment, FormControl } from "@mui/material";
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
import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import { TransactionType } from "common/dataMain";

const WaitingExecutionPage = () => {
  const [waitingList, setWaitingList] = useState([]);
  const [executionList, setExecutionList] = useState([]);

  const [filteredWaiting, setFilteredWaiting] = useState([]);
  const [filteredExecution, setFilteredExecution] = useState([]);

  const [searchWaiting, setSearchWaiting] = useState({ date: "", time: "" });
  const [searchExecution, setSearchExecution] = useState({ date: "", time: "" });

  const [selectedWaitingIds, setSelectedWaitingIds] = useState([]);
  const [selectedExecutionIds, setSelectedExecutionIds] = useState([]);

  const [loading, setLoading] = useState(false);

  const [confirmAlert, setConfirmAlert] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Transaction Type Filter
  const [filterTypeWaiting, setFilterTypeWaiting] = useState("");
  const [filterTypeExecution, setFilterTypeExecution] = useState("");

  const navigate = useNavigate();

  // --------------------------------------------------
  // FETCH API
  // --------------------------------------------------
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

  // --------------------------------------------------
  // FILTER WAITING LIST
  // --------------------------------------------------
  useEffect(() => {
    const filtered = waitingList.filter(
      (item) =>
        (item.requested_at || "").includes(searchWaiting.date) &&
        (item.requested_at || "").includes(searchWaiting.time) &&
        (filterTypeWaiting === "" || item.type === filterTypeWaiting)
    );
    setFilteredWaiting(filtered);
  }, [waitingList, searchWaiting, filterTypeWaiting]);

  // --------------------------------------------------
  // FILTER EXECUTION LIST
  // --------------------------------------------------
  useEffect(() => {
    const filtered = executionList.filter(
      (item) =>
        (item.requested_at || "").includes(searchExecution.date) &&
        (item.requested_at || "").includes(searchExecution.time) &&
        (filterTypeExecution === "" || item.type === filterTypeExecution)
    );
    setFilteredExecution(filtered);
  }, [executionList, searchExecution, filterTypeExecution]);

  // --------------------------------------------------
  // MOVE TO EXECUTION
  // --------------------------------------------------
const handleMoveToExecution = async () => {
  if (selectedWaitingIds.length === 0) return;

  try {
    const payload = {
      items: selectedWaitingIds.map(id => ({ order_id: id }))
    };

    await ExecutionAPI.createTask(payload);

    await Promise.all([fetchDataWaitingAll(), fetchDataExecuteAll()]);
    setSelectedWaitingIds([]);

    setAlert({
      show: true,
      type: "success",
      title: "Success",
      message: "Moved to Execution",
    });
  } catch (err) {
    console.error(err);
    setAlert({
      show: true,
      type: "error",
      title: "Error",
      message: err.response?.data?.message || "Something went wrong",
    });
  }
};



  // --------------------------------------------------
  // DELETE EXECUTION -> BACK TO WAITING
  // --------------------------------------------------
const handleDeleteTask = async () => {
  if (selectedExecutionIds.length === 0) return;

  try {
    const payload = {
      items: selectedExecutionIds.map(id => ({ order_id: id }))
    };

    await ExecutionAPI.changeToWaiting(payload);

    await Promise.all([fetchDataWaitingAll(), fetchDataExecuteAll()]);
    setSelectedExecutionIds([]);

    setAlert({
      show: true,
      type: "success",
      title: "Success",
      message: "Moved back to Waiting",
    });
  } catch (err) {
    console.error(err);
    setAlert({
      show: true,
      type: "error",
      title: "Error",
      message: err.response?.data?.message || "Something went wrong",
    });
  }
};


  // --------------------------------------------------
  // TABLE COLUMNS
  // --------------------------------------------------
  const columnsWaiting = [
    { field: "type", label: "Transaction Type" },
    { field: "requested_at", label: "Date" },
    { field: "stock_item", label: "Stock Item ID" },
    { field: "item_name", label: "Stock Item Name" },
    { field: "item_desc", label: "Stock Item Description" },
    { field: "loc", label: "Location" },
    { field: "box_loc", label: "Box Location" },
    { field: "cond", label: "Condition" },
    { field: "plan_qty", label: "Quantity to be handled" },
    { field: "status", label: "Status" },
  ];

  const columnsExecute = [...columnsWaiting];

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox mt={5}>
        <MDTypography variant="h3" mb={2}>
          Waiting and Execution List
        </MDTypography>

        {/* Button Navigation */}
        <MDBox display="flex" justifyContent="flex-end" gap={2} mb={3}>
          <MDButton
            variant="contained"
            color="info"
            onClick={() => navigate("/transactions/usage", { state: { autoCreate: true } })}
          >
            Pick
          </MDButton>

          <MDButton
            variant="contained"
            color="warning"
            onClick={() => navigate("/transactions/receipt", { state: { autoCreate: true } })}
          >
            Put
          </MDButton>
        </MDBox>

        <Grid container spacing={1.5}>
          {/* --------------------------------------------------
              LEFT: WAITING LIST
          --------------------------------------------------- */}
          <Grid item xs={12} md={5.8}>
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: "500px" }}>
              <MDTypography variant="h5" mb={4}>
                Waiting List
              </MDTypography>

              {/* Filters */}
              <Grid container spacing={2} mb={2}>
                {/* Date */}
                <Grid item xs={12} md={4}>
                  <MDTypography variant="h6">Date</MDTypography>
                  <MDInput
                    placeholder="dd/mm/yyyy"
                    value={searchWaiting.date}
                    onChange={(e) =>
                      setSearchWaiting({ ...searchWaiting, date: e.target.value })
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

                {/* Time */}
                <Grid item xs={12} md={4}>
                  <MDTypography variant="h6">Time</MDTypography>
                  <MDInput
                    placeholder="-- : --"
                    value={searchWaiting.time}
                    onChange={(e) =>
                      setSearchWaiting({ ...searchWaiting, time: e.target.value })
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <AccessTimeIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    sx={{ height: "45px" }}
                  />
                </Grid>

                {/* Transaction Type */}
                <Grid item xs={12} md={4}>
                  <MDTypography variant="h6">Transaction Type</MDTypography>
                  <FormControl fullWidth>
                    <StyledSelect
                      sx={{ height: "45px" }}
                      name="filterTypeWaiting"
                      value={filterTypeWaiting}
                      onChange={(e) => setFilterTypeWaiting(e.target.value)}
                      displayEmpty
                    >
                      <StyledMenuItem value="">All Transaction Types</StyledMenuItem>
                      {TransactionType.map((t) => (
                        <StyledMenuItem key={t.value} value={t.value}>
                          {t.text}
                        </StyledMenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Table */}
              <MDBox sx={{ fontSize: "0.85rem", maxHeight: "600px", overflowY: "auto" }}>
                <ReusableDataTable
                  columns={columnsWaiting}
                  rows={filteredWaiting}
                  idField="order_id"
                  enableSelection={true}              // ⭐ เปิด checkbox
  selectedRows={selectedWaitingIds}   // ⭐ รายการที่เลือก
  onSelectedRowsChange={setSelectedWaitingIds} // ⭐ callback
                  fontSize="0.8rem"
                  autoHeight
                />
              </MDBox>
            </Card>
          </Grid>

          {/* --------------------------------------------------
              MIDDLE BUTTONS ( +  - )
          --------------------------------------------------- */}
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
            {/* + Button */}
            <IconButton
              color="primary"
              onClick={() => {
                setConfirmMessage(
                  "Are you sure you want to move this Waiting to Execution?"
                );
                setConfirmAction(() => handleMoveToExecution);
                setConfirmAlert(true);
              }}
              disabled={selectedWaitingIds.length === 0 || loading}

              sx={{ p: 0.3 }}
            >
              <AddCircleIcon sx={{ fontSize: 36 }} />
            </IconButton>

            {/* - Button */}
            <IconButton
              color="error"
              onClick={() => {
                setConfirmMessage(
                  "Are you sure you want to move this Execution to Waiting?"
                );
                setConfirmAction(() => handleDeleteTask);
                setConfirmAlert(true);
              }}
              disabled={selectedExecutionIds.length === 0 || loading}
              sx={{ p: 0.3 }}
            >
              <RemoveCircleIcon sx={{ fontSize: 36 }} />
            </IconButton>
          </Grid>

          {/* --------------------------------------------------
              RIGHT: EXECUTION LIST
          --------------------------------------------------- */}
          <Grid item xs={12} md={5.8}>
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: "500px" }}>
              <MDTypography variant="h5" mb={4}>
                Execution List
              </MDTypography>

              {/* Filters */}
              <Grid container spacing={2} mb={2}>
                {/* Date */}
                <Grid item xs={12} md={4}>
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
                    fullWidth
                    sx={{ height: "45px" }}
                  />
                </Grid>

                 {/* Time */}
                <Grid item xs={12} md={4}>
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
                    fullWidth
                    sx={{ height: "45px" }}
                  />
                </Grid>

                {/* Transaction Type */}
                <Grid item xs={12} md={4}>
                  <MDTypography variant="h6">Transaction Type</MDTypography>
                    <FormControl fullWidth>
                      <StyledSelect
                        sx={{ height: "45px" }}
                        name="filterTypeExecution"
                        value={filterTypeExecution}
                        onChange={(e) => setFilterTypeExecution(e.target.value)}
                        displayEmpty
                      >
                        <StyledMenuItem value="">All Transaction Types</StyledMenuItem>

                        {TransactionType.map((t) => (
                          <StyledMenuItem key={t.value} value={t.value}>
                            {t.text}
                          </StyledMenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                </Grid>
              </Grid>

              {/* Table */}
              <MDBox sx={{ fontSize: "0.85rem", maxHeight: "600px", overflowY: "auto" }}>
                <ReusableDataTable
                  columns={columnsExecute}
                  rows={filteredExecution}
                  idField="order_id"
  enableSelection={true}              // ⭐ เปิด checkbox
  selectedRows={selectedExecutionIds}   // ⭐ รายการที่เลือก
  onSelectedRowsChange={setSelectedExecutionIds} // ⭐ callback
                  fontSize="0.8rem"
                  autoHeight
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Confirm SweetAlert */}
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
            if (confirmAction) confirmAction();
            setConfirmAlert(false);
          }}
          onCancel={() => setConfirmAlert(false)}
        />
      )}

      {/* Result Alert */}
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
