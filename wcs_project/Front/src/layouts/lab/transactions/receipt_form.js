// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   FormControl,
//   MenuItem,
//   TextField,
//   Autocomplete,
// } from "@mui/material";
// import PropTypes from "prop-types";
// import MDInput from "components/MDInput";
// import MDTypography from "components/MDTypography";
// import MDButton from "components/MDButton";
// import { StyledSelect } from "common/Global.style";

// import StockItemsAPI from "api/StockItemsAPI";
// import LocationsAPI from "api/LocationsAPI";

// export default function WaitingReceiptFormDialog({
//   open,
//   mode = "create",
//   initialData = null,
//   onClose,
//   onSubmit,
// }) {
//   const isEdit = mode === "edit";

//   const [form, setForm] = useState({
//     type: "RECEIPT",
//     item_id: "",
//     mc_code: "",
//     loc_id: "",
//     loc: "",
//     box_loc: "",
//     cond: "",
//     plan_qty: "",
//     cap_qty: 0,
//     recond_qty: 0,
//     unit_cost_handled: "",
//     contract_num: "",
//     po_num: "",
//     object_id: "",
//     stock_item: "",
//     item_name: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [stockOptions, setStockOptions] = useState([]);
//   const [locOptions, setLocOptions] = useState([]);
//   const [boxOptions, setBoxOptions] = useState([]);

//   useEffect(() => {
//     if (open) {
//       setErrors({});
//       if (isEdit && initialData) {
//         setForm({ ...form, ...initialData });
//       } else {
//         setForm((prev) => ({
//           ...prev,
//           item_id: "",
//           stock_item: "",
//           item_name: "",
//           loc: "",
//           box_loc: "",
//           loc_id: "",
//         }));
//       }
//     }
//   }, [open, isEdit, initialData]);

//   const title = useMemo(
//     () => (isEdit ? "Edit Receipt Order" : "Create New Receipt Order"),
//     [isEdit]
//   );

//   // ---------------- Stock Autocomplete ----------------
//   const handleSearchStock = async (value) => {
//     if (!value || value.length < 1) return;
//     try {
//       const res = await StockItemsAPI.searchItem({
//         item_id: value,
//         stock_item: value,
//         item_name: value,
//       });
//       setStockOptions(res?.data || []);
//     } catch (err) {
//       console.error("search error:", err);
//       setStockOptions([]);
//     }
//   };

//   const handleSelectStock = (item) => {
//     if (!item) {
//       setForm((prev) => ({
//         ...prev,
//         item_id: "",
//         stock_item: "",
//         item_name: "",
//       }));
//       setStockOptions([]);
//       return;
//     }
//     setForm((prev) => ({
//       ...prev,
//       item_id: item.item_id,
//       stock_item: item.stock_item,
//       item_name: item.item_name,
//     }));
//   };

//   // ---------------- Location Autocomplete ----------------
//   const handleSearchLoc = async (value) => {
//     if (!value) return;
//     try {
//       const res = await LocationsAPI.searchLocations({ loc: value, box_loc: undefined });
//       if (res?.data && Array.isArray(res.data)) {
//         // unique loc
//         const uniqueLocs = Array.from(new Map(res.data.map((item) => [item.loc, item])).values());
//         setLocOptions(uniqueLocs);
//       } else {
//         setLocOptions([]);
//       }
//     } catch (err) {
//       console.error("search loc error", err);
//       setLocOptions([]);
//     }
//   };

//   const handleSearchBox = async (value) => {
//     try {
//       // filter by selected loc if any
//       const res = await LocationsAPI.searchLocations({
//         loc: form.loc || undefined,
//         box_loc: value || undefined,
//       });
//       setBoxOptions(res?.data || []);
//     } catch (err) {
//       console.error("search box error", err);
//       setBoxOptions([]);
//     }
//   };

//   const handleSelectLoc = async (item) => {
//     if (!item) {
//       setForm((prev) => ({ ...prev, loc_id: "", loc: "", box_loc: "" }));
//       setBoxOptions([]); // ล้าง dropdown ของ box_loc
//       setLocOptions([]); // ล้าง dropdown ของ loc
//       return;
//     }

