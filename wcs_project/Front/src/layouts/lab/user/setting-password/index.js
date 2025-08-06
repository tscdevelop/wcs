import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import MDTypography from "components/MDTypography";
import UserApi from "api/UserAPI";

const ChangePassword = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
  
    const payload = {
      oldPassword: formData.currentPassword,
      newPassword: formData.newPassword
    };
    
    try {
      const response = await UserApi.changePassword(payload);
  
      if (response.isCompleted && !response.isError) {
        console.log("Password changed successfully");
        toast.success("Password changed successfully");
        setTimeout(() => {
          onClose();  // Close the change password popup after a slight delay
        }, 3000); // Delay in milliseconds
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
     
    }
  };

  return (
    <div style={{borderRadius: "15%"}}>
      <div className="popup-header">
        <h4>Change Password</h4>
        <span className="close" onClick={onClose}><strong>&times;</strong></span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <MDTypography variant="h6">
            <label className="label-group" htmlFor="currentPassword">Current Password</label>
          </MDTypography>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group" >
          <MDTypography variant="h6">
            <label className="label-group" htmlFor="newPassword">New Password</label>
          </MDTypography>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <MDTypography variant="h6">
            <label className="label-group" htmlFor="confirmPassword">Confirm New Password</label>
          </MDTypography>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <Button type="submit" variant="contained" color="primary" style={{ fontFamily: "Arial, sans-serif", color: "white" }}>
            Change Password
          </Button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

ChangePassword.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ChangePassword;