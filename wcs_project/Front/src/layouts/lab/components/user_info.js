import React from "react";
import Avatar from "@mui/material/Avatar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import userImg from "../../../assets/images/avatar.jpg"; // Import รูปภาพเริ่มต้น

const UserInfo = ({ Username, RoleCode, profileUser }) => {
  return (
    <MDBox
      display="flex"
      alignItems="center"
      flexDirection="column"
      py={2}
      sx={{
        backgroundColor: "#FEE4A0", // พื้นหลังส่วนข้อมูลผู้ใช้งาน
      }}
    >
      {/* Avatar */}
      <Avatar
        alt={Username || "Default User"}
        src={profileUser || userImg}
        sx={{ width: 60, height: 60 }}
      />

      {/* ชื่อ-นามสกุล และตำแหน่งงาน */}
      <MDBox mt={1} textAlign="center">
        <MDTypography
          variant="button"
          fontWeight="medium"
          sx={{ display: "block" }}
        >
          {Username || "ไม่ระบุชื่อ"}
        </MDTypography>
        <MDTypography
          variant="caption"
          color="inherit"
          sx={{ display: "block" }}
        >
          {RoleCode || "ไม่ระบุตำแหน่ง"}
        </MDTypography>
      </MDBox>
    </MDBox>
  );
};

export default UserInfo;
