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

export default function StockItemsFormDialog({
        open,
        mode = "create",
        initialData = null,
        onClose,
        onSubmit,
    }) {
    const isEdit = mode === "edit";

    const [form, setForm] = useState({
        stock_item: "",
        item_name: "",
        item_desc: "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
        setErrors({});
        if (isEdit && initialData) {
            setForm({
            stock_item: initialData.stock_item ?? "",
            item_name: initialData.item_name ?? "",
            item_desc: initialData.item_desc ?? "",
            });
        } else {
            setForm({
            stock_item: "",
            item_name: "",
            item_desc: "",
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
        if (!form.item_name?.trim()) next.item_name = "Stock item name is required.";
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
        { field: "stock_item", label: "Stock Item ID", },
        { field: "item_name", label: "Stock Item Name" },
        { field: "item_desc", label: "Stock Item Describtion" },
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
                    //type={["plan_qty", "split"].includes(field) ? "number" : "text"} // บังคับ type number
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

StockItemsFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    mode: PropTypes.oneOf(["create", "edit"]),
    initialData: PropTypes.object,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
};