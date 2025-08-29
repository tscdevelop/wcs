import React, { useState, useEffect } from "react";
import { Card, Grid, FormControl, MenuItem, Divider ,SvgIcon } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import { Aisle } from "common/dataMain";



// รถยก/ดอลลี่ + กล่องซ้อน (โทนเดียวกับภาพ)
const DollyIcon = (props) => (
  <SvgIcon viewBox="0 0 24 24" {...props}>
    {/* มือจับตั้ง */}
    <path d="M5 3v13h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* ล้อ */}
    <circle cx="5" cy="16" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
    {/* ฐานล่าง */}
    <path d="M5 16h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* กล่องบน/ล่าง */}
    <rect x="11" y="5" width="6" height="4" rx="0.8" fill="currentColor" />
    <rect x="11" y="11" width="6" height="4" rx="0.8" fill="currentColor" />
  </SvgIcon>
);

// // โดรนยกของ (ตัวเลือกสำรอง)
// const DroneCargoIcon = (props) => (
//   <SvgIcon viewBox="0 0 24 24" {...props}>
//     {/* แขนและใบพัด */}
//     <path d="M12 7l5-3M12 7l-5-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
//     <path d="M17 4h3M4 4h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//     {/* ลำตัว */}
//     <rect x="10" y="7" width="4" height="2" rx="1" fill="currentColor" />
//     {/* เชือก */}
//     <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
//     {/* กล่อง */}
//     <rect x="10" y="13" width="4" height="4" rx="0.6" fill="currentColor" />
//   </SvgIcon>
// );

const T1Store = () => {
    const [formData, setFormData] = useState({
        agv: "",
        agv_movement: "",
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const [agv, setAgv] = useState({
        name: "AGV 1",
        status: "Running",
        battery: 87,
    });


    // mock realtime เปลี่ยนแบตเล็กน้อยทุก 2 วิ (ภายหลังเปลี่ยนมาอ่านจาก backend/WS)
    useEffect(() => {
        const t = setInterval(() => {
            setAgv((prev) => {
                const next = Math.max(0, Math.min(100, prev.battery + (Math.random() < 0.5 ? -1 : 1)));
                return { ...prev, battery: next };
            });
        }, 2000);
        return () => clearInterval(t);
    }, []);

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox mt={5}>
                <Grid container spacing={2} >
                    {/* Card Mannul control */}
                    <Grid item xs={12}>
                        <Card>
                            <Grid container spacing={2} alignItems="center" >
                                <Grid item xs={12} sm={6} lg={6}>
                                    <MDBox mt={3} p={3}>
                                        <MDBox display="flex" alignItems="center" height="100%">
                                            <MDTypography variant="h2" color="inherit">
                                                AGV Status
                                            </MDTypography>
                                        </MDBox>

                                        <MDBox mt={2} >
                                            <MDTypography variant="body01" color="inherit"  >
                                                List of AGVs with Status & Battery Levels
                                            </MDTypography>
                                        </MDBox>
                                    </MDBox>
                                </Grid>
                                <Grid item xs={12} sm={6} lg={6}>
                                    <MDBox mt={3} p={3}>
                                        <MDBox display="flex" alignItems="center" justifyContent="space-between">
                                            {/* ซ้าย: ไอคอน + ชื่อ + สถานะ */}
                                            <MDBox display="flex" alignItems="center" gap={2}>
                                                <MDBox
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: "50%",
                                                        bgcolor: "#f2f4f7",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <DollyIcon sx={{ fontSize: 28, color: "#101828" }} />
                                                </MDBox>

                                                <MDBox>
                                                    <MDTypography variant="h6" color="inherit">
                                                        {agv.name}
                                                    </MDTypography>
                                                    <MDTypography variant="button" sx={{ color: "text.secondary" }}>
                                                        Status: {agv.status}
                                                    </MDTypography>
                                                </MDBox>
                                            </MDBox>

                                            {/* ขวา: Battery Level */}
                                            <MDTypography variant="h6" color="inherit">
                                                Battery Level:{" "}
                                                <MDBox component="span" sx={{ fontWeight: 700 }}>
                                                    {agv.battery}%
                                                </MDBox>
                                            </MDTypography>
                                        </MDBox>

                                        {/* เส้นคั่นด้านล่าง */}
                                        <Divider sx={{ mt: 2 }} />
                                    </MDBox>

                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>



                    <Grid item xs={12} >
                        <Card>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} lg={6}>
                                    <MDBox mt={3} p={3}>
                                        <MDBox display="flex" alignItems="center" height="100%">
                                            <MDTypography variant="h2" color="inherit">
                                                Manual AGV Control
                                            </MDTypography>
                                        </MDBox>

                                        <MDBox mt={2} >
                                            <MDTypography variant="body01" color="inherit" fontWeight=""  >
                                                Take mannul control over AGV movement
                                            </MDTypography>
                                        </MDBox>
                                    </MDBox>
                                </Grid>
                                <Grid item xs={12} sm={6} lg={6}>
                                    <MDBox mt={3} p={3}>
                                        <MDBox mt={3}>
                                            <MDTypography variant="body01" color="inherit"  >
                                                AGV Selection
                                            </MDTypography>
                                        </MDBox>
                                        {/* FormControl ตรงกลาง */}
                                        <MDBox display="flex" mt={2}>
                                            <FormControl>
                                                <StyledSelect
                                                    sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                                                    name="agv"
                                                    value={formData.agv ?? ""}
                                                    onChange={handleChange}
                                                    displayEmpty
                                                >
                                                    <StyledMenuItem value="" disabled>
                                                        Select AGV
                                                    </StyledMenuItem>
                                                    {Aisle.map((a) => (
                                                        <MenuItem key={a.value} value={a.value}>
                                                            {a.text}
                                                        </MenuItem>
                                                    ))}
                                                </StyledSelect>
                                            </FormControl>
                                        </MDBox>


                                        <MDBox mt={3}>
                                            <MDTypography variant="body01" color="inherit"  >
                                                Movement Direction
                                            </MDTypography>
                                        </MDBox>
                                        {/* FormControl ตรงกลาง */}
                                        <MDBox display="flex" mt={2}>
                                            <FormControl>
                                                <MDInput
                                                    sx={{ width: "300px", maxWidth: "100%", height: "45px" }}
                                                    name="agv_movement"
                                                    placeholder="Enter direction"
                                                    value={formData.agv_movement ?? ""}
                                                    onChange={handleChange}

                                                />

                                            </FormControl>
                                        </MDBox>



                                        {/* ปุ่ม */}
                                        <MDBox display="flex" justifyContent="flex-start" gap={2} mt={3}>
                                            <MDButton color="info" sx={{ width: "180px", maxWidth: "100%" }}>Override Control</MDButton>
                                        </MDBox>
                                        <MDBox display="flex" justifyContent="flex-start" gap={2} mt={2}>
                                            <MDButton color="error" sx={{ width: "180px", maxWidth: "100%" }}>Emergency Stop</MDButton>
                                        </MDBox>
                                    </MDBox>
                                </Grid>
                            </Grid>

                        </Card>
                    </Grid>
                </Grid>
            </MDBox>
        </DashboardLayout>
    );
};
export default T1Store;