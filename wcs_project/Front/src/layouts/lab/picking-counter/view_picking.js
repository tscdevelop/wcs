import React, { useState, useMemo } from "react";
import { Card, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import ReusableDataTable from "../components/table_component_v2";
// import { Aisle, Destination } from "common/dataMain";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";


const PickingCounter = () => {
    const [filters, setFilters] = useState({
        current_task_id: "",
        sku_id: "",
        agv_id: "",
        arrival_date: "",   // dd/mm/yyyy (พิมพ์บางส่วนได้ เช่น 18/08)
        arrival_time: "",   // hh:mm AM/PM (พิมพ์บางส่วนได้ เช่น 02:2 หรือ 02:22 P)
    });

    const Picking_rows = [
        { counter: "MR001", status: "ready-to-pick", current_task_id: "TK20251", agv_id: "AGV-01", sku_id: "SKU#00001", quantity: "25", arrival: "15/08/2025, 10:08:12 AM" },
        { counter: "MR002", status: "idle", current_task_id: "TK20252", agv_id: "AGV-02", sku_id: "SKU#00002", quantity: "50", arrival: "18/08/2025, 02:22:09 PM" },
        { counter: "MR003", status: "time out", current_task_id: "TK20253", agv_id: "AGV-03", sku_id: "SKU#00003", quantity: "48", arrival: "18/08/2025, 12:19:38 PM" },
        { counter: "MR004", status: "idle", current_task_id: "TK20254", agv_id: "AGV-04", sku_id: "SKU#00004", quantity: "48", arrival: "08/08/2025, 18:19:38 PM" },
        { counter: "MR005", status: "time out", current_task_id: "TK20255", agv_id: "AGV-05", sku_id: "SKU#00005", quantity: "15", arrival: "05/08/2025, 11:19:38 PM" },
        { counter: "MR006", status: "ready-to-pick", current_task_id: "TK20256", agv_id: "AGV-06", sku_id: "SKU#00006", quantity: "85", arrival: "25/08/2025, 01:19:38 PM" },
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
    const extractArrivalParts = (arrival) => {
        if (!arrival) return ["", ""];
        const m = String(arrival).match(
            /(\d{1,2}\/\d{1,2}\/\d{4})\s*,\s*(\d{1,2}:\d{2})(?::\d{2})?\s*([AP]M)/i
        );
        if (!m) return ["", ""];
        const date = normalizeDMY(m[1]);
        const time = `${m[2]} ${m[3].toUpperCase()}`; // hh:mm AM/PM
        return [date, time];
    };

    const matchDate = (rowArrivalDate, filterDate) => {
        const f = normalizeDMY(filterDate);
        if (!f) return true;
        return rowArrivalDate === f || rowArrivalDate.startsWith(f);
    };

    const matchTime = (rowArrivalTime, filterTime) => {
        const f = normalizeTime12(filterTime);
        if (!f) return true;
        // อนุญาต partial เช่น "02:2", "02:22", "02:22 P"
        return rowArrivalTime.toUpperCase().startsWith(f.toUpperCase());
    };

    // ---------- สร้างชิปสีของสถานะ ----------
    const getStatusChip = (status) => {
        const map = {
            "ready-to-pick": { bg: "#CDEAC8", fg: "#207227" }, // เขียวอ่อน / เขียวเข้ม
            "idle": { bg: "#FFE4B5", fg: "#B05A00" }, // ส้มอ่อน / ส้มเข้ม
            "time out": { bg: "#F3C6C6", fg: "#9D1C1C" }, // แดงอ่อน / แดงเข้ม
        };
        const c = map[status] || { bg: "#EEE", fg: "#333" };
        return (
            <MDBox
                component="span"
                sx={{
                    backgroundColor: c.bg,
                    color: c.fg,
                    fontWeight: 700,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "8px",
                    display: "flex",              // ทำให้เป็น flex
                    justifyContent: "center",     // จัดกลางแนวนอน
                    alignItems: "center",         // จัดกลางแนวตั้ง
                    textAlign: "center",          // เผื่อกรณีข้อความหลายบรรทัด
                    fontSize: "0.9rem",
                    minWidth: "100px",            // ✅ กันตัวอักษรไม่เบี้ยว (option)
                }}
            >
                {status}
            </MDBox>
        );
    };

    // ---------- ฟิลเตอร์ให้ตรงกับชื่อฟิลด์ ----------
    const filteredPickingRows = useMemo(() => {
        return Picking_rows.filter((r) => {
            const taskOk = !filters.current_task_id ||
                r.current_task_id.toLowerCase().includes(filters.current_task_id.toLowerCase());

            const skuOk = !filters.sku_id ||
                r.sku_id.toLowerCase().includes(filters.sku_id.toLowerCase());

            const agvOk = !filters.agv_id ||
                r.agv_id.toLowerCase().includes(filters.agv_id.toLowerCase());

            const [rowDate, rowTime] = extractArrivalParts(r.arrival);
            const dateOk = matchDate(rowDate, filters.arrival_date);
            const timeOk = matchTime(rowTime, filters.arrival_time);

            return taskOk && skuOk && agvOk && dateOk && timeOk;
        })
            // map เพื่อใส่ชิปสีในคอลัมน์ status (เก็บค่าเดิมไว้สำหรับตรรกะอื่น ๆ)
            .map((r) => ({ ...r, status_node: getStatusChip(r.status) }));
    }, [Picking_rows, filters]);

    // ---------- Columns ----------
    const Picking_Columns = [
        { field: "counter", label: "Counter" },
        { field: "current_task_id", label: "Current Task ID" },
        { field: "agv_id", label: "AGV ID" },
        { field: "sku_id", label: "SKU ID" },
        { field: "quantity", label: "QTY" },
        // แสดงชิปสีในตาราง
        { field: "status_node", label: "Status" },
        { field: "arrival", label: "Arrival" },
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
                                    <MDTypography variant="h2">Picking Counter</MDTypography>
                                </MDBox>

                                {/* Search Row */}
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox>
                                            <MDTypography variant="h6">
                                                Task ID
                                            </MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            label="Task ID"
                                            placeholder="Task ID"
                                            value={filters.current_task_id}
                                            onChange={handleFilterChange("current_task_id")}
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
                                            <MDTypography variant="h6">
                                                AGV ID
                                            </MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="AGV ID"
                                            value={filters.agv_id}
                                            onChange={handleFilterChange("agv_id")}
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
                                            <MDTypography variant="h6">
                                                SKU ID
                                            </MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="SKU ID"
                                            value={filters.sku_id}
                                            onChange={handleFilterChange("sku_id")}
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
                                    {/* Arrival Date */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox><MDTypography variant="h6">Arrival Date</MDTypography></MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="dd/mm/yyyy"
                                            value={filters.arrival_date}
                                            onChange={handleFilterChange("arrival_date")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarMonthIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    {/* Arrival Time → เปลี่ยนเป็นกรอกเวลา */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDBox><MDTypography variant="h6">Arrival Time</MDTypography></MDBox>
                                        <TextField
                                            fullWidth
                                            placeholder="--:-- AM/PM"
                                            value={filters.arrival_time}
                                            onChange={handleFilterChange("arrival_time")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <AccessTimeIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Table */}
                                <MDBox mt={5}>
                                    <ReusableDataTable
                                        columns={Picking_Columns}
                                        rows={filteredPickingRows}   // ✅ ส่งผลลัพธ์ที่ถูกกรองเข้า table
                                        idField="code"
                                        defaultPageSize={10}
                                        showActions={["confirm"]}
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
export default PickingCounter;