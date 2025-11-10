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
    work_order: "",
    usage_num: "",
    line: "",
    stock_item: "",
    item_desc: "",
    usage_type: "ISSUE",
    cond: "",
    split: "0",
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
          type: "USAGE",
          work_order: initialData.work_order ?? "",
          usage_num: initialData.usage_num ?? "",
          line: initialData.line ?? "",
          stock_item: initialData.stock_item ?? "",
          item_desc: initialData.item_desc ?? "",
          usage_type: "ISSUE",
          cond: initialData.cond ?? "",
          split: "0",
          plan_qty: initialData.plan_qty ?? "",
          from_location: initialData.from_location ?? "",
        });
      } else {
        setForm({
          type: "USAGE",
          work_order: "",
          usage_num: "",
          line: "",
          stock_item: "",
          item_desc: "",
          usage_type: "ISSUE",
          cond: "",
          split: "0",
          plan_qty: "",
          from_location: "",
        });
      }
    }
  }, [open, isEdit, initialData]);

  const title = useMemo(() => (isEdit ? "Edit Usage Order" : "Create New Usage Order"), [isEdit]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateAll = () => {
    const next = {};
    if (!form.work_order?.trim()) next.work_order = "Work order is required.";
    if (!form.stock_item?.trim()) next.stock_item = "Stock item is required.";
    if (!form.usage_num?.trim()) next.usage_num = "Usage is required.";
    if (!form.line?.trim()) next.line = "Line is required.";
    // if (!form.cond?.trim()) next.cond = "Condition is required.";
    if (form.plan_qty === null || form.plan_qty === undefined || form.plan_qty === "") {
         next.plan_qty = "Quantity to be handled is required.";}
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
    { field: "work_order", label: "Work Order" },
    { field: "usage_num", label: "Usage" },
    { field: "line", label: "Line" },
    { field: "stock_item", label: "Stock Item ID" },
    { field: "item_desc", label: "Stock Item Description" },
    { field: "usage_type", label: "Usage Type", readOnly: true },
    { field: "cond", label: "Condition", select: true, options: ["NEW", "CAPITAL"] },
    { field: "split", label: "Split", readOnly: true },
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

WaitingFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]),
  initialData: PropTypes.object,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   FormControl,
//   MenuItem,
//   FormHelperText,
// } from "@mui/material";
// import PropTypes from "prop-types";
// import MDInput from "components/MDInput";
// import MDTypography from "components/MDTypography";
// import MDButton from "components/MDButton";
// import { StyledSelect } from "common/Global.style";

// export default function WaitingFormDialog({
//   open,
//   mode = "create",
//   initialData = null,
//   onClose,
//   onSubmit,
// }) {
//   const isEdit = mode === "edit";

//   const [form, setForm] = useState({
//     type: "USAGE",
//     work_order: "",
//     usage_num: "",
//     line: "",
//     stock_item: "",
//     item_desc: "",
//     usage_type: "ISSUE",
//     cond: "",
//     split: "",
//     plan_qty: "",
//     from_location: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (open) {
//       setErrors({});
//       if (isEdit && initialData) {
//         setForm({
//           type: "USAGE",
//           work_order: initialData.work_order ?? "",
//           usage_num: initialData.usage_num ?? "",
//           line: initialData.line ?? "",
//           stock_item: initialData.stock_item ?? "",
//           item_desc: initialData.item_desc ?? "",
//           usage_type: "ISSUE",
//           cond: initialData.cond ?? "",
//           split: initialData.split ?? "",
//           plan_qty: initialData.plan_qty ?? "",
//           from_location: initialData.from_location ?? "",
//         });
//       } else {
//         setForm({
//           type: "USAGE",
//           work_order: "",
//           usage_num: "",
//           line: "",
//           stock_item: "",
//           item_desc: "",
//           usage_type: "ISSUE",
//           cond: "",
//           split: "",
//           plan_qty: "",
//           from_location: "",
//         });
//       }
//     }
//   }, [open, isEdit, initialData]);

//   const handleChange = (field) => (e) => {
//     const value = e.target.value;
//     setForm((prev) => ({ ...prev, [field]: value }));
//     setErrors((prev) => ({ ...prev, [field]: "" }));
//   };

