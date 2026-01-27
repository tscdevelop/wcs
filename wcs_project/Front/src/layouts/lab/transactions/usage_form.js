import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  MenuItem,
  TextField,
  Autocomplete,
} from "@mui/material";
import PropTypes from "prop-types";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { StyledSelect } from "common/Global.style";

import StockItemsAPI from "api/StockItemsAPI";

export default function WaitingFormDialog({
  open,
  mode = "create",
  initialData = null,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    type: "USAGE",
    item_id: "",
    mc_code: "",
    loc_id: "",
    loc: "",
    box_loc: "",
    cond: "",
    plan_qty: "",

    work_order: "",
    usage_num: "",
    line: "",
    usage_type: "ISSUE",
    split: "0",   

    stock_item: "",
    item_name: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [stockOptions, setStockOptions] = useState([]);

  // Load form when open/edit
  useEffect(() => {
    if (open) {
      setErrors({});
      if (isEdit && initialData) {
        setForm({
          ...form,
          ...initialData,
        });
      } else {
        setForm((prev) => ({
          ...prev,
          item_id: "",
          stock_item: "",
          item_name: "",
          loc: "",
          box_loc: "",
          loc_id: "",
        }));
      }
    }
  }, [open, isEdit, initialData]);

  const title = useMemo(
    () => (isEdit ? "Edit Usage Order" : "Create New Usage Order"),
    [isEdit]
  );

  // 🔍 Autocomplete search
  const handleSearchStock = async (value) => {
    if (!value || value.length < 1) return;

    try {
      const res = await StockItemsAPI.searchItemInventory({
        stock_item: value,
        item_name: value,
      });

      if (res?.isCompleted && Array.isArray(res.data)) {
        setStockOptions(res.data); // <-- ใช้ res.data
      } else {
        setStockOptions([]);
      }
    } catch (err) {
      console.error("search error:", err);
      setStockOptions([]);
    }
  };


    // Select item from list
  const handleSelectStock = (item) => {

    // ➤ กดกากบาท (clear)
    if (!item) {
      setForm((prev) => ({
        ...prev,
        item_id: "",
        stock_item: "",
        item_name: "",
        loc: "",
        box_loc: "",
        loc_id: "",
      }));

      // ล้าง dropdown ให้ไม่ค้างข้อมูลเก่า
      setStockOptions([]);
      return;
    }

    // ➤ กดเลือก item ปกติ
    setForm((prev) => ({
      ...prev,
      item_id: item.item_id,
      stock_item: item.stock_item,
      item_name: item.item_name,
      loc: item.loc,
      box_loc: item.box_loc,
      loc_id: item.loc_id,
    }));
  };


  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateAll = () => {
    const next = {};
    if (!form.mc_code?.trim()) next.mc_code = "Maintenance Contract is required.";
    if (!form.work_order?.trim()) next.work_order = "Work order is required.";
    if (!form.stock_item?.trim()) next.stock_item = "Stock item is required.";
    if (!form.item_id) next.item_id = "Please select a valid stock item.";
    if (!form.usage_num?.trim()) next.usage_num = "Usage is required.";
    if (!form.line?.trim()) next.line = "Line is required.";
    if (!form.plan_qty) next.plan_qty = "Quantity is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;

    try {
      setSubmitting(true);
      const payload = { ...form };
      const ok = await onSubmit?.(payload);
      if (ok) onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={0}>

          {/* Transaction Type */}
          <Grid item xs={12} sm={12}>
            <MDTypography variant="body01">Transaction Type</MDTypography>
            <MDInput
              fullWidth
              value={form.type}
              onChange={handleChange("type")}
              error={!!errors.type}
              disabled
            />
          </Grid>

          {/* Maintenance Contract */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Maintenance Contract</MDTypography>
            <MDInput
              fullWidth
              value={form.mc_code}
              onChange={handleChange("mc_code")}
              error={!!errors.mc_code}
            />
          </Grid>

          {/* Work Order */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Work Order</MDTypography>
            <MDInput
              fullWidth
              value={form.work_order}
              onChange={handleChange("work_order")}
              error={!!errors.work_order}
            />
          </Grid>
          
          {/* Stock Item ID */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Stock Item ID</MDTypography>
            <Autocomplete
              options={stockOptions}
              getOptionLabel={(option) => option.stock_item || ""}
              isOptionEqualToValue={(option, value) =>
                option?.item_id === value?.item_id
              }
              onInputChange={(e, value, reason) => {
                if (reason === "input") handleSearchStock(value);
              }}
              onChange={(e, value) => handleSelectStock(value)}
              value={
                form.item_id
                  ? {
                      item_id: form.item_id,
                      stock_item: form.stock_item,
                      item_name: form.item_name,
                    }
                  : null
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!errors.stock_item}
                  helperText={errors.stock_item}
                />
              )}
            />
          </Grid>

          {/* Stock Item Name */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Stock Item Name</MDTypography>
            <Autocomplete
              options={stockOptions}
              getOptionLabel={(option) => option.item_name || ""}
              isOptionEqualToValue={(option, value) =>
                option?.item_id === value?.item_id
              }
              onInputChange={(e, value, reason) => {
                if (reason === "input") handleSearchStock(value);
              }}
              onChange={(e, value) => handleSelectStock(value)}
              value={
                form.item_id
                  ? {
                      item_id: form.item_id,
                      stock_item: form.stock_item,
                      item_name: form.item_name,
                    }
                  : null
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!errors.item_name}
                  helperText={errors.item_name}
                />
              )}
            />
          </Grid>

          {/* Usage */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Usage</MDTypography>
            <MDInput
              fullWidth
              value={form.usage_num}
              onChange={handleChange("usage_num")}
              error={!!errors.usage_num}
            />
          </Grid>

          {/* Line */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Line</MDTypography>
            <MDInput
              fullWidth
              value={form.line}
              onChange={handleChange("line")}
              error={!!errors.line}
            />
          </Grid>

          {/* Usage Type */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Usage Type</MDTypography>
            <MDInput
              fullWidth
              type="string"
              value={form.usage_type}
              onChange={handleChange("usage_type")}
              error={!!errors.usage_type}
              disabled
            />
          </Grid>

          {/* Split */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Split</MDTypography>
            <MDInput
              fullWidth
              type="number"
              value={form.split}
              onChange={handleChange("split")}
              error={!!errors.split}
              disabled
            />
          </Grid>

          {/* Condition */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Condition</MDTypography>
            <FormControl fullWidth>
              <StyledSelect
                value={form.cond}
                onChange={handleChange("cond")}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select condition
                </MenuItem>
                <MenuItem value="NEW">NEW</MenuItem>
                <MenuItem value="CAPITAL">CAPITAL</MenuItem>
              </StyledSelect>
            </FormControl>
          </Grid>
          
          {/* Quantity */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Quantity</MDTypography>
            <MDInput
              fullWidth
              type="number"
              step="1" //รับได้แค่จำนวนเต็ม
              min="1"       // จำกัดให้เป็นจำนวนบวก
              value={form.plan_qty}
              onChange={(e) => {
                // กรองไม่ให้กรอกทศนิยมหรือลบ
                let val = e.target.value;
                if (val === "") {
                  setForm((prev) => ({ ...prev, plan_qty: "" }));
                  return;
                }
                val = Math.max(1, Math.floor(Number(val)));
                setForm((prev) => ({ ...prev, plan_qty: val }));
              }}
              error={!!errors.plan_qty}
            />
          </Grid>

          {/* Location */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Source Location</MDTypography>
            <MDInput fullWidth value={form.loc} readOnly disabled/>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MDTypography variant="body01">Box Location</MDTypography>
            <MDInput fullWidth value={form.box_loc} readOnly disabled/>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions>
        <MDButton variant="outlined" onClick={onClose} disabled={submitting}>
          Cancel
        </MDButton>
        <MDButton onClick={handleSubmit} color="dark" disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

WaitingFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]),
  initialData: PropTypes.object,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};


