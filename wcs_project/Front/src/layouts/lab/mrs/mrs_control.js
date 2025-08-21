import React, { useState, useMemo } from "react";
import { Card, Grid, FormControl, MenuItem } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import ReusableDataTable from "../components/table_component_v2";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import { Aisle, Destination } from "common/dataMain";
import AisleShelfMap from "../components/aisleshelfmove";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";



const MRSControl = () => {
    const [formData, setFormData] = useState({
        aisel_id: "",
        aisel_oc: "",
    });

    // ...ใน MRSControl component
    const [filters, setFilters] = useState({
        code: "",
        status: "",
        zone: "",
        lastOpen: "",   // dd/mm/yyyy
        lastClose: "",  // dd/mm/yyyy
        lastEvent: "",
    });

    const [filtersMrs, setFiltersMrs] = useState({
        current_task_id: "",
        target_aisle: "",
        mode: "",
        status: "",
        battery: "",
        fault_massage: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const Aisle_Rows = [
        { code: "MR001", status: "OPEN", zone: "A", last_open: "15/08/2025, 10:08:12 AM", last_close: "18/08/2025, 10:38:12 AM", last_event: "18/08/2025, 10:35:02 AM" },
        { code: "MR002", status: "CLOSED", zone: "B", last_open: "18/08/2025, 02:22:09 PM", last_close: "18/08/2025, 02:27:11 PM", last_event: "18/08/2025, 02:21:21 PM" },
        { code: "MR003", status: "BLOCKED", zone: "C", last_open: "18/08/2025, 02:19:38 PM", last_close: "18/08/2025, --:--:--", last_event: "18/08/2025, 02:19:38 PM" },
    ];


    // แปลงสตริงวันที่ให้เป็น dd/mm/yyyy (รองรับ dd-mm-yyyy, dd.mm.yyyy, ISO, Date)
    const normalizeDMY = (v) => {
        if (!v) return "";
        const s = String(v).trim();

        // จับ dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy ที่โผล่ที่ไหนก็ได้
        const m = s.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
        if (m) {
            const d = m[1].padStart(2, "0");
            const mo = m[2].padStart(2, "0");
            return `${d}/${mo}/${m[3]}`;
        }

        // ลอง parse date อื่น ๆ (เช่น ISO) แล้ว format เป็น dd/mm/yyyy
        const d = new Date(s);
        if (!isNaN(d)) {
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yy = d.getFullYear();
            return `${dd}/${mm}/${yy}`;
        }
        return "";
    };

    // ใช้เทียบ rowDate กับ filterDate (ให้ผ่านถ้าตรงเป๊ะหรือเริ่มต้นตรง)
    const matchDate = (rowDate, filterDate) => {
        const rowNorm = normalizeDMY(rowDate);
        const fNorm = normalizeDMY(filterDate);
        if (!fNorm) return true;           // ไม่มีฟิลเตอร์ = ผ่าน
        return rowNorm === fNorm || rowNorm.startsWith(fNorm);
    };


    // กรองข้อมูลตาม filters
    const filteredAisleRows = useMemo(() => {
        return Aisle_Rows.filter((r) => {
            const codeOk = !filters.code || r.code.toLowerCase().includes(filters.code.toLowerCase());
            const statusOk = !filters.status || r.status === filters.status;
            const zoneOk = !filters.zone || (r.zone ?? "").toLowerCase().includes(filters.zone.toLowerCase());

            const openOk = matchDate(r.last_open, filters.lastOpen);
            const closeOk = matchDate(r.last_close, filters.lastClose);

            return codeOk && statusOk && zoneOk && openOk && closeOk;
        });
    }, [Aisle_Rows, filters]);


    // ฟิลด์คอลัมน์
    const Aisle_Columns = [
        { field: "code", label: "Code" },
        { field: "status", label: "Status" },
        { field: "last_open", label: "Last Open" },
        { field: "last_close", label: "Last Close" },
        { field: "last_event", label: "Last Event" },
        { field: "zone", label: "Zone" },
    ];

    const handleFilterChange = (name) => (e) =>
        setFilters((prev) => ({ ...prev, [name]: e.target.value }));

    const MRS_Rows = [
        {
            current_task_id: "TK202501",
            target_aisle: "Aisle A",
            status: "RUNNING",
            mode: "auto",
            battery: "75 %",
            fault_massage: "Battery High"
        },
    ];

    // กรองข้อมูลตาม filters
    const filteredMrsRows = useMemo(() => {
        return MRS_Rows.filter((r) => {
            const taskOk = !filtersMrs.current_task_id || r.current_task_id.toLowerCase().includes(filtersMrs.current_task_id.toLowerCase());
            const targetOk = !filtersMrs.target_aisle || r.target_aisle === filtersMrs.target_aisle;
            const modeOk = !filtersMrs.mode || r.mode === filtersMrs.mode;
            const statusOk = !filtersMrs.status || r.status === filtersMrs.status;


            return taskOk && statusOk && modeOk && targetOk;
        });
    }, [MRS_Rows, filtersMrs]);


    const MRS_Columns = [
        { field: "current_task_id", label: "Current Task ID" },
        { field: "target_aisle", label: "Target Aisle" },
        { field: "mode", label: "Mode" },
        { field: "status", label: "Status" },
        { field: "battery", label: "battery" },
        { field: "fault_massage", label: "Fault Massage" },
    ];

    const handleFilterMrsChange = (name) => (e) =>
        setFiltersMrs((prev) => ({ ...prev, [name]: e.target.value }));


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={5}>
                <Grid container spacing={2} >
                    {/* Card ฝั่งซ้าย  MAP */}
                    <Grid item xs={12}>
                        <Card>
                            <MDBox mt={3} p={3}>
                                <MDBox mb={6} display="flex" alignItems="center" height="100%">
                                    <MDTypography variant="h2" color="inherit">
                                        T1M Store
                                    </MDTypography>
                                </MDBox>
                                {/* แผนที่แสดงการขยับชั้นวาง (ดูอย่างเดียว) */}
                                <Grid container justifyContent="center" alignContent="center">
                                    <AisleShelfMap
                                        initialEmpty="A"
                                        stepDelayMs={450}
                                        onComplete={() => console.log("Move complete")}
                                    />
                                </Grid>
                            </MDBox>
                        </Card>
                    </Grid>
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

                                        <MDBox mt={3} >
                                            <MDTypography variant="body01" color="inherit" >
                                                New Destination
                                            </MDTypography>
                                        </MDBox>

                                        <MDBox display="flex" mt={2}>
                                            <FormControl>
                                                <StyledSelect
                                                    sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                                                    name="aisel_oc"
                                                    value={formData.aisel_oc ?? ""}
                                                    onChange={handleChange}
                                                    displayEmpty

                                                >
                                                    <StyledMenuItem value="" disabled>
                                                        Select Destination (Select Open - Close)
                                                    </StyledMenuItem>
                                                    {Destination.map((a) => (
                                                        <MenuItem key={a.value} value={a.value}>
                                                            {a.text}
                                                        </MenuItem>
                                                    ))}
                                                </StyledSelect>
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
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDInput
                                            fullWidth
                                            label="Code"
                                            placeholder="Code"
                                            value={filters.code}
                                            onChange={handleFilterChange("code")}
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
                                        <FormControl fullWidth>
                                            <StyledSelect
                                                sx={{ height: "45px" }}
                                                displayEmpty
                                                value={filters.status}
                                                onChange={handleFilterChange("status")}
                                            >
                                                <StyledMenuItem value="">
                                                    Status
                                                </StyledMenuItem>
                                                <MenuItem value="OPEN">OPEN</MenuItem>
                                                <MenuItem value="CLOSED">CLOSED</MenuItem>
                                                <MenuItem value="BLOCKED">BLOCKED</MenuItem>
                                            </StyledSelect>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Zone"
                                            placeholder="Zone"
                                            value={filters.zone}
                                            onChange={handleFilterChange("zone")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}></Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Last Open"
                                            placeholder="dd/mm/yyyy"
                                            value={filters.lastOpen}
                                            onChange={handleFilterChange("lastOpen")}
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
                                        <TextField
                                            fullWidth
                                            label="Last Close"
                                            placeholder="dd/mm/yyyy"
                                            value={filters.lastClose}
                                            onChange={handleFilterChange("lastClose")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarMonthIcon />
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
                                        <MDInput
                                            fullWidth
                                            label="Task ID"
                                            placeholder="Task ID"
                                            value={filtersMrs.current_task_id}
                                            onChange={handleFilterMrsChange("current_task_id")}
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
                                        <FormControl fullWidth>
                                            <StyledSelect
                                                sx={{ height: "45px" }}
                                                displayEmpty
                                                value={filtersMrs.target_aisle}
                                                onChange={handleFilterMrsChange("target_aisle")}
                                            >
                                                <StyledMenuItem value="">
                                                    Target Aisle
                                                </StyledMenuItem>
                                                <MenuItem value="OPEN">Aisle A</MenuItem>
                                                <MenuItem value="CLOSED">Aisle B</MenuItem>
                                                <MenuItem value="BLOCKED">Aisle C</MenuItem>
                                            </StyledSelect>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}></Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth>
                                            <StyledSelect
                                                sx={{ height: "45px" }}
                                                displayEmpty
                                                value={filtersMrs.mode}
                                                onChange={handleFilterMrsChange("mode")}
                                            >
                                                <StyledMenuItem value="">
                                                    Mode
                                                </StyledMenuItem>
                                                <MenuItem value="OPEN">Auto</MenuItem>
                                                <MenuItem value="CLOSED">Manual</MenuItem>
                                                <MenuItem value="BLOCKED">Maintenance</MenuItem>
                                            </StyledSelect>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth>
                                            <StyledSelect
                                                sx={{ height: "45px" }}
                                                displayEmpty
                                                value={filtersMrs.status}
                                                onChange={handleFilterMrsChange("status")}
                                            >
                                                <StyledMenuItem value="">
                                                    Status
                                                </StyledMenuItem>
                                                <MenuItem value="OPEN">IDLE</MenuItem>
                                                <MenuItem value="CLOSED">RUNNING</MenuItem>
                                                <MenuItem value="BLOCKED">ERROR</MenuItem>
                                            </StyledSelect>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}></Grid>

                                    {/* ปุ่มค้นหา/ล้างค่า */}
                                    <Grid item xs={12} sm="auto" md="auto">
                                        <MDButton variant="outlined" color="info" >
                                            New Control
                                        </MDButton>
                                    </Grid>
                                    <Grid item xs={12} sm="auto"  md="auto">
                                        <MDButton variant="outlined" color="info" >
                                            Queue Check
                                        </MDButton>
                                    </Grid>
                                </Grid>

                                <MDBox mt={3}>
                                    <ReusableDataTable
                                        columns={MRS_Columns}
                                        rows={filteredMrsRows}
                                        idField="code"
                                        defaultPageSize={10}
                                        showActions={["stop"]}
                                    />
                                </MDBox>

                            </MDBox>
                        </Card>
                    </Grid>
                </Grid>
            </MDBox>


        </DashboardLayout>
    );
};
export default MRSControl;