import React, { useState,useMemo } from "react"; // นำเข้า useState และ useEffect จาก React
import { Card,Grid } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import { GlobalVar } from "../../../common/GlobalVar";
import ReusableDataTable from "../components/table_component_v2";
// import MDButton from "components/MDButton";


const ListTask = () => {
    const [filters, setFilters] = useState({
        task_date: "",
        task_time: "",
        req_date: "",
        req_time: "",
        task_id: "",
        priority: "",
        store: "",
        task_state: "",
        user_id: "",
    });


    const Task_rows = [
        { date: "10/03/2025, 12:08:12 AM", req_date: "25/05/2025, 09:08:12 AM", task_id: "TID-20250815", priority: "6", store: "T1M", task_state: "NEW", user_id: "POOL" },
        { date: "25/05/2025, 09:08:12 AM", req_date: "10/03/2025, 12:08:12 AM", task_id: "TID-20250816", priority: "5", store: "T1", task_state: "EXECUTING", user_id: "KEN" },
        { date: "30/01/2025, 01:08:12 AM", req_date: "18/09/2025, 05:08:12 AM", task_id: "TID-20250817", priority: "1", store: "T1M", task_state: "WAIT_CONFIRM", user_id: "FOLK" },
        { date: "18/09/2025, 05:08:12 AM", req_date: "10/03/2025, 12:08:12 AM", task_id: "TID-20250818", priority: "4", store: "T1", task_state: "DONE", user_id: "BENZ" },
        { date: "12/07/2025, 06:08:12 AM", req_date: "12/07/2025, 06:08:12 AM", task_id: "TID-20250819", priority: "3", store: "T1", task_state: "FAILED", user_id: "KHUN" },
        { date: "03/05/2025, 18:08:12 AM", req_date: "03/05/2025, 18:08:12 AM", task_id: "TID-20250820", priority: "2", store: "T1M", task_state: "CANCELLED", user_id: "FIRST" },
    ];

    // ---------- Utils: normalize date / time ----------
    const normalizeDMY = (v) => {
        if (!v) return "";
        const s = String(v).trim();
        const m = s.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
        if (m) {
            const d = m[1].padStart(2, "0");
            const mo = m[2].padStart(2, "0");
            return `${d}/${mo}/${m[3]}`;
        }
        const d = new Date(s);
        if (!isNaN(d)) {
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yy = d.getFullYear();
            return `${dd}/${mm}/${yy}`;
        }
        return "";
    };

    // คืนค่าเป็น "hh:mm AM/PM" (ตัดวินาทีทิ้ง), ถ้าพิมพ์มาไม่ครบก็ normalize เท่าที่ได้
    const normalizeTime12 = (v) => {
        if (!v) return "";
        const s = String(v).trim().toUpperCase();
        // จับเวลาแบบมี/ไม่มีวินาที + AM/PM (ยอม partial)
        const re = /(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?/;
        const m = s.match(re);
        if (!m) return "";
        let hh = m[1].padStart(2, "0");
        const mm = m[2];
        let ap = m[3] || ""; // อาจจะยังไม่พิมพ์ AM/PM ก็ได้
        if (ap && ap !== "AM" && ap !== "PM") ap = "";
        return ap ? `${hh}:${mm} ${ap}` : `${hh}:${mm}`; // ปล่อยให้ startsWith จับ partial ได้
    };


    // ดึง date/time จากคอลัมน์ arrival -> [ "dd/mm/yyyy", "hh:mm AM/PM" ]
    const extractDateParts = (dateStr) => {
        if (!dateStr) return ["", ""];
        const m = String(dateStr).match(
            /(\d{1,2}\/\d{1,2}\/\d{4})\s*,\s*(\d{1,2}:\d{2})(?::\d{2})?\s*([AP]M)/i
        );
        if (!m) return ["", ""];
        const normalizedDate = normalizeDMY(m[1]);
        const time = `${m[2]} ${m[3].toUpperCase()}`; // hh:mm AM/PM
        return [normalizedDate, time];
    };

    const extractReqDateParts = (reqDateStr) => {
        if (!reqDateStr) return ["", ""];
        const m = String(reqDateStr).match(
            /(\d{1,2}\/\d{1,2}\/\d{4})\s*,\s*(\d{1,2}:\d{2})(?::\d{2})?\s*([AP]M)/i
        );
        if (!m) return ["", ""];
        const normalizedDate = normalizeDMY(m[1]);
        const time = `${m[2]} ${m[3].toUpperCase()}`; // hh:mm AM/PM
        return [normalizedDate, time];
    };


    const matchDate = (rowDate, filterDate) => {
        const f = normalizeDMY(filterDate);
        if (!f) return true;
        return rowDate === f || rowDate.startsWith(f);
    };

    const matchTime = (rowTime, filterTime) => {
        const f = normalizeTime12(filterTime);
        if (!f) return true;
        // อนุญาต partial เช่น "02:2", "02:22", "02:22 P"
        return rowTime.toUpperCase().startsWith(f.toUpperCase());
    };

    // ---------- ฟิลเตอร์ให้ตรงกับชื่อฟิลด์ ----------
    const filteredTaskRows = useMemo(() => {
        return Task_rows.filter((r) => {
            // ------- ตัวกรองอื่น ๆ -------
            const taskOk = !filters.task_id || r.task_id.toLowerCase().includes(filters.task_id.toLowerCase());
            const PriorityOk = !filters.priority || r.priority.toLowerCase().includes(filters.priority.toLowerCase());
            const storeOk = !filters.store || r.store.toLowerCase().includes(filters.store.toLowerCase());
            const TaskStateOk = !filters.task_state || r.task_state.toLowerCase().includes(filters.task_state.toLowerCase());
            const UserOk = !filters.user_id || r.user_id.toLowerCase().includes(filters.user_id.toLowerCase());

            // ------- แยก date/time ของ task_date -------
            const [rowDate, rowTime] = extractDateParts(r.date);
            const taskDateOk = matchDate(rowDate, filters.task_date);
            const taskTimeOk = matchTime(rowTime, filters.task_time);

            // ------- แยก date/time ของ req_date -------
            const [rowReqDate, rowReqTime] = extractReqDateParts(r.req_date);
            const reqDateOk = matchDate(rowReqDate, filters.req_date);
            const reqTimeOk = matchTime(rowReqTime, filters.req_time);

            // ------- รวมเงื่อนไขทั้งหมด -------
            return (
                taskOk &&
                PriorityOk &&
                storeOk &&
                TaskStateOk &&
                UserOk &&
                taskDateOk &&
                taskTimeOk &&
                reqDateOk &&
                reqTimeOk
            );
        });
    }, [Task_rows, filters]);



    const Task_columns = [
        { field: "date", label: "Date/Time" },
        { field: "req_date", label: "Req.Date/Time" },
        { field: "task_id", label: "Task ID" },
        { field: "priority", label: "Priority" },
        { field: "store", label: "Store" },
        { field: "task_state", label: "Task State" },
        { field: "user_id", label: "User" },
    ];

 const handleFilterChange = (name) => (e) =>
        setFilters((prev) => ({ ...prev, [name]: e.target.value }));



    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={5}>
                <Grid container spacing={2} >
                    {/* Card Mannul control */}
                    <Grid item xs={12} >
                        <Card>
                            <MDBox p={3}>
                                <MDBox mb={2} display="flex" alignItems="center">
                                    <MDTypography variant="h2">Task</MDTypography>
                                </MDBox>

                                {/* Search Row */}
                                <Grid container spacing={2}>
                                    {/* Date/Time  */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox><MDTypography variant="h6">Date</MDTypography></MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="dd/mm/yyyy"
                                            value={filters.task_date}
                                            onChange={handleFilterChange("task_date")}
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
                                        <MDBox><MDTypography variant="h6">Time</MDTypography></MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="--:-- AM/PM"
                                            value={filters.task_time}
                                            onChange={handleFilterChange("task_time")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <AccessTimeIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}></Grid>

                                    {/* Req.Date/Time  */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox><MDTypography variant="h6">Req.Date</MDTypography></MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="dd/mm/yyyy"
                                            value={filters.req_date}
                                            onChange={handleFilterChange("req_date")}
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
                                        <MDBox><MDTypography variant="h6">Time</MDTypography></MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="--:-- AM/PM"
                                            value={filters.req_time}
                                            onChange={handleFilterChange("req_time")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <AccessTimeIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6}></Grid>

                                    {/* Task ID  */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">
                                                Task ID
                                            </MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Task ID"
                                            value={filters.task_id}
                                            onChange={handleFilterChange("task_id")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    
                                    {/* Priority  */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">
                                                Priority
                                            </MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Priority"
                                            value={filters.priority}
                                            onChange={handleFilterChange("priority")}
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

                                    {/* Store  */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">
                                                Store
                                            </MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Store"
                                            value={filters.store}
                                            onChange={handleFilterChange("store")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    {/*  Task State  */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">
                                                Task State
                                            </MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Task State"
                                            value={filters.task_state}
                                            onChange={handleFilterChange("task_state")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    {/*  User  */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">
                                                User
                                            </MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="User"
                                            value={filters.user_id}
                                            onChange={handleFilterChange("user_id")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    {/*  ปุ่มกด  */}
                                    <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="center" alignItems="flex-end">
                                            <MDButton variant="outlined" color="info" hight="100">
                                                +  New Task
                                            </MDButton>
                                    </Grid>
                                </Grid>

                                {/* Table */}
                                <MDBox mt={5}>
                                    <ReusableDataTable
                                        columns={Task_columns}
                                        rows={filteredTaskRows}   // ✅ ส่งผลลัพธ์ที่ถูกกรองเข้า table
                                        idField="task_id"
                                        defaultPageSize={10}
                                        
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
export default ListTask;