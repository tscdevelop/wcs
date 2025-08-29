import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Grid, MenuItem ,FormControl} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
/** โลโก้เล็ก */
function CubeLogo({ size = 28, color = "#2b2b6a", strokeWidth = 2.6, ...props }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} {...props}>
      <path
        d="M12 20v24l20 10 20-10V20L32 10 12 20z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M32 10v40" fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      <path d="M12 20l20 10 20-10" fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * CreateTaskDialog
 * props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onSave: async (payload) => Promise<void>   // payload = { sku, qty, priority }
 */
export default function CreateTaskDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState({ sku: "", qty: "", priority: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ sku: "", qty: "", priority: "" });
      setSaving(false);
    }
  }, [open]);

  const valid =
    form.sku.trim().length > 0 &&
    Number(form.qty) > 0 &&
    Number(form.priority) >= 1 &&
    Number(form.priority) <= 9;

  const handleSave = async () => {
    if (!valid || saving) return;
    const payload = {
      sku: form.sku.trim(),
      qty: Number(form.qty),
      priority: Number(form.priority),
    };
    try {
      setSaving(true);
      await onSave?.(payload);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "14px",
          boxShadow: "0 18px 40px rgba(0,0,0,.25)",
          overflow: "visible",
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* Header */}
        <MDBox display="flex" alignItems="center" gap={1} mb={2}>
          <CubeLogo />
          <MDTypography variant="h4" fontWeight="bold">
            Create New Task
          </MDTypography>
        </MDBox>

        {/* Form */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MDTypography variant="button" color="text" sx={{ opacity: 0.7 }}>
              SKU ID
            </MDTypography>
            <MDInput
              fullWidth
              placeholder="SKU ID"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              sx={inputSx}
            />
          </Grid>

          {/* Priority */}
<Grid item xs={12} md={6}>
  <MDTypography variant="button" color="text" sx={{ opacity: 0.7 }}>
    Priority
  </MDTypography>

  <FormControl fullWidth>
    <StyledSelect
      sx={{ height: "45px" }}
      displayEmpty
      value={form.priority}
      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
      name="priority"
    >
      <StyledMenuItem value="" disabled>
        Select Priority (1-9)
      </StyledMenuItem>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <MenuItem key={n} value={n}>
          {n}
        </MenuItem>
      ))}
    </StyledSelect>
  </FormControl>
</Grid>


          <Grid item xs={12} md={6}>
            <MDTypography variant="button" color="text" sx={{ opacity: 0.7 }}>
              QTY
            </MDTypography>
            <MDInput
              fullWidth
              placeholder="QTY"
              type="number"
              inputProps={{ min: 1 }}
              value={form.qty}
              onChange={(e) =>
                setForm((f) => ({ ...f, qty: e.target.value.replace(/[^\d]/g, "") }))
              }
              sx={inputSx}
            />
          </Grid>

          {/* Actions */}
          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={1}>
            <MDButton
              variant="outlined"
              color="error"
              onClick={onClose}
              disabled={saving}
              sx={{ minWidth: 140, height: 44, borderRadius: "12px" }}
            >
              Cancel
            </MDButton>
            <MDButton
              variant="contained"
              color="success"
              onClick={handleSave}
              disabled={!valid || saving}
              sx={{ minWidth: 140, height: 44, borderRadius: "12px" }}
            >
              {saving ? "Saving..." : "Save"}
            </MDButton>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
