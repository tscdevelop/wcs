    import React from "react";
    import PropTypes from "prop-types";
    import UploadFileAPI from "api/UploadFileAPI";
    import MDButton from "components/MDButton";

    const DownloadFileButton = ({ directory, subfolder, fileName, label }) => {
    const handleDownloadFile = async () => {
        if (!fileName) {
        console.error("File name is required for downloading.");
        return;
        }

        try {
        // เรียก API เพื่อดาวน์โหลดไฟล์
        const blob = await UploadFileAPI.downloadFile(directory, subfolder, fileName);

        if (!blob || blob.size === 0) {
            console.warn("Downloaded Blob is empty or invalid.");
            return;
        }

        // สร้าง URL จาก Blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName || "downloaded-file.pdf");

        // คลิกเพื่อดาวน์โหลด
        document.body.appendChild(link);
        link.click();

        // ลบลิงก์และยกเลิก URL
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log("File download initiated successfully.");
        } catch (error) {
        console.error("Error downloading file:", error);
        }
    };

    // return <MDButton variant="contained" color="primary" onClick={handleDownloadFile}>{label || "Download File"}</MDButton>;
    return (
        <MDButton
            variant="contained"
            color="primary"
            onClick={handleDownloadFile}
            sx={{
                width: "auto", // ความกว้างปรับตามเนื้อหา
                minWidth: 0, // ลบค่าความกว้างขั้นต่ำ (ถ้าถูกตั้งไว้ใน default)
                padding: "8px 16px", // ระยะห่างภายใน
                textTransform: "none", // ปิดการแปลงข้อความเป็นตัวพิมพ์ใหญ่
            }}
            >
            {label || "Download File"}
            </MDButton>
        );
    };

    DownloadFileButton.propTypes = {
    directory: PropTypes.string.isRequired,
    subfolder: PropTypes.string.isRequired,
    fileName: PropTypes.string.isRequired,
    label: PropTypes.string,
    };

    DownloadFileButton.defaultProps = {
    label: "Download File",
    };

    export default DownloadFileButton;
