import React, { useState, useEffect } from "react";
import { Grid, Card, IconButton, InputAdornment, FormControl } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
//import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import ReusableDataTable from "../components/table_component_v2";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import OrdersAPI from "api/OrdersAPI";
import ExecutionAPI from "api/TaskAPI";
import SweetAlertComponent from "../components/sweetAlert";
import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import { Condition, OrderStatusNoFinish } from "common/dataMain";
import SearchIcon from "@mui/icons-material/Search";
import { GlobalVar } from "common/GlobalVar";
import { normalizeStatus } from "common/utils/statusUtils";
import StatusBadge from "../components/statusBadge";

//store
const ReturnExecutionPage = () => {
    const [waitingList, setWaitingList] = useState([]);
    const [executionList, setExecutionList] = useState([]);

    const [filteredWaiting, setFilteredWaiting] = useState([]);
    const [filteredExecution, setFilteredExecution] = useState([]);

    const [searchWaiting, setSearchWaiting] = useState({ 
        mc_code: "",
        loc: "",
        box_loc: "",
        date: "", 
        spr_no: "", 
        work_order: "",
        usage_num: "", 
        line: "",
        stock_item: "", 
        item_desc: "",
        cond: "", 
    });
    const [searchExecution, setSearchExecution] = useState({ 
        mc_code: "",
        loc: "",
        box_loc: "",
        date: "", 
        spr_no: "", 
        work_order: "",
        usage_num: "", 
        line: "",
        status: "",
        stock_item: "", 
        item_desc: "",
        cond: "",
    });

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
        onConfirm: null,
    });

    // Filter
    const [filterConditionWaiting, setFilterConditionWaiting] = useState("");
    const [filterConditionExecution, setFilterConditionExecution] = useState("");
    const [filterStatusExecution, setFilterStatusExecution] = useState("");

    const navigate = useNavigate();

    // ดึงจาก localStorage 
    //const mcCodes = GlobalVar.getMcCodes(); 
    const storeType = GlobalVar.getStoreType();

    // --------------------------------------------------
    // FETCH API
    // --------------------------------------------------
    const fetchDataWaitingAll = async () => {
        setLoading(true);
        try {
        const response = await OrdersAPI.OrdersReturnAll({
            isExecution: true,
            //mc_code: mcCodes,
            store_type: storeType === "WCS" ? undefined : storeType,
        });
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
        const response = await OrdersAPI.OrdersReturnAll({
            isExecution: false,
            //mc_code: mcCodes,
            store_type: storeType === "WCS" ? undefined : storeType, 
        });
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
            (item.mc_code || "").includes(searchWaiting.mc_code) &&
            (item.loc || "").includes(searchWaiting.loc) &&
            (item.box_loc || "").includes(searchWaiting.box_loc) &&
            (item.requested_at || "").includes(searchWaiting.date) &&
            (item.work_order || "").includes(searchWaiting.work_order) &&
            (item.spr_no || "").includes(searchWaiting.spr_no) &&
            (item.usage_num || "").includes(searchWaiting.usage_num) &&
            (item.line || "").includes(searchWaiting.line) &&
            (item.stock_item || "").includes(searchWaiting.stock_item) &&
            (item.item_desc || "").includes(searchWaiting.item_desc) &&
            (filterConditionWaiting === "" || item.cond === filterConditionWaiting)
        );
        setFilteredWaiting(filtered);
    }, [waitingList, searchWaiting, filterConditionWaiting]);

    // --------------------------------------------------
    // FILTER EXECUTION LIST
    // --------------------------------------------------
    useEffect(() => {
        const filtered = executionList.filter(
        (item) =>
            (item.mc_code || "").includes(searchExecution.mc_code) &&
            (item.loc || "").includes(searchExecution.loc) &&
            (item.box_loc || "").includes(searchExecution.box_loc) &&
            (item.requested_at || "").includes(searchExecution.date) &&
            (item.work_order || "").includes(searchExecution.work_order) &&
            (item.spr_no || "").includes(searchExecution.spr_no) &&
            (item.usage_num || "").includes(searchExecution.usage_num) &&
            (item.line || "").includes(searchExecution.line) &&
            (
                filterStatusExecution === "" ||
                normalizeStatus(item.status) === filterStatusExecution
            ) &&
            (item.stock_item || "").includes(searchExecution.stock_item) &&
            (item.item_desc || "").includes(searchExecution.item_desc) &&
            (filterConditionExecution === "" || item.cond === filterConditionExecution)
        );
        setFilteredExecution(filtered);
    }, [executionList, searchExecution, filterStatusExecution, filterConditionExecution]);

    // --------------------------------------------------
    // MOVE TO EXECUTION -> Go TO PENDING
    // --------------------------------------------------
    const handleMoveToExecution = async () => {
        if (selectedWaitingIds.length === 0) return;

        try {
        const payload = {
            items: selectedWaitingIds.map(id => ({ order_id: id }))
        };

        await ExecutionAPI.changeToPending(payload);

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
    // ALL Go TO PROCESSING
    // --------------------------------------------------
    const handleConfirm = async () => {
        if (selectedExecutionIds.length === 0) return;

        try {
        const payload = {
            items: selectedExecutionIds.map(id => ({ order_id: id }))
        };

        const res = await ExecutionAPI.createTask(payload);

        await Promise.all([
            fetchDataWaitingAll(),
            fetchDataExecuteAll(),
        ]);

        setSelectedExecutionIds([]);

        if (res?.isCompleted) {
            setAlert({
            show: true,
            type: "success",
            title: "Success",
            message: res.message || "Confirm success",
            onConfirm: () => {
                navigate("/status");
            },
            });
            return;
        }

        setAlert({
            show: true,
            type: "success",
            title: "Success",
            message: "Confirm to Execution",
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
    // CLEAR ALL PENDING -> BACK TO WAITING
    // --------------------------------------------------

    const getPendingOrderIds = () => {
        return executionList
        .filter(r => r.status === "PENDING")
        .map(r => r.order_id);
    };

    const handleClear = async () => {
        const pendingIds = getPendingOrderIds();
        if (pendingIds.length === 0) return;

        try {
        const payload = {
            items: pendingIds.map(id => ({ order_id: id })),
        };

        await ExecutionAPI.changeToWaiting(payload);

        await Promise.all([
            fetchDataWaitingAll(),
            fetchDataExecuteAll(),
        ]);

        setSelectedExecutionIds([]);

        setAlert({
            show: true,
            type: "success",
            title: "Success",
            message: "Clear Pending success",
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
        { field: "loc", label: "Destination Store Location" },
        { field: "box_loc", label: "Destination Box Location" },
        { field: "plan_qty", label: "Required Quantity" },
    ];

    const columnsExecute = [
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
        { field: "loc", label: "Destination Store Location" },
        { field: "box_loc", label: "Destination Box Location" },
        { field: "plan_qty", label: "Required Quantity" },
        {
            field: "status",
            label: "Order Status",
            valueGetter: (row) => row.status, // เอาไว้ filter / sort
            renderCell: (status) => <StatusBadge status={status} />,
        }
    ];

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------
    return (
        <DashboardLayout>
        <DashboardNavbar />
        <MDBox
            p={2}
            display="flex"
            alignItems="stretch"
            >
            {/* 🔵 ซ้าย : Title */}
            <MDBox
                flex={1}
                display="flex"
                alignItems="center"
            >
                <MDTypography variant="h3" color="inherit">
                Return - Waiting and Execution List
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
                {/* ครึ่งบน : Confirm */}
                <MDButton
                variant="contained"
                color="info"
                onClick={() => {
                    setConfirmMessage("Are you sure you want to confirm orders?");
                    setConfirmAction(() => handleConfirm);
                    setConfirmAlert(true);
                }}
                disabled={selectedExecutionIds.length === 0 || loading}
                >
                Confirm
                </MDButton>

                {/* ครึ่งล่าง : Clear */}
                <MDButton
                variant="contained"
                color="secondary"
                onClick={() => {
                    setConfirmMessage("Are you sure you want to clear all pending?");
                    setConfirmAction(() => handleClear);
                    setConfirmAlert(true);
                }}
                >
                Clear Pending
                </MDButton>
            </MDBox>
            </MDBox>


        <MDBox mt={1}>
            <Grid container spacing={1.5}>
    {/* --------------------------------------------------
        LEFT: WAITING LIST
    --------------------------------------------------- */}
            <Grid item xs={12} md={5.8}>
                <Card sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: "500px" }}>
                <MDTypography variant="h5" mb={4}>
                    Return - Waiting List
                </MDTypography>

                {/* Filters */}
                <Grid container spacing={2} mb={2}>
                    {/* Maintenance Contract */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Maintenance Contract</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchWaiting.mc_code}
                        onChange={(e) =>
                        setSearchWaiting({ ...searchWaiting, mc_code: e.target.value })
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

                    {/* Destination Store Location */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Destination Store Location</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchWaiting.loc}
                        onChange={(e) =>
                        setSearchWaiting({ ...searchWaiting, loc: e.target.value })
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

                    {/* Destination Box Location */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Destination Box Location</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchWaiting.box_loc}
                        onChange={(e) =>
                        setSearchWaiting({ ...searchWaiting, box_loc: e.target.value })
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

                    {/* Work Order */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Work Order</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchWaiting.work_order}
                        onChange={(e) =>
                        setSearchWaiting({ ...searchWaiting, work_order: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">SPR No.</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchWaiting.spr_no}
                        onChange={(e) =>
                        setSearchWaiting({ ...searchWaiting, spr_no: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Usage No.</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchWaiting.usage_num}
                        onChange={(e) =>
                        setSearchWaiting({ ...searchWaiting, usage_num: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Usage Line</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchWaiting.line}
                        onChange={(e) =>
                        setSearchWaiting({ ...searchWaiting, line: e.target.value })
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

                    <Grid item xs={12} md={4}></Grid>

                    {/* Stock Item No. */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Stock Item No.</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchWaiting.stock_item}
                        onChange={(e) =>
                        setSearchWaiting({ ...searchWaiting, stock_item: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Stock Item Description</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchWaiting.item_desc}
                        onChange={(e) =>
                        setSearchWaiting({ ...searchWaiting, item_desc: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Condition</MDTypography>
                    <FormControl fullWidth>
                        <StyledSelect
                        sx={{ height: "45px" }}
                        name="filterConditionWaiting"
                        value={filterConditionWaiting}
                        onChange={(e) => setFilterConditionWaiting(e.target.value)}
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
                    Return - Execution List
                </MDTypography>

                {/* Filters */}
                <Grid container spacing={2} mb={2}>
                    {/* Maintenance Contract */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Maintenance Contract</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchExecution.mc_code}
                        onChange={(e) =>
                        setSearchExecution({ ...searchExecution, mc_code: e.target.value })
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

                    {/* Destination Store Location */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Destination Store Location</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchExecution.loc}
                        onChange={(e) =>
                        setSearchExecution({ ...searchExecution, loc: e.target.value })
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

                    {/* Destination Box Location */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Destination Box Location</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchExecution.box_loc}
                        onChange={(e) =>
                        setSearchExecution({ ...searchExecution, box_loc: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Date</MDTypography>
                    <MDInput
                        placeholder="Calendar"
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

                    {/* Work Order */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Work Order</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchExecution.work_order}
                        onChange={(e) =>
                        setSearchExecution({ ...searchExecution, work_order: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">SPR No.</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchExecution.spr_no}
                        onChange={(e) =>
                        setSearchExecution({ ...searchExecution, spr_no: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Usage No.</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchExecution.usage_num}
                        onChange={(e) =>
                        setSearchExecution({ ...searchExecution, usage_num: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Usage Line</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchExecution.line}
                        onChange={(e) =>
                        setSearchExecution({ ...searchExecution, line: e.target.value })
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

                    {/* Order Status */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Order Status</MDTypography>
                        <FormControl fullWidth>
                        <StyledSelect
                            sx={{ height: "45px" }}
                            name="filterStatusExecution"
                            value={filterStatusExecution}
                            onChange={(e) => setFilterStatusExecution(e.target.value)}
                            displayEmpty
                        >
                            <StyledMenuItem value="">Pull Down List</StyledMenuItem>

                            {OrderStatusNoFinish.map((t) => (
                            <StyledMenuItem key={t.value} value={t.value}>
                                {t.text}
                            </StyledMenuItem>
                            ))}
                        </StyledSelect>
                        </FormControl>
                    </Grid>

                    {/* Stock Item No. */}
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Stock Item No.</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchExecution.stock_item}
                        onChange={(e) =>
                        setSearchExecution({ ...searchExecution, stock_item: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Stock Item Description</MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchExecution.item_desc}
                        onChange={(e) =>
                        setSearchExecution({ ...searchExecution, item_desc: e.target.value })
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
                    <Grid item xs={12} md={4}>
                    <MDTypography variant="h6">Condition</MDTypography>
                        <FormControl fullWidth>
                        <StyledSelect
                            sx={{ height: "45px" }}
                            name="filterConditionExecution"
                            value={filterConditionExecution}
                            onChange={(e) => setFilterConditionExecution(e.target.value)}
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
                    isRowSelectable={(row) => row.status === "PENDING"} // คลิ๊กได้เฉพาะที่ตั้ง เช่น ตาม status
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
            onConfirm={() => {
            alert.onConfirm?.();   // ⭐ เรียก navigate
            setAlert({ ...alert, show: false });
            }}
        />

        </DashboardLayout>
    );
};

export default ReturnExecutionPage;
