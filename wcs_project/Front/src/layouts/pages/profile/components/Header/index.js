import React, { useState, useEffect } from "react";
import * as Constants from "../../../../../common/constants";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import PersonIcon from "@mui/icons-material/Person";
import IconButton from "@mui/material/IconButton";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Avatar from "@mui/material/Avatar"; // ใช้ Avatar จาก MUI
import breakpoints from "assets/theme/base/breakpoints";
import { useNavigate } from "react-router-dom";
import UserApi from "../../../../../api/UserAPI";
import { GlobalVar } from "../../../../../common/GlobalVar";
import ChangePassword from "../../../../wcs/user/setting-password"; // ตรวจสอบการนำเข้าให้ถูกต้อง
import Modal from "@mui/material/Modal"; // เพิ่มการนำเข้า Modal
import Box from "@mui/material/Box"; // เพิ่มการนำเข้า Box สำหรับจัดการการวางตำแหน่ง
import { setLanguage } from "common/language.context";
import { navbarIconButton } from "examples/Navbars/DashboardNavbar/styles";
import Icon from "@mui/material/Icon";
import { useMaterialUIController } from "context";

function Header({ children, light }) {
  const [controller, dispatch] = useMaterialUIController();
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);
  const [userID, setUserID] = useState(null);
  const [langCurrent, setLanguageCurrent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false); // เพิ่ม state สำหรับ popup
  const navigate = useNavigate();

  // ฟังก์ชันเปิด/ปิดเมนูภาษา
  const handleOpenLanguageMenu = (event) => setOpenLanguageMenu(event.currentTarget);
  const handleCloseLanguageMenu = () => setOpenLanguageMenu(false);

  // ฟังก์ชันสำหรับเปลี่ยนภาษา
  const handleLanguageChange = (language) => {
    //i18n.changeLanguage(language); // เปลี่ยนภาษาตามที่เลือก
    setLanguage(language); // เรียกใช้ setLanguage เพื่อเปลี่ยนภาษาและ i18n จะเปลี่ยนตาม
    setLanguageCurrent(language); //
    handleCloseLanguageMenu(); // ปิดเมนูภาษาหลังจากเลือก
  };
  const [openLanguageMenu, setOpenLanguageMenu] = useState(false); // State สำหรับเมนูภาษา
  // Render the language menu
  const renderLanguageMenu = () => (
    <Menu
      anchorEl={openLanguageMenu}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={Boolean(openLanguageMenu)}
      onClose={handleCloseLanguageMenu} // ปิดเมนูเมื่อคลิกภายนอก
    >
      <MenuItem onClick={() => handleLanguageChange("th")}>ไทย</MenuItem>
      <MenuItem onClick={() => handleLanguageChange("en")}>English</MenuItem>
    </Menu>
  );
  const { transparentNavbar, darkMode } = controller;
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserID = GlobalVar.getUserId();
        const token = GlobalVar.getToken();
        const language = GlobalVar.getLanguage();

        console.log("UserID:", storedUserID);
        console.log("Token:", token);
        console.log("language:", language);

        if (storedUserID && token) {
          setUserID(storedUserID);
          // Fetch profile data with authorization
          const response = await UserApi.getUserDataById(storedUserID);
          if (response.isCompleted && !response.isError) {
            console.log("Profile Data:", response.data);
            setProfile(response.data);
            setLanguageCurrent(language);
          } else {
            console.error("Failed to fetch profile data:", response.message);
          }
        } else {
          console.error("No user ID or token found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error.message);
      }
    };

    fetchData();
  }, [userID]);

  useEffect(() => {
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation();
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const handleSetTabValue = (event, newValue) => setTabValue(newValue);

  const handleNotificationClick = () => {
    alert("Notification clicked!");
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setAnchorEl(null);
  };

  const handleChangePasswordClick = () => {
    setChangePasswordOpen(true);
    setAnchorEl(null);
  };

  const handleCloseChangePassword = () => {
    setChangePasswordOpen(false);
  };

  return (
    <MDBox position="relative" mb={5}>
      <Card
        sx={{
          position: "relative",
          mt: 2,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6} lg={8}>
            <MDBox height="100%" lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {profile?.employee?.hospital?.name_th} {profile?.employee?.hospital?.name_en}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="regular">
                {profile?.employee?.hospital?.address}
              </MDTypography>
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={4} sx={{ textAlign: "right" }}>
            <MDBox display="flex" justifyContent="flex-end" alignItems="center">
              <IconButton onClick={handleNotificationClick}>
                <NotificationsIcon />
              </IconButton>
              {/* ปุ่มเมนูภาษา */}
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="language-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenLanguageMenu} // เปิดเมนูภาษาเมื่อคลิกไอคอน
              >
                <Icon sx={iconsStyle}>language</Icon> {/* ไอคอนสำหรับเปลี่ยนภาษา */}
              </IconButton>
              {renderLanguageMenu()} {/* แสดงเมนูภาษา */}
              <MDTypography variant="h5" fontWeight="medium">
                {langCurrent}
              </MDTypography>
              <Avatar
                src={
                  profile?.employee?.photo_url
                    ? `${Constants.BASE_URL}${profile.employee.photo_url}`
                    : ""
                }
                alt="profile-image"
                sx={{ ml: 2, cursor: "pointer", width: 56, height: 56 }} // ปรับขนาดที่ต้องการ
                onClick={handleAvatarClick}
              >
                {!profile?.employee?.photo_url && <PersonIcon />} {/* แสดงไอคอนเมื่อไม่มีรูปภาพ */}
              </Avatar>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => handleMenuItemClick("/pages/profile/profile-overview")}>
                  User Profile
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick("/settings")}>Settings</MenuItem>
                <MenuItem onClick={handleChangePasswordClick}>Change Password</MenuItem>
              </Menu>
              <MDBox height="100%" ml={2} lineHeight={1} sx={{ mr: 2 }}>
                <MDTypography variant="h5" fontWeight="medium">
                  {profile?.employee?.first_name || profile?.username}{" "}
                  {profile?.employee?.last_name || ""}
                </MDTypography>
                <MDTypography variant="button" color="text" fontWeight="regular">
                  {profile?.employee?.department || profile?.role} /{" "}
                  {profile?.employee?.position || profile?.role}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>
        {children}
        <Modal
          open={isChangePasswordOpen}
          onClose={handleCloseChangePassword}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <ChangePassword onClose={handleCloseChangePassword} />
          </Box>
        </Modal>
      </Card>
    </MDBox>
  );
}

Header.defaultProps = {
  children: "",
};

Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
