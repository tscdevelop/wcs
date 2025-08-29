import React, { useState, useMemo } from "react";
import { Card, Grid, InputAdornment } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ReusableDataTable from "../components/table_component_v2";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
const Logs = () => {
    const [filters, setFilters] = useState({
        logs_task_id: "",
        logs_date: "",   // dd/mm/yyyy
        logs_time: "",
    });

    const Logs_Rows = [
        { date: "15/08/2025, 08:18:12 AM", task_id: "TID-20250815", event_action: "Task Started", order_id: "INB-4839", location: "Dock-3 Rack A2", details: "Start inbound task", duration: "12 s" },
        { date: "20/04/2025, 16:05:12 AM", task_id: "TID-20250816", event_action: "Pick Completed", order_id: "ORD-22918", location: "SKU: ABC128", details: "QTY: 12 picked", duration: "12 s" },
        { date: "31/05/2025, 02:30:12 AM", task_id: "TID-20250817", event_action: "Rack Move", order_id: "INB-7458", location: "Aisle 3", details: "Blocked", duration: "" },
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

    // ดึง date/time จากคอลัมน์ date -> [ "dd/mm/yyyy", "hh:mm AM/PM" ]
    const extractArrivalParts = (date) => {
        if (!date) return ["", ""];
        const m = String(date).match(
            /(\d{1,2}\/\d{1,2}\/\d{4})\s*,\s*(\d{1,2}:\d{2})(?::\d{2})?\s*([AP]M)/i
        );
        if (!m) return ["", ""];
        const dates = normalizeDMY(m[1]);
        const time = `${m[2]} ${m[3].toUpperCase()}`; // hh:mm AM/PM
        return [dates, time];
    };

    const matchDate = (rowLogsDate, filterDate) => {
        const f = normalizeDMY(filterDate);
        if (!f) return true;
        return rowLogsDate === f || rowLogsDate.startsWith(f);
    };

    const matchTime = (rowLosgTime, filterTime) => {
        const f = normalizeTime12(filterTime);
        if (!f) return true;
        // อนุญาต partial เช่น "02:2", "02:22", "02:22 P"
        return rowLosgTime.toUpperCase().startsWith(f.toUpperCase());
    };


    // กรองข้อมูลตาม filters
    const filteredLogsRows = useMemo(() => {
        return Logs_Rows.filter((r) => {
            const taskOk = !filters.logs_task_id || r.logs_task_id.toLowerCase().includes(filters.logs_task_id.toLowerCase());

            const [rowDate, rowTime] = extractArrivalParts(r.date);
            const dateOk = matchDate(rowDate, filters.logs_date);
            const timeOk = matchTime(rowTime, filters.logs_time);

            return taskOk && dateOk && timeOk;
        });
    }, [Logs_Rows, filters]);

    // ฟิลด์คอลัมน์
    const Logs_Columns = [
        { field: "date", label: "Date/Time" },
        { field: "task_id", label: "Task ID" },
        { field: "event_action", label: "Event / Action" },
        { field: "order_id", label: "Order ID" },
        { field: "location", label: "Location" },
        { field: "details", label: "Details/Status" },
        { field: "duration", label: "Duration" },
    ];

    const handleFilterChange = (name) => (e) =>
        setFilters((prev) => ({ ...prev, [name]: e.target.value }));



    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={5}>
                <Grid container spacing={2} >
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3}>
                                <MDBox mb={2} display="flex" alignItems="center">
                                    <MDTypography variant="h2">Logs</MDTypography>
                                </MDBox>

                                {/* Search Row */}
                                <Grid container spacing={2}>
                                    {/* Date */}
                                    <Grid item xs={12} sm={6} md={2}>
                                        <MDBox>
                                            <MDTypography variant="h6">Date</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="dd/mm/yyyy"
                                            value={filters.logs_date}
                                            onChange={handleFilterChange("logs_date")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarMonthIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    {/* Time */}
                                    <Grid item xs={12} sm={6} md={2}>
                                        <MDBox>
                                            <MDTypography variant="h6">Time</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="--:--AM/PM"
                                            value={filters.logs_time}
                                            onChange={handleFilterChange("logs_time")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <AccessTimeIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    {/* Task ID */}
                                    <Grid item xs={12} sm={6} md={2}>
                                        <MDBox>
                                            <MDTypography variant="h6">Task ID</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="Task ID"
                                            value={filters.logs_task_id}
                                            onChange={handleFilterChange("logs_task_id")}
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
                                        columns={Logs_Columns}
                                        rows={filteredLogsRows}   // ✅ ส่งผลลัพธ์ที่ถูกกรองเข้า table
                                        idField="logs_task_id"
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
export default Logs;