import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import PropTypes from "prop-types";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { StyledSelect, StyledMenuItem } from "common/Global.style";

export default function WaitingReceiptFormDialog({
  open,
  mode = "create",
  initialData = null,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    type: "RECEIPT",
    stock_item: "",
    item_desc: "",
    cat_qty: 0,
    recond_qty: 0,
    cond: "",
    unit_cost_handled: "",
    contract_num: "",
    po_num: "",
    object_id: "",
    plan_qty: "",
    from_location: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors({});
      if (isEdit && initialData) {
        setForm({
          type: initialData.type ?? "RECEIPT",
          stock_item: initialData.stock_item ?? "",
          item_desc: initialData.item_desc ?? "",
          cat_qty: 0,
          recond_qty: 0,
          cond: initialData.cond ?? "",
          unit_cost_handled: initialData.unit_cost_handled ?? "",
          contract_num: initialData.contract_num ?? "",
          po_num: initialData.po_num ?? "",
          object_id: initialData.object_id ?? "",
          plan_qty: initialData.plan_qty ?? "",
          from_location: initialData.from_location ?? "",
        });
      } else {
        setForm({
          type: "RECEIPT",
          stock_item: "",
          item_desc: "",
          cat_qty: 0,
          recond_qty: 0,
          cond: "",
          unit_cost_handled: "",
          contract_num: "",
          po_num: "",
          object_id: "",
          plan_qty: "",
          from_location: "",
        });
      }
    }
  }, [open, isEdit, initialData]);

  const title = useMemo(() => (isEdit ? "Edit Receipt Order" : "Create New Receipt Order"), [isEdit]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateAll = () => {
    const next = {};
    if (!form.stock_item?.trim()) next.stock_item = "Stock item is required.";
    if (!form.plan_qty && form.plan_qty !== 0) next.plan_qty = "Quantity to be handled is required.";
    if (!form.from_location?.trim()) next.from_location = "From location is required.";
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

  const fields = [
    { field: "type", label: "Transaction Type", readOnly: true },
    { field: "stock_item", label: "Stock Item ID" },
    { field: "item_desc", label: "Stock Item Description" },
    { field: "cat_qty", label: "CAT Quantity",readOnly: true },
    { field: "recond_qty", label: "RECOND Quantity", readOnly: true },
    { field: "cond", label: "Condition", select: true, options: ["NEW", "CAPITAL"] },
    { field: "unit_cost_handled", label: "Unit Cost" },
    { field: "contract_num", label: "Contract Number" },
    { field: "po_num", label: "PO Number"},
    { field: "object_id", label: "Object ID"},
    { field: "plan_qty", label: "Quantity to be handled" },
    { field: "from_location", label: "From Location" },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={0}>
          {fields.map(({ field, label, readOnly, select, options }) => (
            <Grid item xs={12} sm={6} key={field}>
              <MDTypography variant="body01" mb={0.5} display="block">
                {label}
              </MDTypography>

              {select ? (
                <FormControl fullWidth error={!!errors[field]}>
                  <StyledSelect
                    value={form[field] ?? ""}
                    onChange={handleChange(field)}
                    displayEmpty
                    sx={{
                      height: "45px",
                      backgroundColor: readOnly ? "#f0f0f0" : "white", // ช่องทึบถ้าแก้ไม่ได้
                      color: readOnly ? "#666" : "inherit",
                      pointerEvents: readOnly ? "none" : "auto", // กันคลิก dropdown
                    }}
                  >
                    <StyledMenuItem value="" disabled>
                      Select {label.toLowerCase()}
                    </StyledMenuItem>
                    {options.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                  {errors[field] && <FormHelperText>{errors[field]}</FormHelperText>}
                </FormControl>
              ) : (
                <MDInput
                  fullWidth
                type={["plan_qty", "split"].includes(field) ? "number" : "text"} // บังคับ type number
                  value={form[field]}
                  onChange={handleChange(field)}
                  error={!!errors[field]}
                  inputProps={{ readOnly }}
                  sx={{
                    backgroundColor: readOnly ? "#f0f0f0" : "white", // พื้นเทาเมื่อ readOnly
                    color: readOnly ? "#666" : "inherit",
                  }}
                />
              )}

              {errors[field] && (
                <MDTypography variant="caption" color="error">
                  {errors[field]}
                </MDTypography>
              )}
            </Grid>
          ))}
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

WaitingReceiptFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]),
  initialData: PropTypes.object,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};