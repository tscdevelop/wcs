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

import { useState, useEffect } from "react";

// react-router components
// import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import ChangePassword from "../../../layouts/lab/user/setting-password";
import Modal from "@mui/material/Modal"; // เพิ่มการนำเข้า Modal
import Box from "@mui/material/Box"; // เพิ่มการนำเข้า Box สำหรับจัดการการวางตำแหน่ง
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

// icon
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import KeyIcon from "@mui/icons-material/Key";


// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";


// Material Dashboard 2 PRO React examples

// import NotificationItem from "examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  // navbarIconButton,

} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 PRO React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  // setOpenConfigurator,
} from "context";


// Custom import
import UserAPI from "api/UserAPI";
import { GlobalVar } from "common/GlobalVar";
import { setLanguage } from "common/language.context";
//import ChangePassword from "Lab/user/setting-password";

//lang
import * as lang from "utils/langHelper";

// images
import thaiflag from "assets/images/thai_flag.jpg";
import ukflag from "assets/images/uk_flag.jpg";
// import userImg from "assets/images/user.jpg";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { transparentNavbar, fixedNavbar, darkMode, miniSidenav } = controller;
  const userRole = GlobalVar.getRole(); // ✅ ดึง Role ของผู้ใช้
  // const [openMenu, setOpenMenu] = useState(false);
  // const location = useLocation();
  // const route = location?.pathname ? location.pathname.split("/").slice(1) : [];
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false); // State for the modal

  // ประกาศ useState
  const [userID, setUserID] = useState(null);
  const [langCurrent, setLanguageCurrent] = useState(GlobalVar.getLanguage);
  // const [profile, setProfile] = useState(null);

  // const [Username ,setUsername]= useState("");
  // const [RoleCode ,setRoleCoed]= useState("");

  // const [hospitalName, setHospitalName] = useState({ th: "", en: "" });
  // const [hospitalAddress, setHospitalAddress] = useState("");

  const [anchorEl, setAnchorEl] = useState(null); // สำหรับเปิด/ปิดเมนู
  const open = Boolean(anchorEl);

  // Profile data
  // const profilePicture = userImg; // ใช้ path รูปโปรไฟล์ที่แท้จริง
  // const fullName = "สพญ.กาณิศา สุขประเสริญ"; // ข้อมูลชื่อ
  // const position = "สัตวแพทย์"; // ข้อมูลตำแหน่งงาน

  // useEffect(() => {
  //   const fetchHospitalInfo = async () => {
  //     try {
  //       // ดึงข้อมูลชื่อโรงพยาบาล (ทั้งภาษาไทยและอังกฤษ)
  //       const name = await GlobalVar.getHospitalName();
  //       setHospitalName({
  //         th: name?.hospital_name_th || "Default Hospital Name (TH)",
  //         en: name?.hospital_name_en || "Default Hospital Name (EN)",
  //       });

  //       // ดึงข้อมูลที่อยู่โรงพยาบาล


  //     } catch (error) {
  //       console.error("Error fetching hospital information:", error);
  //     }
  //   };

  //   fetchHospitalInfo();
  // }, []);

  // ฟังก์ชันเปิด/ปิดเมนู
  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();
  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    // นำทางไปที่หน้า Logout
    navigate("/logout");
  };

  const hiddenRoles = ["MANAGEMENT", "MANAGER", "OFFICER_PC", "OFFICER_TL","ADMIN","OWNER"];
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
      <MenuItem onClick={() => handleLanguageChange("th")}>
        <Box
          component="img"
          src={thaiflag}
          alt="ไทย"
          sx={{
            width: 25,
            height: 25,
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: "8px", // เพิ่มช่องว่างระหว่างรูปภาพและข้อความ
          }}
        />  ไทย</MenuItem>
      <MenuItem onClick={() => handleLanguageChange("en")}>
        <Box
          component="img"
          src={ukflag}
          alt="English"
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: "8px", // เพิ่มช่องว่างระหว่างรูปภาพและข้อความ
          }}
        /> English</MenuItem>
    </Menu>
  );

  // Function to open the change password modal
  const handleChangePasswordClick = () => {
    setChangePasswordOpen(true);
    handleClose(); // Close the user menu if it's open
  };

  // Function to close the change password modal
  const handleCloseChangePassword = () => {
    setChangePasswordOpen(false);
  };

  const emp = lang.msg("employee.employee");
  const changepass = lang.msg("item.user_change_password");
  const logOut = lang.msg("menu.logout");
  // ฟังก์ชัน renderMenu สำหรับแสดง context menu
  const renderContextMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={handleClose}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        {emp}
      </MenuItem>
      <MenuItem onClick={handleChangePasswordClick}>
        <ListItemIcon>
          <KeyIcon fontSize="small" />
        </ListItemIcon>
        {changepass}
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        {logOut}
      </MenuItem>
    </Menu>
  );


  const renderChangePasswordModal = () => (
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
          borderRadius: "10px",
          boxShadow: 24,
          p: 4,
        }}
      >
        <ChangePassword onClose={handleCloseChangePassword} />
      </Box>
    </Modal>
  );


  // useEffect(() => {
  //   const fetchUsername = async () => {
  //     try{
  //       const storedUserID = GlobalVar.getUserId();
  //       const token = GlobalVar.getToken();
  //     }catch(error){

  //     }
  //   }
  // })


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
          const response = await UserAPI.getUserDataById(storedUserID);
          if (response.isCompleted && !response.isError) {
            console.log("Profile Data:", response.data);

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
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  // const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  // const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  // const handleCloseMenu = () => setOpenMenu(false);

  // Render the notifications menu
  // const renderMenuNotification = () => (
  //   <Menu
  //     anchorEl={openMenu}
  //     anchorReference={null}
  //     anchorOrigin={{
  //       vertical: "bottom",
  //       horizontal: "left",
  //     }}
  //     open={Boolean(openMenu)}
  //     onClose={handleCloseMenu}
  //     sx={{ mt: 2 }}
  //   >
  //     <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
  //     <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
  //     <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
  //   </Menu>
  // );

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      {renderContextMenu()}
      {renderChangePasswordModal()}

      <Toolbar sx={(theme) => navbarContainer(theme)}>
        {/* สลับ Hamburger Menu ไปอยู่ทางซ้าย */}
        <IconButton
          onClick={handleMiniSidenav}
          size="medium"
          sx={{
            marginRight: 2,
            color: light ? "white" : "inherit",
          }}
        >
          <Icon fontSize="medium" sx={iconsStyle}>

            {miniSidenav ? "menu_open" : "menu"}
          </Icon>
        </IconButton>
        

        {/* <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
    <IconButton 
     sx={{ ...navbarIconButton, marginRight: 2 }}
    onClick={handleMiniSidenav} 
    size="small"
     disableRipple
    
    >
      <Icon fontSize="medium" sx={iconsStyle}>
        {miniSidenav ? "menu_open" : "menu"}
      </Icon>
    </IconButton>
    <Breadcrumbs 
  separator="" // ลบตัวแบ่งออก
  sx={{
    display: "flex",
    alignItems: "center", // จัดให้ไอคอนบ้านและข้อความอยู่กึ่งกลาง
    paddingTop: "3px", // ปรับตำแหน่งไอคอนบ้านลง
  }}
  title={
    <MDBox>
      <Typography variant="h5" component="div" style={{ fontWeight: "bold" }}>
        {hospitalName.th} {hospitalName.en}
      </Typography>
      <Typography variant="subtitle2" component="div" style={{ color: "gray" }}>
        {hospitalAddress || "Default Hospital Address"}
      </Typography>
    </MDBox>
  }
/>

  </MDBox> */}
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })} display="flex" justifyContent="flex-end">
            <MDBox display="flex" alignItems="center" justifyContent="flex-end" color={light ? "white" : "inherit"}>
              {/* ปุ่มแสดงการแจ้งเตือน */}
              {/* <IconButton
          size="small"
          disableRipple
          color="inherit"
          sx={navbarIconButton}
          aria-controls="notification-menu"
          aria-haspopup="true"
          variant="contained"
          onClick={handleOpenMenu}
        >
          <MDBadge badgeContent={10} color="error" size="xs" circular>
            <Icon sx={iconsStyle}>notifications</Icon>
          </MDBadge>
        </IconButton>
        {renderMenuNotification()} */}
{/* <IconButton onClick={handleConfiguratorOpen} size="medium" sx={{ marginRight: 2, color: light ? "white" : "inherit" }}>
          <Icon fontSize="medium" sx={iconsStyle}>
            settings
          </Icon>
        </IconButton> */}
              {/* ปุ่มเมนูภาษา */}
              {!hiddenRoles.includes(userRole) && (
                <>
                  <IconButton
                    size="small"
                    color="inherit"
                    aria-controls="language-menu"
                    aria-haspopup="true"
                    onClick={handleOpenLanguageMenu}
                  >
                    <Box
                      component="img"
                      src={langCurrent === "th" ? thaiflag : ukflag}
                      alt={langCurrent === "th" ? "ไทย" : "EN"}
                      sx={{ width: 25, height: 25, borderRadius: "50%", objectFit: "cover", marginRight: "5px" }}
                    />
                    {langCurrent === "th" ? "ไทย" : "EN"}
                  </IconButton>
                  {renderLanguageMenu()}
                </>
              )}

              {/* ปุ่มแสดงโปรไฟล์ */}
              {/* <IconButton onClick={handleClick} sx={navbarIconButton} size="small" disableRipple>
          <Avatar alt={Username} src={userImg} />
        </IconButton> */}

              {/* ชื่อ-นามสกุล และ ตำแหน่งงาน */}
              {/* <MDBox ml={1} onClick={handleClick} sx={{ cursor: "pointer" }}>
          <MDTypography variant="button" fontWeight="medium" sx={{ display: "block" }}>
            {Username}
          </MDTypography>
          <MDTypography variant="caption" color="textSecondary" sx={{ display: "block" }}>
            {RoleCode}
          </MDTypography>
        </MDBox> */}

              {/* เรียกใช้ฟังก์ชัน renderMenu */}
              {/* {renderContextMenu()} */}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>

    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;

