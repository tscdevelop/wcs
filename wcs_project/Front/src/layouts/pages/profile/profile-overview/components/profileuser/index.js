import React, { useState, useEffect } from "react";
import * as Constants from "../../../../../../common/constants";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Card from "@mui/material/Card";
import { CardContent, Grid, Avatar, Typography, IconButton } from '@mui/material';
import { Phone, Email, Home, ArrowBack } from '@mui/icons-material';
import UserApi from "api/user.api";
import { GlobalVar } from 'common/GlobalVar'; // import GlobalVar

function ProfileUser() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userID = GlobalVar.getUserId();
        const token = GlobalVar.getToken();

        if (userID && token) {
          // Fetch employee data by user ID with authorization
          const response = await UserApi.getUserDataById(userID);
          if (response.isCompleted && !response.isError) {
            setUserData(response.data.employee || {});
          } else {
            console.error('Failed to fetch employee data:', response.message);
            setError(response.message);
          }
        } else {
          console.error("No user ID or token found in localStorage");
          setError("No user ID or token found in localStorage");
        }
      } catch (error) {
        console.error("An error occurred during getUserDataById", error.message);
        setError("An error occurred during getUserDataById: " + error.message);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <MDTypography variant="body1">Loading user data...</MDTypography>;
  }

  if (error) {
    return <MDTypography variant="body1" color="error">{error}</MDTypography>;
  }

  if (!userData) {
    return <MDTypography variant="body1">No user data available</MDTypography>;
  }

  const { 
    title_name, first_name, last_name, nick_name, photo_url, contact, email, address, sex, blood_group, 
    birth_date, age, nationality, religion, idcard_number, department, position 
  } = userData;

  return (
    <MDBox p={3} borderRadius="lg" shadow="md" mx={3} mt={3}>
      <Card>
        <CardContent>
          <Grid container spacing={2} mt={2} alignItems="center">
            <Grid item>
              <IconButton>
                <ArrowBack />
              </IconButton>
            </Grid>
            <Grid item xs={2}>   
              <Typography variant="h3" fontWeight="medium">
                ข้อมูลส่วนตัว
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={2}>
              <Avatar
                src={photo_url ? `${Constants.BASE_URL}${photo_url}` : '/path/to/default/avatar.jpg'}
                alt={`${first_name || ''} ${last_name || ''}`}
                style={{ width: '300px', height: '300px', borderRadius: '5%', margin: 'auto'}}
              />
            </Grid>
            <Grid item xs={12} md={10} mt={3}>
              <Typography variant="h3" fontWeight="medium" style={{margin: 'auto'}}>
                {`${title_name || 'ยังไม่ลงทะเบียน Employee'} ${first_name || ''} ${last_name || ''} (${nick_name || ''})`}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {`ตำแหน่ง: ${position || '-'} | แผนก: ${department || '-'}`}
              </Typography>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <Phone />
                </Grid>
                <Grid item>
                  <Typography>{contact || '-'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <Email />
                </Grid>
                <Grid item>
                  <Typography>{email || '-'}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <Home />
                </Grid>
                <Grid item>
                  <Typography>{address || '-'}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <MDBox mt={5}>
            <Card>
              <CardContent>
                <Typography variant="h3">ข้อมูลสัตวแพทย์</Typography>
                <Grid container spacing={2} mt={2}>
                  <Grid item xs={2.4} style={{ display: 'flex', flexDirection: 'column' ,justifyContent: 'space-around'}}>
                    <Grid>
                      <Typography variant="subtitle1" color="textSecondary" gutterBottom>รหัสประจำตัว:</Typography>
                      <Typography>{idcard_number || '-'}</Typography>
                    </Grid>
                    <Grid>
                      <Typography variant="subtitle1" color="textSecondary" gutterBottom>อายุ:</Typography>
                      <Typography>{age ? `${age} ปี` : '-'}</Typography>
                    </Grid>
                    <Grid>
                      <Typography variant="subtitle1" color="textSecondary" gutterBottom>สัญชาติ:</Typography>
                      <Typography>{nationality || '-'}</Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={2.4}>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>ตำแหน่ง:</Typography>
                    <Typography>{position || '-'}</Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>เพศ:</Typography>
                    <Typography>{sex || '-'}</Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>ศาสนา:</Typography>
                    <Typography>{religion || '-'}</Typography>
                  </Grid>
                  <Grid item xs={2.4}>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>แผนก:</Typography>
                    <Typography>{department || '-'}</Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>กรุ๊ปเลือด:</Typography>
                    <Typography>{blood_group || '-'}</Typography>
                  </Grid>
                  <Grid item xs={2.4}>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>ความเชี่ยวชาญ:</Typography>
                    <Typography>เริ่มต้น</Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>วันเดือนปีเกิด:</Typography>
                    <Typography>{birth_date ? new Date(birth_date).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}</Typography>
                  </Grid>
                  <Grid item xs={2.4}>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>เชื้อชาติ:</Typography>
                    <Typography>{nationality || '-'}</Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>วันเริ่มต้นทำงาน:</Typography>
                    <Typography>{new Date('2019-03-07').toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </MDBox>
        </CardContent>
      </Card>
    </MDBox>
  );
}

export default ProfileUser;
