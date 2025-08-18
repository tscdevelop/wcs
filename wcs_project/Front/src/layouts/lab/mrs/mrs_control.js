import React, { useState } from "react";
import { Card, Grid, FormControl, MenuItem } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
// import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import ReusableDataTable from "../components/table_component_v2";
// import TableComponent from "../components/table_component"; // ใช้ TableComponent
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import { Aisle } from "common/dataMain";

import AisleShelfMover from "../components/aisleshelfmove";

const MRSControl = () => {
    const [formData, setFormData] = useState({
        aisel_id: "",
    });



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const Aisle_Columns = [
        { field: "code", label: "Code" },
        { field: "status", label: "Status" },
        { field: "last_event", label: "Last Event" },
    ];

    const Aisle_Rows = [
        {
            code: "A001",
            status: "Open",
            last_event: "18:00"
        }
    ];


    const MRS_Columns = [
        { field: "code", label: "Code" },
        { field: "status", label: "Status" },
        { field: "mode", label: "Mode" },
        { field: "fault_massage", label: "Fault Massage" },
        { field: "current_task_id", label: "Current Task ID" },
        { field: "target_aisle", label: "Target Aisle" },
        { field: "battery", label: "battery" },
    ];

    const MRS = [
        {
            code: "001",
            status: "running",
            mode: "auto",
            current_task_id: "0001",
            target_aisle: "",
            battery: "75 %"
        },
    ];

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox p={2}>
                <MDBox mt={2} >
                    <MDTypography variant="h3" color="inherit">
                        MRS Control
                    </MDTypography>
                </MDBox>
            </MDBox>

            <MDBox mt={5}>
                <Grid container spacing={6}>
                    {/* Card ฝั่งซ้าย  MAP */}
                    <Grid container spacing={3} item xs={12} md={7} lg={7}>
                        <Grid item xs={12}>
                            <Card>
                            <MDBox mt={3} p={3}>
                                <MDBox mb={2} display="flex" alignItems="center" height="100%">
                                    <MDTypography variant="h2" color="inherit">
                                        MAP
                                    </MDTypography>
                                </MDBox>
                                <Grid container justifyContent="center" alignContent="center">
                                    <AisleShelfMover
                                         initialEmpty="D" stepDelayMs={450}
                                    />
                                </Grid>
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
                                    <ReusableDataTable
                                        columns={MRS_Columns}
                                        rows={MRS}
                                        idField="code"
                                        defaultPageSize={10}
                                        showActions={["stop"]}
                                    />
                                </MDBox>
                            </Card>
                        </Grid>
                    </Grid>





                    {/* Card ฝั่งซ้าย MRS   */}

                    <Grid container spacing={3} item xs={12} md={5} lg={5}>
                       
                       
                    {/* Card ฝั่งขวา aisle Status*/}
                    <Grid item xs={12} >
                        <Card>
                            <MDBox mt={3} p={3}>
                                <MDBox mb={2} display="flex" alignItems="center" height="100%">
                                    <MDTypography variant="h2" color="inherit">
                                        Aisle Status
                                    </MDTypography>
                                </MDBox>
                                <ReusableDataTable
                                    columns={Aisle_Columns}
                                    rows={Aisle_Rows}
                                    idField="code"
                                    defaultPageSize={10}
                                />
                            </MDBox>
                        </Card>
                    </Grid>

                        {/* Card ฝั่งขวา Mannul control */}
                        <Grid item xs={12} >
                            <Card>
                                <MDBox mt={3} p={3}>
                                    <MDBox mb={2} display="flex" alignItems="center" height="100%">
                                        <MDTypography variant="h2" color="inherit">
                                            Manual Control
                                        </MDTypography>
                                    </MDBox>

                                    {/* FormControl ตรงกลาง */}
                                    <MDBox display="flex" justifyContent="center" mt={2}>
                                        <FormControl>
                                            <StyledSelect
                                                sx={{ width: "350px", maxWidth: "100%", height: "45px" }}
                                                name="aisel_id"
                                                value={formData.aisel_id ?? ""}
                                                onChange={handleChange}
                                                displayEmpty
                                            >
                                                <StyledMenuItem value="" disabled>
                                                    Select a Aisel
                                                </StyledMenuItem>
                                                {Aisle.map((a) => (
                                                    <MenuItem key={a.value} value={a.value}>
                                                        {a.text}
                                                    </MenuItem>
                                                ))}
                                            </StyledSelect>
                                        </FormControl>
                                    </MDBox>

                                    {/* ปุ่มตรงกลาง */}
                                    <MDBox display="flex" justifyContent="center" gap={2} mt={3}>
                                        <MDButton color="success">Open</MDButton>
                                        <MDButton color="error">Close</MDButton>
                                    </MDBox>
                                </MDBox>
                            </Card>
                        </Grid>
                    </Grid>




                </Grid>
            </MDBox>


        </DashboardLayout>
    );
};



export default MRSControl;



// {/* ปุ่มหยุดการทำงานทั้งหมด คั่นกลาง */}
// <Grid item xs={12} >
//     <MDBox mt={3} >
//         <MDButton display="flex" color="error">
//             Stop all
//         </MDButton>
//     </MDBox>
// </Grid>