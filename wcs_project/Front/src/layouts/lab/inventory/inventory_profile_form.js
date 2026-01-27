import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid } from "@mui/material";
import PropTypes from "prop-types";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import UploadPic from "../components/from_uploadpicture_V002";
import BaseClass from "common/baseClass";

export default function ItemsFormDialog({
    open,
    mode = "create",
    initialData = null,
    onClose,
    onSubmit,
}) {
    const isEdit = mode === "edit";

    const [form, setForm] = useState({
        stock_item: "",
        item_desc: "",
        item_img: "",
        item_img_url: "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
        setErrors({});
        if (isEdit && initialData) {
            setForm({
            stock_item: initialData.stock_item ?? "",
            item_desc: initialData.item_desc ?? "",
            item_img: initialData.item_img ?? "",
            item_img_url: initialData.item_img_url ?? "",
            });
        } else {
            setForm({
            stock_item: "",
            item_desc: "",
            item_img: "",
            item_img_url: "",
            });
        }
        }
    }, [open, isEdit, initialData]);

    const title = useMemo(
        () => (isEdit ? "Edit Stock Item Data" : "Create New Stock Item Data"),
        [isEdit]
    );

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleImageChange = (name, file) => {
        setForm((prevState) => ({
        ...prevState,
        [name]: file,
        }));
    };

    const validateAll = () => {
        const next = {};
        if (!form.stock_item?.trim()) next.stock_item = "Stock item is required.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateAll()) return;

        try {
        setSubmitting(true);

        const formData = new FormData();
        formData.append("stock_item", form.stock_item);
        formData.append("item_desc", form.item_desc);

        // ถ้ามีรูป → append
        if (form.item_img instanceof File) {
            formData.append("item_img", form.item_img);
        }

        const ok = await onSubmit?.(formData);
        if (ok) onClose?.();
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <Dialog 
        open={open} 
        onClose={onClose} 
        PaperProps={{
            sx: {
            borderRadius: 5, // 👈 ปรับความโค้งตรงนี้
            },
        }}
        fullWidth maxWidth="md">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>
            <Grid container spacing={2}>
            {/* Left side: stock_item, item_desc */}
            <Grid item xs={12} lg={6}>
                <Grid container spacing={2}>
                {["stock_item", "item_desc"].map((field) => (
                    <Grid item xs={12} key={field}>
                    <MDTypography variant="body01" mb={0.5} display="block">
                        {field === "stock_item"
                        ? "Stock Item Number"
                        : "Stock Item Description"}
                    </MDTypography>
                    <MDInput
                        fullWidth
                        value={form[field]}
                        onChange={handleChange(field)}
                        error={!!errors[field]}
                        multiline={field === "item_desc"}
                        rows={field === "item_desc" ? 4 : 1}
                        placeholder={
                            field === "stock_item"
                            ? "Enter Stock Item Number"
                            : "Enter stock item Description"
                        }
                        sx={{
                            backgroundColor: "#fff",
                        }}
                    />

                    {errors[field] && (
                        <MDTypography variant="caption" color="error">
                        {errors[field]}
                        </MDTypography>
                    )}
                    </Grid>
                ))}
                </Grid>
            </Grid>

            {/* Right side: UploadPic */}
            <Grid item xs={12} lg={6} container justifyContent="center" alignItems="center">
                <UploadPic
                name="item_img"
                onImageChange={handleImageChange}
                apiImage={
                    form.item_img instanceof File
                    ? URL.createObjectURL(form.item_img)
                    : form.item_img_url
                    ? BaseClass.buildFileUrl(form.item_img_url)
                    : null
                }
                resetImage={false}
                disabled={false} // ปรับตาม status ถ้ามี
                label="click to upload photo"
                />
            </Grid>
            </Grid>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "right", gap: 2}}>
            <MDButton variant="contained"
                color="secondary"
                sx={{ color: "#fff" }} 
                onClick={onClose} 
                disabled={submitting}>
                Cancel
            </MDButton>
            <MDButton 
                onClick={handleSubmit} 
                variant="contained"
                color="success"
                sx={{ color: "#fff" }} 
                disabled={submitting}>
                {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </MDButton>
        </DialogActions>
        </Dialog>
    );
}

ItemsFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    mode: PropTypes.oneOf(["create", "edit"]),
    initialData: PropTypes.object,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
};
