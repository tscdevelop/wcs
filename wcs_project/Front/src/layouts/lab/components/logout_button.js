import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import { useNavigate } from "react-router-dom";
import * as lang from "utils/langHelper";
const LogoutButton = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/logout");
  };

  return (
    <MDBox
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="80px"
      onClick={handleLogout}
      sx={{
        backgroundColor: "#FEE4A0",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#FBB040",
        },
      }}
    >
      <Icon sx={{ fontSize: "24px", color: "#000", marginRight: "8px" }}>power_settings_new</Icon>
      <MDTypography variant="button" color="dark" fontWeight="bold">
      {lang.msg("menu.logout")}
      </MDTypography>
    </MDBox>
  );
};

LogoutButton.propTypes = {
  onLogout: PropTypes.func,
  label: PropTypes.string,
};

LogoutButton.defaultProps = {
  onLogout: null,
};

export default LogoutButton;
