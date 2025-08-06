/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import CheckListLabInternal from "layouts/lab/checklist/checklistLabinternal";

function CheckList() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card>
      <MDBox mt={1}>
      <Grid container spacing={2}>
      <Grid item xs={12} lg={12}>
      <CheckListLabInternal></CheckListLabInternal>
      </Grid>
      </Grid>
      </MDBox>
      </Card>
      <MDBox mt={2}></MDBox>
      <Footer></Footer>
    </DashboardLayout>
  );
}

export default CheckList;