//   const validateAll = () => {
//     const next = {};
//     if (!form.work_order?.trim()) next.work_order = "Work order is required.";
//     if (!form.stock_item?.trim()) next.stock_item = "Stock item is required.";
//     if (!form.cond?.trim()) next.cond = "Condition is required.";
//     setErrors(next);
//     return Object.keys(next).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateAll()) return;
//     try {
//       setSubmitting(true);
//       const payload = { ...form };
//       const ok = await onSubmit?.(payload);
//       if (ok) onClose?.();
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const condOptions = [
//     { value: "NEW", label: "NEW" },
//     { value: "CAPITAL", label: "CAPITAL" },
//   ];

//   const title = useMemo(() => (isEdit ? "Edit Usage Order" : "Create New Usage Order"), [isEdit]);

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
//       <DialogTitle>{title}</DialogTitle>
//       <DialogContent dividers>
//         <Grid container spacing={2} mt={0}>
//           {/* Transaction Type */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Transaction Type
//             </MDTypography>
//             <MDInput fullWidth value="USAGE" inputProps={{ readOnly: true }} />
//           </Grid>

//           {/* Work Order */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Work Order
//             </MDTypography>
//             <MDInput
//               fullWidth
//               value={form.work_order}
//               onChange={handleChange("work_order")}
//               error={!!errors.work_order}
//             />
//             {errors.work_order && (
//               <MDTypography variant="caption" color="error">
//                 {errors.work_order}
//               </MDTypography>
//             )}
//           </Grid>

//           {/* Usage Number */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Usage
//             </MDTypography>
//             <MDInput
//               fullWidth
//               value={form.usage_num}
//               onChange={handleChange("usage_num")}
//             />
//           </Grid>

//           {/* Line */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Line
//             </MDTypography>
//             <MDInput fullWidth value={form.line} onChange={handleChange("line")} />
//           </Grid>

//           {/* Stock Item */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Stock Item ID
//             </MDTypography>
//             <MDInput
//               fullWidth
//               value={form.stock_item}
//               onChange={handleChange("stock_item")}
//               error={!!errors.stock_item}
//             />
//             {errors.stock_item && (
//               <MDTypography variant="caption" color="error">
//                 {errors.stock_item}
//               </MDTypography>
//             )}
//           </Grid>

//           {/* Description */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Stock Item Description
//             </MDTypography>
//             <MDInput fullWidth value={form.item_desc} onChange={handleChange("item_desc")} />
//           </Grid>

//           {/* Usage Type */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Usage Type
//             </MDTypography>
//             <MDInput fullWidth value="ISSUE" inputProps={{ readOnly: true }} />
//           </Grid>

//           {/* Condition Dropdown */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Condition
//             </MDTypography>
//             <FormControl fullWidth error={!!errors.cond}>
//               <StyledSelect
//                 sx={{ width: "400px", maxWidth: "100%", height: "45px" }}
//                 value={form.cond ?? ""}
//                 onChange={handleChange("cond")}
//                 displayEmpty
//               >
//                 <MenuItem value="" disabled>
//                   Select Condition
//                 </MenuItem>
//                 {condOptions.map((opt) => (
//                   <MenuItem key={opt.value} value={opt.value}>
//                     {opt.label}
//                   </MenuItem>
//                 ))}
//               </StyledSelect>
//               {errors.cond && <FormHelperText>{errors.cond}</FormHelperText>}
//             </FormControl>
//           </Grid>

//           {/* Split */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Split
//             </MDTypography>
//             <MDInput fullWidth value={form.split} onChange={handleChange("split")} />
//           </Grid>

//           {/* Quantity */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               Quantity to be handled
//             </MDTypography>
//             <MDInput fullWidth value={form.plan_qty} onChange={handleChange("plan_qty")} />
//           </Grid>

//           {/* From Location */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01" mb={0.5}>
//               From Location
//             </MDTypography>
//             <MDInput fullWidth value={form.from_location} onChange={handleChange("from_location")} />
//           </Grid>
//         </Grid>
//       </DialogContent>

//       <DialogActions>
//         <MDButton variant="outlined" onClick={onClose} disabled={submitting}>
//           Cancel
//         </MDButton>
//         <MDButton onClick={handleSubmit} color="dark" disabled={submitting}>
//           {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
//         </MDButton>
//       </DialogActions>
//     </Dialog>
//   );
// }

// WaitingFormDialog.propTypes = {
//   open: PropTypes.bool.isRequired,
//   mode: PropTypes.oneOf(["create", "edit"]),
//   initialData: PropTypes.object,
//   onClose: PropTypes.func,
//   onSubmit: PropTypes.func,
// };
