import React, { useEffect, useState } from 'react';
import Card from "@mui/material/Card";
import { Box, Typography } from '@mui/material';

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { GlobalVar } from 'common/GlobalVar';
import UserApi from 'api/UserAPI';

import { getPublicAssetUrl } from "utils/BaseHelper";
//import * as Constants from "common/constants";

function BlankTemp() {
  //const imageUrl = Constants.BASE_URL + "/image/getimage?imagename=" + "cnp-logo-01.png";
  const [employeeData, setEmployeeData] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

//const imageLogoURL =getPublicAssetUrl(Constants.IMAGE_LOGO);

const [username, setUsername] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userID = GlobalVar.getUserId();
        const token = GlobalVar.getToken();

        if (userID && token) {
          setUserId(userID);

          // Fetch employee data by user ID with authorization
          const response = await UserApi.getUserDataById(userID);
          if (response.isCompleted && !response.isError) {
            setEmployeeData(response.data);
          } else {
            console.error('Failed to fetch employee data:', response.message);
          }
        } else {
          console.error("No user ID or token found in localStorage");
        }
      } catch (error) {
        console.error("An error occurred during getUserDataById", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <Card>
          <Box p={2}>
            
          
    <form onSubmit={handleSubmit}>
      <MDInput
        label="Username"
        variant="outlined"
        value={username}
        onChange={handleUsernameChange}
        required
        error={isSubmitted && username.trim() === ''}
        helperText={isSubmitted && username.trim() === '' ? 'Required field' : ''}
      />
      <br/>
      <MDButton type="button" variant="contained" color="primary" style={{ marginTop: '16px' }}>
        OK
      </MDButton>
      <MDButton type="button" variant="contained" color="secondary" style={{ marginTop: '16px' }}>
        Cancel
      </MDButton>
    </form>
  
            <Typography variant="h5">Employee Information</Typography>
            <Typography variant="body1">Employee ID: {employeeData.employee_id}</Typography>
            <Typography variant="body1">Employee Code: {employeeData.emp_code}</Typography>
            <Typography variant="body1">Title: {employeeData.title_name}</Typography>
            <Typography variant="body1">First Name: {employeeData.first_name}</Typography>
            <Typography variant="body1">Last Name: {employeeData.last_name}</Typography>
            <Typography variant="body1">Nickname: {employeeData.nick_name}</Typography>
            <Typography variant="body1">Position: {employeeData.position}</Typography>
            <Typography variant="body1">Department: {employeeData.department}</Typography>
            <Typography variant="body1">Sex: {employeeData.sex}</Typography>
            <Typography variant="body1">Blood Group: {employeeData.blood_group}</Typography>
            <Typography variant="body1">Birth Date: {employeeData.birth_date}</Typography>
            <Typography variant="body1">Age: {employeeData.age}</Typography>
            <Typography variant="body1">Nationality: {employeeData.nationality}</Typography>
            <Typography variant="body1">Ethnicity: {employeeData.ethnicity}</Typography>
            <Typography variant="body1">Religion: {employeeData.religion}</Typography>
            <Typography variant="body1">ID Card Number: {employeeData.idcard_number}</Typography>
            <Typography variant="body1">Contact: {employeeData.contact}</Typography>
            <Typography variant="body1">Email: {employeeData.email}</Typography>
            <Typography variant="body1">Address: {employeeData.address}</Typography>
            <Typography variant="body1">Address Number: {employeeData.address_number}</Typography>
            <Typography variant="body1">Alley: {employeeData.alley}</Typography>
            <Typography variant="body1">Road: {employeeData.road}</Typography>
            <Typography variant="body1">Province: {employeeData.province}</Typography>
            <Typography variant="body1">District: {employeeData.district}</Typography>
            <Typography variant="body1">Subdistrict: {employeeData.subdistrict}</Typography>
            <Typography variant="body1">Postal Code: {employeeData.postal_code}</Typography>
            <Typography variant="body1">Employee Status: {employeeData.employee_status}</Typography>
            <Typography variant="body1">Active: {employeeData.is_active ? 'Yes' : 'No'}</Typography>
            <Typography variant="body1">Created Date: {employeeData.create_date}</Typography>
            <Typography variant="body1">Created By: {employeeData.create_by}</Typography>
            <Typography variant="body1">Updated Date: {employeeData.update_date}</Typography>
            <Typography variant="body1">Updated By: {employeeData.update_by}</Typography>
            <Typography variant="body1">Hospital Name: {employeeData.hospital?.name_th}</Typography>
            <Typography variant="body1">Hospital Contact: {employeeData.hospital?.contact}</Typography>
            {/* Add more fields as needed */}
          </Box>
          <Box p={2}>
            <Typography variant="h5">Image Display</Typography>
            <img src={getPublicAssetUrl(GlobalVar.getHospitalLogo())}></img>
          </Box>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default BlankTemp;
