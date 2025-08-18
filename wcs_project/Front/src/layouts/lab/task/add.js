import React, { useRef, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import {
  Card,
  Grid,
  MenuItem,
  FormControl,
  IconButton,
  Paper,
} from "@mui/material";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { StyledMenuItem, StyledSelect } from "common/Global.style";
import { Priority } from "common/dataMain";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const CreateTaskForm = () => {
  const [formData, setFormData] = useState({
    sku: "",
    priority: "",
    remark: "",
  });

  // เก็บรายการ SKU ที่สแกน/เพิ่มเข้ามา
  const [skuList, setSkuList] = useState([]);

  const skuInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "counter" ? parseInt(value || "0", 10) || "" : value,
    }));
  };

  // โฟกัสอินพุตเมื่อเอาเมาส์ไปชี้ (รองรับ handheld scanner)
  const focusSkuInput = () => {
    skuInputRef.current?.focus();
  };

  // เพิ่ม SKU เข้า list (ตัดช่องว่างหัวท้าย, ข้ามค่าว่าง)
  const addSku = () => {
    const v = (formData.sku || "").trim();
    if (!v) return;
    setSkuList((prev) => [...prev, v]);
    setFormData((prev) => ({ ...prev, sku: "" }));
    // โฟกัสต่อเนื่องเผื่อสแกนหลายครั้ง
    skuInputRef.current?.focus();
  };

  // ลบ SKU เฉพาะรายการ
  const removeSkuAt = (index) => {
    setSkuList((prev) => prev.filter((_, i) => i !== index));
  };

  // กด Enter ที่ช่อง SKU เพื่อเพิ่ม
  const handleSkuKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSku();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <MDBox mt={2}>
          <MDTypography variant="h3" color="inherit">
            Create Task
          </MDTypography>
        </MDBox>
      </MDBox>

      <MDBox mt={5}>
        <Card>
          <MDBox mt={3} p={3}>
            <Grid container spacing={3} alignContent="center">
              {/* ฝั่งซ้าย */}
              <Grid item xs={12} md={6} lg={6}>
                <Grid container spacing={3}>
                  {/* SKU */}
                  <Grid item xs={12} sm={6} lg={6}>
                    <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                      <MDTypography variant="h6" color="inherit">
                        SKU
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6}>
                    {/* แถวอินพุต + ปุ่ม +  */}
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <MDInput
                        name="sku"
                        placeholder="Scan or enter SKU"
                        variant="outlined"
                        value={formData.sku || ""}
                        onChange={handleChange}
                        onKeyDown={handleSkuKeyDown}
                        inputRef={skuInputRef}
                        fullWidth
                        onMouseEnter={focusSkuInput} // โฟกัสเมื่อชี้
                      />
                      <IconButton
                        aria-label="add-sku"
                        onClick={addSku}
                        sx={{ border: "1px solid #e0e0e0" }}
                      >
                        <AddIcon />
                      </IconButton>
                    </MDBox>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6}>
                  </Grid>
                  <Grid  item xs={12} sm={6} lg={6}>
                    {/* กล่องแสดงรายชื่อ SKU (แสดงเมื่อมีข้อมูล) */}
                    {skuList.length > 0 && (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 1.5,
                          p: 1,
                          border: "1px solid #e0e0e0",
                          borderRadius: 1.5,
                          maxHeight: 4 * 44, // สูงประมาณ 4 แถว
                          overflowY: "auto",
                        }}
                      >
                        {/* เรียงเป็นคอลัมน์ (แถวเล็กๆ) */}
                        <MDBox display="flex" flexDirection="column" gap={0.75}>
                          {skuList.map((code, idx) => (
                            <MDBox
                              key={`${code}-${idx}`}
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                                px: 1,
                                py: 0.75,
                                minHeight: 40,
                              }}
                            >
                              <MDTypography variant="button" sx={{ wordBreak: "break-all" }}>
                                {code}
                              </MDTypography>
                              <IconButton
                                size="small"
                                aria-label="remove-sku"
                                onClick={() => removeSkuAt(idx)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </MDBox>
                          ))}
                        </MDBox>
                      </Paper>
                    )}
                  </Grid>



                 
                </Grid>
              </Grid>

              {/* ฝั่งขวา */}
              <Grid item xs={12} md={6} lg={6}>
                <Grid container spacing={3}>
                  {/* Priority */}
                  <Grid item xs={12} sm={6} lg={6}>
                    <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                      <MDTypography variant="h6" color="inherit">
                        Priority
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6}>
                    <FormControl fullWidth>
                      <StyledSelect
                        sx={{ width: "400px", maxWidth: "100%", height: "45px" }}
                        value={formData.priority}
                        onChange={handleChange}
                        displayEmpty
                        name="priority"
                      >
                        <StyledMenuItem value="" disabled>
                          Select a Priority
                        </StyledMenuItem>
                        {Priority.map((p) => (
                          <MenuItem key={p.value} value={p.value}>
                            {p.text}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                  {/* Counter */}
                  <Grid item xs={12} sm={6} lg={6}>
                    <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                      <MDTypography variant="h6" color="inherit">
                        Remark
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6}>
                    <MDInput
                      name="Remark"
                      multiline rows={3}
                      variant="outlined"
                      value={formData.remark || ""}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* ปุ่มบันทึก */}
              <Grid item xs={12}>
                <MDBox display="flex" justifyContent="flex-end">
                  <MDButton color="dark">Save</MDButton>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
};

export default CreateTaskForm;