//     setForm((prev) => ({
//       ...prev,
//       loc_id: item.loc_id,
//       loc: item.loc,
//       box_loc: "",
//     }));

//     try {
//       // ดึง box_loc ทั้งหมดที่ตรงกับ loc ที่เลือก
//       const res = await LocationsAPI.searchLocations({
//         loc: item.loc,
//         box_loc: undefined,
//       });
//       if (res?.data && Array.isArray(res.data)) {
//         setBoxOptions(res.data); // แสดงทุก box_loc ของ loc ที่เลือก
//       } else {
//         setBoxOptions([]);
//       }
//     } catch (err) {
//       console.error("fetch box_loc error", err);
//       setBoxOptions([]);
//     }
//   };

//   const handleSelectBox = (item) => {
//     if (!item) {
//       setForm((prev) => ({ ...prev, loc_id: "", loc: "", box_loc: "" }));
//       setBoxOptions([]); // ล้าง dropdown ของ box_loc
//       return;
//     }

//     setForm((prev) => ({
//       ...prev,
//       loc_id: item.loc_id,
//       loc: item.loc,
//       box_loc: item.box_loc,
//     }));
//   };

//   const handleChange = (field) => (e) => {
//     const value = e.target.value;
//     setForm((prev) => ({ ...prev, [field]: value }));
//     setErrors((prev) => ({ ...prev, [field]: "" }));
//   };

//   const validateAll = () => {
//     const next = {};
//     if (!form.mc_code?.trim()) next.mc_code = "Maintenance Contract is required.";
//     if (!form.stock_item?.trim()) next.stock_item = "Stock item is required.";
//     if (!form.plan_qty && form.plan_qty !== 0)
//       next.plan_qty = "Quantity to be handled is required.";
//     if (!form.item_id) next.item_id = "Please select a valid stock item.";
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

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
//       <DialogTitle>{title}</DialogTitle>
//       <DialogContent dividers>
//         <Grid container spacing={2} mt={0}>
//           {/* Transaction Type */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Transaction Type</MDTypography>
//             <MDInput
//               fullWidth
//               value={form.type}
//               onChange={handleChange("type")}
//               error={!!errors.type}
//               disabled
//             />
//           </Grid>

//           {/* Maintenance Contract */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Maintenance Contract</MDTypography>
//             <MDInput
//               fullWidth
//               value={form.mc_code}
//               onChange={handleChange("mc_code")}
//               error={!!errors.mc_code}
//             />
//           </Grid>

//           {/* Stock Item ID */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Stock Item ID</MDTypography>
//             <Autocomplete
//               options={stockOptions}
//               getOptionLabel={(option) => option.stock_item || ""}
//               isOptionEqualToValue={(option, value) => option?.item_id === value?.item_id}
//               onInputChange={(e, value, reason) => {
//                 if (reason === "input") handleSearchStock(value);
//               }}
//               onChange={(e, value) => handleSelectStock(value)}
//               value={
//                 form.item_id
//                   ? {
//                       item_id: form.item_id,
//                       stock_item: form.stock_item,
//                       item_name: form.item_name,
//                     }
//                   : null
//               }
//               renderInput={(params) => (
//                 <TextField {...params} error={!!errors.stock_item} helperText={errors.stock_item} />
//               )}
//             />
//           </Grid>

//           {/* Stock Item Name */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Stock Item Name</MDTypography>
//             <Autocomplete
//               options={stockOptions}
//               getOptionLabel={(option) => option.item_name || ""}
//               isOptionEqualToValue={(option, value) => option?.item_id === value?.item_id}
//               onInputChange={(e, value, reason) => {
//                 if (reason === "input") handleSearchStock(value);
//               }}
//               onChange={(e, value) => handleSelectStock(value)}
//               value={
//                 form.item_id
//                   ? {
//                       item_id: form.item_id,
//                       stock_item: form.stock_item,
//                       item_name: form.item_name,
//                     }
//                   : null
//               }
//               renderInput={(params) => (
//                 <TextField {...params} error={!!errors.item_name} helperText={errors.item_name} />
//               )}
//             />
//           </Grid>

//           {/* CAT Quantity */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">CAT Quantity</MDTypography>
//             <MDInput
//               fullWidth
//               type="number"
//               value={form.cap_qty}
//               onChange={handleChange("cap_qty")}
//               error={!!errors.cap_qty}
//               disabled
//             />
//           </Grid>

