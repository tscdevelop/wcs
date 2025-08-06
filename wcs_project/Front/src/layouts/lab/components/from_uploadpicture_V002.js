// import React, { useState, useRef, useEffect } from "react";
// import PropTypes from "prop-types";
// import { Box, Grid, Button } from "@mui/material";
// import styled from "@emotion/styled";
// import uploadpicImage from "./test-pic/uploadpic.png";

// const CustomInput = styled("input")({
//   display: "none",
// });

// const UploadPic = ({ name, onImageChange, apiImage, resetImage }) => {
//   const [formState, setFormState] = useState({
//     labImage: null,
//     description: "",
//   });
//   const fileInputRef = useRef(null);

//   const handleFileUpload = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setFormState({ ...formState, labImage: file });
//       onImageChange(name, file); // ส่งไฟล์กลับไปยังคอมโพเนนต์หลัก (parent component)
//     }
//   };

//   useEffect(() => {
//     if (resetImage) {
//       setFormState({ labImage: null, description: "" });
//     }
//   }, [resetImage]);

//   return (
//     <Grid item xs={12} container justifyContent="center">
//       {formState.labImage ? (
//         <Box sx={{ position: "relative" }}>
//           <img
//             src={URL.createObjectURL(formState.labImage)} //ฟังก์ชันสร้าง url ชั่วคราว
//             alt="Uploaded Picture"
//             style={{ width: "200px", height: "200px", objectFit: "contain" }}
//           />
//           <Button
//             variant="contained"
//             component="label"
//             sx={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               opacity: 0,
//               backgroundColor: "transparent",
//               color: "black",
//             }}
//           >
//             <CustomInput type="file" onChange={handleFileChange} />
//           </Button>
//         </Box>
//       ) : (
//         <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
//           <div style={{ textAlign: "center", marginTop: "20px" }}>
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               style={{ display: "none" }}
//             />
//             <div
//               onClick={handleFileUpload}
//               style={{
//                 backgroundImage: apiImage ? `url(${apiImage})` : `url(${uploadpicImage})`,
//                 backgroundSize: "contain",
//                 backgroundPosition: "center",
//                 backgroundRepeat: "no-repeat",
//                 width: "200px",
//                 height: "200px",
//                 cursor: "pointer",
//               }}
//             ></div>
//           </div>
//         </Box>
//       )}
//     </Grid>
//   );
// };

// UploadPic.propTypes = {
//   name: PropTypes.string.isRequired,
//   onImageChange: PropTypes.func.isRequired,
//   apiImage: PropTypes.string,
//   resetImage: PropTypes.bool,
// };

// export default UploadPic;

// เพิ่มปุ่มกดเพื่่อเลือกรูป
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Grid, Dialog, DialogContent } from "@mui/material";
//import styled from "@emotion/styled";
import MDButton from "components/MDButton";
import uploadpicImage from "./test-pic/uploadpic.png";

//const CustomInput = styled("input")({
//  display: "none",
//});

const UploadPic = ({ name, onImageChange, apiImage, resetImage, label }) => {
  const [formState, setFormState] = useState({
    labImage: null,
    description: "",
  });
  const [openPreview, setOpenPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormState({ ...formState, labImage: file });
      onImageChange(name, file);  // ส่งไฟล์กลับไปยัง Parent Component
    }
  };
  

  const handleOpenPreview = () => {
    if (formState.labImage || apiImage) {
      setOpenPreview(true); // เปิด Dialog เมื่อมีรูปจากเซิร์ฟเวอร์หรือรูปที่อัปโหลด
    }
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  useEffect(() => {
    if (resetImage) {
      setFormState({ labImage: null, description: "" });
    }
  }, [resetImage]);

  return (
    <Grid item xs={12} container justifyContent="center">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // จัดเรียงแนวตั้ง
          alignItems: "center", // จัดให้อยู่ตรงกลางแนวนอน
          marginBottom: "20px",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {formState.labImage || apiImage ? (
          <Box
            onClick={handleOpenPreview}
            sx={{
              cursor: "pointer",
              textAlign: "center",
              marginBottom: "10px",
              display: "inline-block",
            }}
          >
            <img
              src={
                formState.labImage
                  ? URL.createObjectURL(formState.labImage) // รูปภาพที่เลือกใหม่
                  : apiImage // รูปภาพที่มาจาก props หรือค่าเริ่มต้น
              }
              alt="Uploaded Preview"
              style={{
                width: "200px",
                height: "200px",
                objectFit: "contain",
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              backgroundImage: `url(${uploadpicImage})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "200px",
              height: "200px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
            onClick={handleFileUpload}
          ></Box>
        )}

        {/* ปุ่มเลือกไฟล์ */}
        <MDButton
          variant="contained"
          onClick={handleFileUpload}
          color="primary" // ใช้ธีม primary สำหรับสีพื้นหลัง
          sx={{
            color: "#fff", // สีตัวอักษรเป็นสีขาว
            marginTop: "10px", // ระยะห่างระหว่างปุ่มกับรูป
          }}
        >
          {label}
        </MDButton>
      </Box>

      <Dialog open={openPreview} onClose={handleClosePreview}>
        <DialogContent>
          <Box
            sx={{
              width: "100%",
              height: "auto",
              maxWidth: "600px", // ขนาดสูงสุดของรูปภาพ
              maxHeight: "80vh", // ป้องกันรูปภาพสูงเกินหน้าจอ
              objectFit: "contain",
              margin: "auto",
            }}
          >
            {formState.labImage || apiImage ? (
              <img
                src={
                  formState.labImage
                    ? URL.createObjectURL(formState.labImage) // รูปภาพที่เลือกใหม่
                    : apiImage // รูปภาพจาก props
                }
                alt="Uploaded Preview"
                style={{ width: "100%", height: "auto" }}
              />
            ) : (
              <Box>No Image Selected</Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

UploadPic.propTypes = {
  name: PropTypes.string.isRequired,
  onImageChange: PropTypes.func.isRequired,
  apiImage: PropTypes.string,
  resetImage: PropTypes.bool,
  label: PropTypes.string.isRequired, // เพิ่ม prop label
};

export default UploadPic;

