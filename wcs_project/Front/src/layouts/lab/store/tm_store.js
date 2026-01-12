import React, { useState, useMemo, useEffect } from "react";
import { Card, Grid, FormControl, MenuItem, Switch, FormControlLabel } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import ReusableDataTable from "../components/table_component_v2";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import { Aisle } from "common/dataMain";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AisleAPI from "api/AisleAPI";
import MrsAPI from "api/MrsAPI";
import { useNavigate } from "react-router-dom";

const T1MStore = () => {
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        aisel_id: "",
        aisel_oc: "CLOSED",
    });

    // ...เเสดงข้อมูล Row ใน Table Aisle
    const [aisleAll, setAisleAll] = useState([]);
    // สำหรับฟิลเตอร์ Aisle
    const [filters, setFilters] = useState({
        aisle_code: "",
        mrs_status: "",
        bank_code: "",
        last_opened_at: "",   // dd/mm/yyyy
        last_closed_at: "",  // dd/mm/yyyy
        last_event_at: "",
    });

    // ...เเสดงข้อมูล Row ใน Table MRS
    const [MrsAll, setMrsAll] = useState([]);
    const [filtersMrs, setFiltersMrs] = useState({
        mrs_code: "",
        type: "",
        stock_item: "",
        mrs_status: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // handle สำหรับสวิตช์ OPEN/CLOSE
    const handleToggleAiselOC = (e) => {
        const isOpen = e.target.checked;
        setFormData((prev) => ({
            ...prev,
            aisel_oc: isOpen ? "OPEN" : "CLOSED",
        }));
    };

    // เรียกใช้ API Aisle
    const fetchAisleDataAll = async () => {
        try {
            const response = await AisleAPI.AisleAll();
            console.log("Aisle All :", response);

            if (response?.isCompleted) {
                const list =
                    Array.isArray(response?.data?.data) ? response.data.data :
                        Array.isArray(response?.data) ? response.data :
                            Array.isArray(response) ? response : [];
                setAisleAll(list);
            } else {
                setAisleAll([]);
            }

        } catch (error) {
            console.error("Error fetching  data :", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAisleDataAll();
    }, []);

    // เรียกใช้ API MRS
    const fetchMRSDataAll = async () => {
        try {
            const response = await MrsAPI.MRSAll();
            console.log("MRS All :", response);

            if (response?.isCompleted) {
                const list =
                    Array.isArray(response?.data?.data) ? response.data.data :
                        Array.isArray(response?.data) ? response.data :
                            Array.isArray(response) ? response : [];
                setMrsAll(list);
            } else {
                setMrsAll([]);
            }

        } catch (error) {
            console.error("Error fetching  data :", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMRSDataAll();
    }, []);



    // แปลงสตริงวันที่ให้เป็น dd/mm/yyyy (รองรับ dd-mm-yyyy, dd.mm.yyyy, ISO, Date)
    // const normalizeDMY = (v) => {
    //     if (!v) return "";
    //     const s = String(v).trim();

    //     // จับ dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy ที่โผล่ที่ไหนก็ได้
    //     const m = s.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    //     if (m) {
    //         const d = m[1].padStart(2, "0");
    //         const mo = m[2].padStart(2, "0");
    //         return `${d}/${mo}/${m[3]}`;
    //     }

    //     // ลอง parse date อื่น ๆ (เช่น ISO) แล้ว format เป็น dd/mm/yyyy
    //     const d = new Date(s);
    //     if (!isNaN(d)) {
    //         const dd = String(d.getDate()).padStart(2, "0");
    //         const mm = String(d.getMonth() + 1).padStart(2, "0");
    //         const yy = d.getFullYear();
    //         return `${dd}/${mm}/${yy}`;
    //     }
    //     return "";
    // };

    // // ใช้เทียบ rowDate กับ filterDate (ให้ผ่านถ้าตรงเป๊ะหรือเริ่มต้นตรง)
    // const matchDate = (rowDate, filterDate) => {
    //     const rowNorm = normalizeDMY(rowDate);
    //     const fNorm = normalizeDMY(filterDate);
    //     if (!fNorm) return true;           // ไม่มีฟิลเตอร์ = ผ่าน
    //     return rowNorm === fNorm || rowNorm.startsWith(fNorm);
    // };


    // กรองข้อมูลตาม filters
    const filteredAisleRows = useMemo(() => {
        const list = Array.isArray(aisleAll) ? aisleAll : [];
        return list.filter((r) => {
            const codeOk = !filters.aisle_code || (r.aisle_code ?? "").toString().toLowerCase().includes((filters.aisle_code ?? "").toString().toLowerCase());
            const zoneOk = !filters.bank_code || (r.bank_code ?? "").toString().toLowerCase().includes((filters.bank_code ?? "").toString().toLowerCase());
            const statusOk = !filters.status || (r.status ?? "").toString().toLowerCase().includes((filters.status ?? "").toString().toLowerCase());
            // const openOk = matchDate(r.last_opened_at, filters.last_opened_at);
            // const closeOk = matchDate(r.last_closed_at, filters.last_closed_at);
            // const eventOk = matchDate(r.last_event_at, filters.last_event_at);

            return codeOk && statusOk && zoneOk;
        });
    }, [aisleAll, filters]);


    // ฟิลด์คอลัมน์
    const Aisle_Columns = [
        { field: "aisle_code", label: "Aisle Code" },
        { field: "bank_code", label: "Zone" },
        { field: "status", label: "Status" },
        { field: "last_opened_at", label: "Last Open" },
        { field: "last_event_at", label: "Last Event" },
    ];

    const handleFilterChange = (name) => (e) =>
        setFilters((prev) => ({ ...prev, [name]: e.target.value }));



    //ส่วนของ Card MRS 
    // กรองข้อมูลตาม filters
    const filteredMrsRows = useMemo(() => {
        const listMrs = Array.isArray(MrsAll) ? MrsAll : [];
        return listMrs.filter((r) => {
            const taskOk = !filtersMrs.mrs_code || r.mrs_code?.toLowerCase().includes(filtersMrs.mrs_code.toLowerCase());
            const mrs_statusOk = !filtersMrs.mrs_status || r.mrs_status?.toLowerCase().includes(filtersMrs.mrs_status.toLowerCase());
            const stock_itemOk = !filtersMrs.stock_item || r.stock_item ?.toLowerCase().includes(filtersMrs.stock_item.toLowerCase());
            const typeOk = !filtersMrs.type || r.type?.toLowerCase().includes(filtersMrs.type.toLowerCase());

            return taskOk && mrs_statusOk && stock_itemOk && typeOk;
        });
    }, [MrsAll, filtersMrs]);



    const MRS_Columns = [
        { field: "mrs_code", label: "MRS Code" },
        { field: "bank_code", label: "MRS Zone" },
        { field: "mrs_status", label: "MRS Status" },
        { field: "requested_at", label: "Date" },
        { field: "type", label: "Transaction Type" },
        { field: "stock_item", label: "Stock Item ID" },
        { field: "item_name", label: "Stock Item Name" },
        { field: "item_desc", label: "Stock Item Description" },
        { field: "loc", label: "Location" },
        { field: "box_loc", label: "Box Location" },
        { field: "plan_qty", label: "Quantity to be handled" },
        { field: "actual_qty", label: "Scanned Quantity" },
        { field: "status", label: "Order Status" },

    ];

    const handleFilterMrsChange = (name) => (e) =>
        setFiltersMrs((prev) => ({ ...prev, [name]: e.target.value }));


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={5}>
                <MDTypography variant="h3" mb={2}>
                    T1M Store
                </MDTypography>
                {/* Navigate Button */}
                <MDBox display="flex" justifyContent="flex-end" px={3}>
                    <MDButton variant="contained" color="success" onClick={() => navigate("/order/list")}>
                    Orders
                    </MDButton>
                </MDBox>

            <MDBox mt={3}>
                <Grid container spacing={2} >
                    {/* Card Mannul control */}
                    <Grid item xs={12} >
                        <Card>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} lg={6}>
                                    <MDBox mt={3} p={3}>
                                        <MDBox display="flex" alignItems="center" height="100%">
                                            <MDTypography variant="h2" color="inherit">
                                                Manual Control
                                            </MDTypography>
                                        </MDBox>

                                        <MDBox >
                                            <MDTypography variant="body01" color="inherit" fontWeight=""  >
                                                Override Aisle Movement
                                            </MDTypography>
                                        </MDBox>
                                    </MDBox>
                                </Grid>
                                <Grid item xs={12} sm={6} lg={6}>
                                    <MDBox mt={3} p={3}>
                                        <MDBox mt={3}>
                                            <MDTypography variant="body01" color="inherit"  >
                                                Aisle Selection
                                            </MDTypography>
                                        </MDBox>
                                        {/* FormControl ตรงกลาง */}
                                        <MDBox display="flex" mt={2}>
                                            <FormControl>
                                                <StyledSelect
                                                    sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                                                    name="aisel_id"
                                                    value={formData.aisel_id ?? ""}
                                                    onChange={handleChange}
                                                    displayEmpty
                                                >
                                                    <StyledMenuItem value="" disabled>
                                                        Select Aisel (dropdown)
                                                    </StyledMenuItem>
                                                    {Aisle.map((a) => (
                                                        <MenuItem key={a.value} value={a.value}>
                                                            {a.text}
                                                        </MenuItem>
                                                    ))}
                                                </StyledSelect>
                                            </FormControl>
                                        </MDBox>

                                        {/* เปลี่ยนจาก "New Destination" เป็นสวิตช์ Open/Close */}
                                        <MDBox display="flex" mt={2}>
                                            <FormControl>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={formData.aisel_oc === "OPEN"}
                                                            onChange={handleToggleAiselOC}
                                                            name="aisel_oc"
                                                        />
                                                    }
                                                    label={formData.aisel_oc === "OPEN" ? "OPEN" : "CLOSED"}
                                                />
                                            </FormControl>
                                        </MDBox>

                                        {/* ปุ่ม */}
                                        <MDBox display="flex" justifyContent="flex-start" gap={2} mt={3}>
                                            <MDButton color="info">Override Movement</MDButton>
                                        </MDBox>
                                    </MDBox>
                                </Grid>
                            </Grid>

                        </Card>
                    </Grid>

                    {/* Card  aisle Status*/}
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3}>
                                <MDBox mb={2} display="flex" alignItems="center">
                                    <MDTypography variant="h2">Aisle</MDTypography>
                                </MDBox>

                                {/* Search Row */}
                                <Grid container spacing={2}>


                                    {/* <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">Last Open</MDTypography>
                                        </MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="dd/mm/yyyy"
                                            value={filters.last_opened_at}
                                            onChange={handleFilterChange("last_opened_at")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarMonthIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">Last Close</MDTypography>
                                        </MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="dd/mm/yyyy"
                                            value={filters.last_closed_at}
                                            onChange={handleFilterChange("last_closed_at")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarMonthIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">Last Event</MDTypography>
                                        </MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="dd/mm/yyyy"
                                            value={filters.last_event_at}
                                            onChange={handleFilterChange("last_event_at")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarMonthIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid> */}

                                    {/* <Grid item xs={12} sm={6} md={3}></Grid> */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">Aisle Code</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Aisle Code"
                                            value={filters.aisle_code}
                                            onChange={handleFilterChange("aisle_code")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">Status</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Code"
                                            value={filters.status}
                                            onChange={handleFilterChange("status")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    

                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">Zone</MDTypography>
                                        </MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="Zone"
                                            value={filters.bank_code}
                                            onChange={handleFilterChange("bank_code")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Table */}
                                <MDBox mt={3}>
                                    <ReusableDataTable
                                        columns={Aisle_Columns}
                                        rows={filteredAisleRows}   // ✅ ส่งผลลัพธ์ที่ถูกกรองเข้า table
                                        idField="code"
                                        defaultPageSize={10}
                                    />
                                </MDBox>
                            </MDBox>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card>
                            <MDBox mt={3} p={3}>
                                <MDBox mb={2} display="flex" alignItems="center" height="100%">
                                    <MDTypography variant="h2" color="inherit">
                                        MRS
                                    </MDTypography>
                                </MDBox>

                                {/* Search Row */}
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">MRS Code</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="MRS Code"
                                            value={filtersMrs.mrs_code}
                                            onChange={handleFilterMrsChange("mrs_code")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">Transaction Type</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Transaction Type"
                                            value={filtersMrs.type}
                                            onChange={handleFilterMrsChange("type")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    
                                    <Grid item xs={12} sm={6} md={6}></Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">Stock Item ID</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Stock Item ID"
                                            value={filtersMrs.stock_item}
                                            onChange={handleFilterMrsChange("stock_item")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">Status</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Status"
                                            value={filtersMrs.mrs_status}
                                            onChange={handleFilterMrsChange("mrs_status")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <MDBox mt={3}>
                                    <ReusableDataTable
                                        columns={MRS_Columns}
                                        rows={filteredMrsRows}
                                        idField="code"
                                        defaultPageSize={10}
                                        showActions={["stop"]}
                                        confirmSkuDisabled={(row) => row.mrs_status === "ERROR"}
                                    />
                                </MDBox>

                            </MDBox>
                        </Card>
                    </Grid>
                </Grid>
            </MDBox>
        </MDBox>

        </DashboardLayout>
    );
};
export default T1MStore;