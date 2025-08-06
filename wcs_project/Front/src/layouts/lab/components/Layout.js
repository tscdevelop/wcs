import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  MenuItem,
  Select,
  Autocomplete,
  TextField
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const Layoutcon= () =>{
    return(
        <DashboardLayout>
        <DashboardNavbar/>
        <MDBox p={2}>
          <MDBox mt={2} ml={5}>
            <MDTypography variant="h3" color="dark" fontWeight="bold">
               {lang.msg("title.zone")}
            </MDTypography>
          </MDBox>
  
          <MDBox mt={5}>
            <Card>
              <MDBox mt={3} p={3}>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs ={12} md={6} lg={5}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4} lg={3}>
                        
                      </Grid>
                      <Grid item xs={12} sm={8} lg={9}>
  
                      </Grid>
                      <Grid item xs={12} sm={4} lg={3}>
                        
                      </Grid>
                      <Grid item xs={12} sm={8} lg={9}>
  
                      </Grid>
                      <Grid item xs={12} sm={4} lg={3}>
                        
                      </Grid>
                      <Grid item xs={12} sm={8} lg={9}>
  
                      </Grid>
                      <Grid item xs={12} sm={4} lg={3}>
                        
                      </Grid>
                      <Grid item xs={12} sm={8} lg={9}>
  
                      </Grid>
                      <Grid item xs={12} sm={4} lg={3}>
                        
                      </Grid>
                      <Grid item xs={12} sm={8} lg={9}>
  
                      </Grid>
  
                    </Grid>
                  </Grid>
  
                  <Grid item xs={12} md={6} lg={7}>
                    <Grid container>
                      <Grid item xs={12} sm={3} lg={2}>
  
                      </Grid>
                      <Grid item xs={12} sm={9} lg={8}>
  
                      </Grid>
  
                      <Grid item xs={12} lg={2}>
                        
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </MDBox>
  
  
  
            </Card>
          </MDBox>
        </MDBox>
      </DashboardLayout>
    );
}

export default Layoutcon;