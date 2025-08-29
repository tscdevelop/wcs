import React, { useState, useMemo } from "react";
import { Card, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import ReusableDataTable from "../components/table_component_v2";
import {InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";


const Report = () => {
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


    //Card Daily Summary
    const [filtersDaily, setFiltersDaily] = useState({
        daily_sum_time: "",
    });

    const Daily_Rows = [
        { daily_date: "05/05/2025, 08:18:12 AM", system_usage: "78%", device: "AGV-102", throughput: "120", total_work: "2", avg_working: "45", avg_battery: "68%", common_problem: "-" },
        { daily_date: "15/08/2025, 08:18:12 AM", system_usage: "84%", device: "WRS-07", throughput: "95", total_work: "0", avg_working: "38", avg_battery: "N/A", common_problem: "Rack Jam Fixed" },
        { daily_date: "27/01/2025, 08:18:12 AM", system_usage: "65", device: "AGV-103", throughput: "105", total_work: "1", avg_working: "36", avg_battery: "42%", common_problem: "Battery swapped" },
    ];

    // ฟิลด์คอลัมน์
    const Daily_Columns = [
        { field: "daily_date", label: "Date/Time" },
        { field: "system_usage", label: "System Usage(%)" },
        { field: "device", label: "Device/System" },
        { field: "throughput", label: "Throughput (Jobs/Tasks)" },
        { field: "total_work", label: "Total workload" },
        { field: "avg_working", label: "Avg. Working Time (s)" },
        { field: "avg_battery", label: "Avg.Battery (%)" },
        { field: "common_problem", label: "Common problems" },
    ];

    // ดึง date/time จากคอลัมน์ date -> [ "dd/mm/yyyy", "hh:mm AM/PM" ]
    const extractDailyParts = (daily_date) => {
        if (!daily_date) return ["", ""];
        const m = String(daily_date).match(
            /(\d{1,2}\/\d{1,2}\/\d{4})\s*,\s*(\d{1,2}:\d{2})(?::\d{2})?\s*([AP]M)/i
        );
        if (!m) return ["", ""];
        const dates = normalizeDMY(m[1]);
        const time = `${m[2]} ${m[3].toUpperCase()}`; // hh:mm AM/PM
        return [dates, time];
    };

    // กรองข้อมูลตาม filtersWRS
    const filteredDailyRows = useMemo(() => {
        return Daily_Rows.filter((r) => {
            const [rowTime] = extractDailyParts(r.date);
            const timeOk = matchTime(rowTime, filtersDaily.daily_sum_time);

            return timeOk;
        });
    }, [Daily_Rows, filtersDaily]);


    const handleFilterDaliyChange = (name) => (e) =>
        setFiltersDaily((prev) => ({ ...prev, [name]: e.target.value }));


    //Card Report WRS
    const [filtersWRS, setFiltersWRS] = useState({
        wrs_date: "",
        wrs_time: "",
        wrs_id: "",
    });

    const WRS_Rows = [
        { wrs_date: "09/08/2025, 08:18:12 AM", wrs_id: "WRS-01", throughput: "120", avg_travel_time: "45", avg_battery: "68%", fault_rec: "-" },
        { wrs_date: "05/05/2025, 08:18:12 AM", wrs_id: "WRS-02", throughput: "45", avg_travel_time: "32", avg_battery: "72%", fault_rec: "-" },
        { wrs_date: "25/07/2025, 08:18:12 AM", wrs_id: "WRS-03", throughput: "135", avg_travel_time: "35", avg_battery: "N/A", fault_rec: "Battery swapped" },
    ];

    // ฟิลด์คอลัมน์
    const WRS_Columns = [
        { field: "wrs_date", label: "Date/Time" },
        { field: "wrs_id", label: "WRS ID" },
        { field: "throughput", label: "Throughput (Jobs/Tasks)" },
        { field: "avg_travel_time", label: "Avg. Travel Time (s)" },
        { field: "avg_battery", label: "Avg.Battery (%)" },
        { field: "fault_rec", label: "Fault records" },
    ];

    // ดึง date/time จากคอลัมน์ date -> [ "dd/mm/yyyy", "hh:mm AM/PM" ]
    const extractWRSParts = (wrs_date) => {
        if (!wrs_date) return ["", ""];
        const m = String(wrs_date).match(
            /(\d{1,2}\/\d{1,2}\/\d{4})\s*,\s*(\d{1,2}:\d{2})(?::\d{2})?\s*([AP]M)/i
        );
        if (!m) return ["", ""];
        const dates = normalizeDMY(m[1]);
        const time = `${m[2]} ${m[3].toUpperCase()}`; // hh:mm AM/PM
        return [dates, time];
    };


    // กรองข้อมูลตาม filtersWRS
    const filteredWrsRows = useMemo(() => {
        return WRS_Rows.filter((r) => {
            const wrsOk = !filtersWRS.wrs_id || r.wrs_id.toLowerCase().includes(filtersWRS.wrs_id.toLowerCase());

            const [rowDate, rowTime] = extractWRSParts(r.date);
            const dateOk = matchDate(rowDate, filtersWRS.wrs_date);
            const timeOk = matchTime(rowTime, filtersWRS.wrs_time);

            return wrsOk && dateOk && timeOk;
        });
    }, [WRS_Rows, filtersWRS]);

    const handleFilterWrsChange = (name) => (e) =>
        setFiltersWRS((prev) => ({ ...prev, [name]: e.target.value }));

    //Card Report MRS
    const [filtersMRS, setFiltersMRS] = useState({
        mrs_date: "",
        mrs_time: "",
        mrs_id: "",
    });

    const MRS_Rows = [
        { mrs_date: "15/08/2025, 08:18:12 AM", mrs_id: "MRS-01", throughput: "120", status_aisle: "opening", avg_battery: "68%", detected_issues: "-" },
        { mrs_date: "15/08/2025, 08:18:12 AM", mrs_id: "MRS-02", throughput: "48", status_aisle: "opening", avg_battery: "52%", detected_issues: "Rack jam fixed" },
        { mrs_date: "15/08/2025, 08:18:12 AM", mrs_id: "MRS-03", throughput: "15", status_aisle: "closing", avg_battery: "15%", detected_issues: "-" },
    ];

    // ฟิลด์คอลัมน์
    const MRS_Columns = [
        { field: "mrs_date", label: "Date/Time" },
        { field: "mrs_id", label: "MRS ID" },
        { field: "throughput", label: "Throughput (Jobs/Tasks)" },
        { field: "status_aisle", label: "status of aisle (opening/closing)" },
        { field: "avg_battery", label: "Avg.Battery (%)" },
        { field: "detected_issues", label: "detected issues" },
    ];


    // ดึง date/time จากคอลัมน์ date -> [ "dd/mm/yyyy", "hh:mm AM/PM" ]
    const extractMRSParts = (mrs_date) => {
        if (!mrs_date) return ["", ""];
        const m = String(mrs_date).match(
            /(\d{1,2}\/\d{1,2}\/\d{4})\s*,\s*(\d{1,2}:\d{2})(?::\d{2})?\s*([AP]M)/i
        );
        if (!m) return ["", ""];
        const dates = normalizeDMY(m[1]);
        const time = `${m[2]} ${m[3].toUpperCase()}`; // hh:mm AM/PM
        return [dates, time];
    };


    // กรองข้อมูลตาม filtersMRS
    const filteredMrsRows = useMemo(() => {
        return MRS_Rows.filter((r) => {
            const mrsOk = !filtersMRS.mrs_id || r.mrs_id.toLowerCase().includes(filtersMRS.mrs_id.toLowerCase());

            const [rowDate, rowTime] = extractMRSParts(r.date);
            const dateOk = matchDate(rowDate, filtersMRS.mrs_date);
            const timeOk = matchTime(rowTime, filtersMRS.mrs_time);

            return mrsOk && dateOk && timeOk;
        });
    }, [MRS_Rows, filtersMRS]);

    const handleFilterMrsChange = (name) => (e) =>
        setFiltersMRS((prev) => ({ ...prev, [name]: e.target.value }));







    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={5}>
                <Grid container spacing={2} >
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3}>
                                <MDBox mb={2} display="flex" alignItems="center">
                                    <MDTypography variant="h2">Daily Summary</MDTypography>
                                </MDBox>
                                <Grid container spacing={2}>
                                    {/* Date */}
                                    <Grid item xs={12} sm={6} md={2}>
                                        <MDBox>
                                            <MDTypography variant="h6">Date</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="dd/mm/yyyy"
                                            value={filtersDaily.daily_sum_time}
                                            onChange={handleFilterDaliyChange("daily_sum_time")}
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
                                        columns={Daily_Columns}
                                        rows={filteredDailyRows}   // ✅ ส่งผลลัพธ์ที่ถูกกรองเข้า table
                                        idField="daily_sum_time"
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
                                        Report WRS
                                    </MDTypography>
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
                                            value={filtersWRS.wrs_date}
                                            onChange={handleFilterWrsChange("wrs_date")}
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
                                            value={filtersWRS.wrs_time}
                                            onChange={handleFilterWrsChange("wrs_time")}
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
                                            <MDTypography variant="h6">WRS ID</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="WRS ID"
                                            value={filtersWRS.wrs_id}
                                            onChange={handleFilterWrsChange("wrs_id")}
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

                                    {/* ปุ่มค้นหา/ล้างค่า */}
                                    <Grid item xs={12} sm="auto" md="auto"  display="flex" justifyContent="center" alignItems="flex-end">
                                        <MDButton variant="outlined" color="success" >
                                            Export to CSV
                                        </MDButton>
                                    </Grid>
                                    <Grid item xs={12} sm="auto" md="auto"  display="flex" justifyContent="center" alignItems="flex-end">
                                        <MDButton variant="outlined" color="error" >
                                            Export to PDF 
                                        </MDButton>
                                    </Grid>
                                </Grid>

                                <MDBox mt={3}>
                                    <ReusableDataTable
                                        columns={WRS_Columns}
                                        rows={filteredWrsRows}
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
                                        Report MRS
                                    </MDTypography>
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
                                            value={filtersMRS.mrs_date}
                                            onChange={handleFilterMrsChange("mrs_date")}
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
                                            value={filtersMRS.mrs_time}
                                            onChange={handleFilterMrsChange("mrs_time")}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <AccessTimeIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    {/* MRS ID */}
                                    <Grid item xs={12} sm={6} md={2}>
                                         <MDBox>
                                            <MDTypography variant="h6">MRS ID</MDTypography>
                                        </MDBox>
                                        <MDInput
                                            fullWidth
                                            placeholder="MRS ID"
                                            value={filtersMRS.mrs_id}
                                            onChange={handleFilterMrsChange("mrs_id")}
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

                                    {/* ปุ่มค้นหา/ล้างค่า */}
                                    <Grid item xs={12} sm="auto" md="auto"  display="flex" justifyContent="center" alignItems="flex-end">
                                        <MDButton variant="outlined" color="success" >
                                            Export to CSV
                                        </MDButton>
                                    </Grid>
                                    <Grid item xs={12} sm="auto" md="auto"  display="flex" justifyContent="center" alignItems="flex-end">
                                        <MDButton variant="outlined" color="error" >
                                            Export to PDF 
                                        </MDButton>
                                    </Grid>
                                </Grid>

                                <MDBox mt={3}>
                                    <ReusableDataTable
                                        columns={MRS_Columns}
                                        rows={filteredMrsRows}
                                        idField="code"
                                        defaultPageSize={10}
                                    />
                                </MDBox>

                            </MDBox>
                        </Card>
                    </Grid>z
                </Grid>
            </MDBox>


        </DashboardLayout>
    );
};
export default Report;