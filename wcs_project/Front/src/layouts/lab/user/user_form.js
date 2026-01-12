import React, { useEffect, useMemo, useState } from "react";
import { StyledSelect } from "common/Global.style";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  MenuItem,
  IconButton,
  InputAdornment,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from "prop-types";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DropDownAPI from "api/DropDownAPI";

export default function UserFormDialog({
  open,
  mode = "create", // "create" | "edit"
  initialData = null,
  onClose,
  onSubmit, // async (payload) => boolean
}) {
  const [form, setForm] = useState({
    user_first_name: "",
    user_last_name: "",
    username: "",
    password: "",
    user_email: "",
    role_code: "",
    mc_code: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [dropdownRole, setDropDownRole] = useState([]);
  const [loadingRole, setLoadingRole] = useState(false);

  const fetchDropdownRole = async () => {
    try {
      setLoadingRole(true);
      const response = await DropDownAPI.getRoleDropdown();
      if (response.isCompleted) {
        setDropDownRole(response.data || []);
      }
    } finally {
      setLoadingRole(false);
    }
  };

  useEffect(() => {
    fetchDropdownRole(); // ดึงข้อมูล Role เมื่อโหลดหน้า
  }, []);

  const [dropdownMcCode, setDropDownMcCode] = useState([]);
  const [loadingMcCode, setLoadingMcCode] = useState(false);

  const fetchDropdownMcCode = async () => {
    try {
      setLoadingMcCode(true);
      const response = await DropDownAPI.getMcCodeDropdown();
      if (response.isCompleted) {
        setDropDownMcCode(response.data || []);
      }
    } finally {
      setLoadingMcCode(false);
    }
  };

  useEffect(() => {
    fetchDropdownMcCode(); // ดึงข้อมูล maintenance code เมื่อโหลดหน้า
  }, []);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (open) {
      setErrors({});
      if (isEdit && initialData) {
        setForm({
          user_first_name: initialData.user_first_name ?? "",
          user_last_name: initialData.user_last_name ?? "",
          username: initialData.username ?? "",
          password: "", // edit: ไม่บังคับ เปลี่ยนได้ถ้ากรอก
          user_email: initialData.user_email ?? "",
          role_code: initialData.role_code ?? "",
          mc_code: initialData.mc_code ?? "",
        });
      } else {
        setForm({
          user_first_name: "",
          user_last_name: "",
          username: "",
          password: "",
          user_email: "",
          role_code: "",
          mc_code: ""
        });
      }
    }
  }, [open, isEdit, initialData]);

  const title = useMemo(() => (isEdit ? "Edit User" : "Create User"), [isEdit]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // clear error when typing
  };

  // validate ทุกฟิลด์ (ข้อความ error จะขึ้นเป็นสีแดงอัตโนมัติ)
  const validateAll = () => {
    const next = {};
    if (!form.user_first_name?.trim()) next.user_first_name = "First name is required.";
    if (!form.user_last_name?.trim()) next.user_last_name = "Last name is required.";
    if (!form.username?.trim()) next.username = "Username is required.";
    if (!form.user_email?.trim()) next.user_email = "Email is required.";
    if (!form.role_code) next.role_code = "Role is required.";
    //if (!form.mc_code) next.mc_code = "Maintenance Contract is required.";

    // password:
    // - create: บังคับ
    // - edit: ไม่บังคับ (ถ้าไม่กรอกจะไม่เปลี่ยนรหัส)
    if (!isEdit) {
      if (!form.password?.trim()) next.password = "Password is required.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;

    try {
      setSubmitting(true);
      const payload = {
        user_first_name: form.user_first_name.trim(),
        user_last_name: form.user_last_name.trim(),
        username: form.username.trim(),
        user_email: form.user_email.trim(),
        role_code: form.role_code,
        mc_code: form.mc_code,
        ...(isEdit
          ? form.password
            ? { password: form.password }
            : {}
          : { password: form.password }),
      };
      const ok = await onSubmit?.(payload);
      if (ok) onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelectPlaceholder = (selected, items, placeholder) => {
    if (!selected || !items.length) {
      return <span style={{ color: "#999" }}>{placeholder}</span>;
    }
    return items.find(i => i.value === selected)?.text || "";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={0}>
          {/* First name */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01" mb={0.5} display="block">
              First name
            </MDTypography>
            <MDInput
              fullWidth
              placeholder="Enter first name"
              value={form.user_first_name}
              onChange={handleChange("user_first_name")}
              error={!!errors.user_first_name}
            />
            {errors.user_first_name && (
              <MDTypography variant="caption" color="error">
                {errors.user_first_name}
              </MDTypography>
            )}
          </Grid>

          {/* Last name */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01" mb={0.5} display="block">
              Last name
            </MDTypography>
            <MDInput
              fullWidth
              placeholder="Enter last name"
              value={form.user_last_name}
              onChange={handleChange("user_last_name")}
              error={!!errors.user_last_name}
            />
            {errors.user_last_name && (
              <MDTypography variant="caption" color="error">
                {errors.user_last_name}
              </MDTypography>
            )}
          </Grid>

          {/* Username */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01" mb={0.5} display="block">
              Username
            </MDTypography>
            <MDInput
              fullWidth
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange("username")}
              InputProps={{ readOnly: isEdit }}
              disabled={isEdit}
              error={!!errors.username}
            />
            {errors.username && (
              <MDTypography variant="caption" color="error">
                {errors.username}
              </MDTypography>
            )}
          </Grid>

          {/* Password */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01" mb={0.5} display="block">
              Password
            </MDTypography>
            <MDInput
              fullWidth
              placeholder={isEdit ? "Enter new password" : "Enter password"}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* user_email */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01" mb={0.5} display="block">
              Email
            </MDTypography>
            <MDInput
              fullWidth
              placeholder="Enter Email"
              value={form.user_email}
              onChange={handleChange("user_email")}
              error={!!errors.user_email}
            />
            {errors.user_email && (
              <MDTypography variant="caption" color="error">
                {errors.user_email}
              </MDTypography>
            )}
          </Grid>

          {/* Role */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01" mb={0.5} display="block">
              Role
            </MDTypography>
            <FormControl fullWidth error={!!errors.role_code}>
              <StyledSelect
                disabled={loadingRole}
                value={form.role_code ?? ""}
                onChange={handleChange("role_code")}
                displayEmpty
                renderValue={(selected) =>
                renderSelectPlaceholder(selected, dropdownRole, "Select role")
              }
                sx={{ width: "400px", maxWidth: "100%", height: "45px" }}
              >
                {/* placeholder (ยังจำเป็นไว้กัน value = "") */}
                <MenuItem value="" disabled>
                  Select role
                </MenuItem>

                {dropdownRole.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.text}
                  </MenuItem>
                ))}
              </StyledSelect>
              {errors.role_code && <FormHelperText>{errors.role_code}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Maintenance Code */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01" mb={0.5} display="block">
              Maintenance Contract
            </MDTypography>
            <FormControl fullWidth error={!!errors.mc_code}>
              <StyledSelect
                disabled={loadingMcCode}
                value={form.mc_code ?? ""}
                onChange={handleChange("mc_code")}
                displayEmpty
                renderValue={(selected) =>
                renderSelectPlaceholder(selected, dropdownMcCode, "Select maintenance contract")
              }
                sx={{ width: "400px", maxWidth: "100%", height: "45px" }}
              >
                {/* placeholder (ยังจำเป็นไว้กัน value = "") */}
                <MenuItem value="" disabled>
                  Select maintenance contract
                </MenuItem>

                {dropdownMcCode.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.text}
                  </MenuItem>
                ))}
              </StyledSelect>
              {errors.mc_code && <FormHelperText>{errors.mc_code}</FormHelperText>}
            </FormControl>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions>
        <MDButton
          variant="outlined"
          onClick={onClose}
          disabled={submitting}
          sx={{
            borderColor: "#000",
            color: "#000",
            "&:hover": { borderColor: "#000", backgroundColor: "transparent" },
          }}
        >
          Cancel
        </MDButton>

        <MDButton onClick={handleSubmit} color="dark" disabled={submitting}>
          {submitting ? <CircularProgress size={18} /> : isEdit ? "Update" : "Save"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

UserFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]),
  initialData: PropTypes.object,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};