//           {/* RECOND Quantity */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">RECOND Quantity</MDTypography>
//             <MDInput
//               fullWidth
//               type="number"
//               value={form.recond_qty}
//               onChange={handleChange("recond_qty")}
//               error={!!errors.recond_qty}
//               disabled
//             />
//           </Grid>

//           {/* Condition */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Condition</MDTypography>
//             <FormControl fullWidth>
//               <StyledSelect value={form.cond} onChange={handleChange("cond")} displayEmpty>
//                 <MenuItem value="" disabled>
//                   Select condition
//                 </MenuItem>
//                 <MenuItem value="NEW">NEW</MenuItem>
//                 <MenuItem value="CAPITAL">CAPITAL</MenuItem>
//               </StyledSelect>
//             </FormControl>
//           </Grid>

//           {/* Unit Cost */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Unit Cost</MDTypography>
//             <MDInput
//               fullWidth
//               type="number"
//               step="0.01"
//               value={form.unit_cost_handled}
//               onChange={handleChange("unit_cost_handled")}
//               error={!!errors.unit_cost_handled}
//             />
//           </Grid>

//           {/* Contract Number */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Contract Number</MDTypography>
//             <MDInput
//               fullWidth
//               value={form.contract_num}
//               onChange={handleChange("contract_num")}
//               error={!!errors.contract_num}
//             />
//           </Grid>

//           {/* PO Number */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">PO Number</MDTypography>
//             <MDInput
//               fullWidth
//               value={form.po_num}
//               onChange={handleChange("po_num")}
//               error={!!errors.po_num}
//             />
//           </Grid>

//           {/* Object ID */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Object ID</MDTypography>
//             <MDInput
//               fullWidth
//               value={form.object_id}
//               onChange={handleChange("object_id")}
//               error={!!errors.object_id}
//             />
//           </Grid>

//           {/* Quantity */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Quantity</MDTypography>
//             <MDInput
//               fullWidth
//               type="number"
//               step="1" //รับได้ทศนิยม 2 ตำแหน่ง
//               min="1"       // จำกัดให้เป็นจำนวนบวก
//               value={form.plan_qty}
//               onChange={(e) => {
//                 // กรองไม่ให้กรอกทศนิยมหรือลบ
//                 let val = e.target.value;
//                 if (val === "") {
//                   setForm((prev) => ({ ...prev, plan_qty: "" }));
//                   return;
//                 }
//                 val = Math.max(1, Math.floor(Number(val)));
//                 setForm((prev) => ({ ...prev, plan_qty: val }));
//               }}
//               error={!!errors.plan_qty}
//             />
//           </Grid>

//           {/* Location */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Source Location</MDTypography>
//             <Autocomplete
//               options={locOptions}
//               getOptionLabel={(option) => option.loc || ""}
//               onInputChange={(e, value, reason) => reason === "input" && handleSearchLoc(value)}
//               onChange={(e, value) => handleSelectLoc(value)}
//               value={
//                 form.loc_id ? { loc_id: form.loc_id, loc: form.loc, box_loc: form.box_loc } : null
//               }
//               renderInput={(params) => <TextField {...params} fullWidth />}
//             />
//           </Grid>

//           {/* Box Location */}
//           <Grid item xs={12} sm={6}>
//             <MDTypography variant="body01">Box Location</MDTypography>
//             <Autocomplete
//               options={boxOptions}
//               getOptionLabel={(option) => option.box_loc || ""}
//               onInputChange={(e, value, reason) => reason === "input" && handleSearchBox(value)}
//               onChange={(e, value) => handleSelectBox(value)}
//               value={
//                 form.box_loc ? { loc_id: form.loc_id, loc: form.loc, box_loc: form.box_loc } : null
//               }
//               renderInput={(params) => <TextField {...params} fullWidth />}
//             />
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

// WaitingReceiptFormDialog.propTypes = {
//   open: PropTypes.bool.isRequired,
//   mode: PropTypes.oneOf(["create", "edit"]),
//   initialData: PropTypes.object,
//   onClose: PropTypes.func,
//   onSubmit: PropTypes.func,
// };
