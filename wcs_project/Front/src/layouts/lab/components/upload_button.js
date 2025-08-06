import React, { useState, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const UploadButton = ({ name, fileData, apiImage, onFileChange, index, label = "อัปโหลดรูป" }) => {
  const [preview, setPreview] = useState(apiImage || null);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    if (fileData instanceof File) {
      // มีไฟล์อัปโหลดใหม่
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const objectUrl = URL.createObjectURL(fileData);
      blobUrlRef.current = objectUrl;
      setPreview(objectUrl);
    } else {
      // ไม่มีไฟล์อัปโหลดใหม่ → ใช้รูปจาก apiImage
      setPreview(apiImage || null);
    }

    // Cleanup Blob URL เมื่อ component unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [fileData, apiImage]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileChange(index, "outbtl_img", file);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
      <input
        type="file"
        id={`upload-${name}-${index}`}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*"
      />
      <label htmlFor={`upload-${name}-${index}`} style={{ cursor: "pointer" }}>
        {preview ? (
          <img
            src={preview}
            alt="preview"
            width={120}
            height={120}
            style={{ borderRadius: 8, objectFit: "cover", border: "1px solid #ddd" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "";
            }}
          />
        ) : (
          <Button
            variant="contained"
            component="span"
            color="inherit"
            sx={{
              backgroundColor: "#28a745 !important",
              color: "white !important",
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.5,
              borderRadius: "25px",
              "&:hover": { backgroundColor: "#218838 !important" },
            }}
          >
            <CloudUploadIcon sx={{ color: "white !important", fill: "currentColor" }} />
            {label}
          </Button>
        )}
      </label>
    </Box>
  );
};

export default UploadButton;
