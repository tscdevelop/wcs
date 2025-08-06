import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Grid,
    IconButton,
    Typography,
    Button,
    Snackbar
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import styled from '@emotion/styled';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MDButton from 'components/MDButton';
import SweetAlert from 'react-bootstrap-sweetalert';
import UploadFileAPI from 'api/UploadFileAPI';

const CustomButtonWrapper = styled(Box)({
    backgroundColor: 'white',
    border: '1px dashed #ccc',
    width: '100%',
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '1rem',
    borderRadius: '8px'
});

const MultiFileUpload = ({ 
    name, 
    onFileChange, 
    setting_json, 
    value, 
    labinsp_number,      // เลขส่งตรวจ
    directory_upload,     // โฟลเดอร์จัดเก็บไฟล์
    file_name
}) => {
    const [formState, setFormState] = useState({
        labFiles: [] 
    });
    const [labFiles, setLabFiles] = useState([]);
    const [fileType, setFileType] = useState("PDF, PNG, JPEG, JPG");
    const [alertMessage, setAlertMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const fileInputRef = useRef(null);

    // useEffect(() => {
    //     // ตรวจสอบว่า value มีข้อมูลและเป็น array
    //     if (value && Array.isArray(value)) {
    //         // กรองไฟล์ที่มีขนาดไม่เกิน setting_json.max_file_size
    //         const filteredFiles = value.filter(file => {
    //             const fileSizeInBytes = parseFloat(file.file_size) * 1024 * 1024;
    //             return fileSizeInBytes <= setting_json.max_file_size;
    //         });
    //         setFormState({ labFiles: filteredFiles });
    //     }
    // }, [value, setting_json.max_file_size]);

    useEffect(() => {
        const fetchGetfile = async () => {
            try {
                const response = await UploadFileAPI.getUploadfile(directory_upload, labinsp_number);
                console.log("API Response:", response);
    
                if (response && response.data.files) {
                    // ตรวจสอบว่า response เป็น array หรือไม่
                    const files = Array.isArray(response.data.files) ? response.data.files : [response.data.files];
                    const filteredFiles = files.filter(file => file.fileSize <= setting_json.max_file_size)
                        .map(file => ({
                            ...file,
                            fileSize: (file.fileSize / (1024 * 1024)).toFixed(2) + " MB" // แปลง bytes เป็น MB
                        }));
    
                    // อัปเดต state พร้อมไฟล์ที่ถูกแปลงขนาดเป็น MB แล้ว
                    setFormState({ labFiles: filteredFiles });
                    console.log("Filtered files set in state:", filteredFiles);
                } else {
                    console.warn("API response is empty or invalid");
                    setFormState({ labFiles: [] });
                }
            } catch (error) {
                console.error("Error fetching file data:", error);
                setFormState({ labFiles: [] });
            }
        };
        fetchGetfile();
    }, [labinsp_number, directory_upload, setting_json.max_file_size]);
    
    
    
    

    const handleFileUpload = () => {
        fileInputRef.current.click();
    };


    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        const existingFileNames = formState.labFiles.map(file => file.file_name);
        const validFiles = [];
    
        for (let file of files) {
            if (existingFileNames.includes(file.name)) {
                setAlertMessage("ไฟล์ซ้ำ - ไม่สามารถอัปโหลดไฟล์ชื่อซ้ำกันได้!");
                setOpenSnackbar(true);
                continue;
            }
            if (file.size > setting_json.max_file_size) {
                setAlertMessage(`ไฟล์เกินขนาด - ขนาดไฟล์ต้องไม่เกิน ${setting_json.max_file_size / (1024 * 1024)}MB!`);
                setOpenSnackbar(true);
                continue;
            }
            if (!setting_json.allow_file_type.includes(file.type)) {
                setAlertMessage(`ประเภทไฟล์ไม่รองรับ - รองรับเฉพาะไฟล์: ${setting_json.allow_file_type.join(', ')}`);
                setOpenSnackbar(true);
                continue;
            }
            validFiles.push(file);
        }
    
        if (validFiles.length > 0) {
            // เตรียมข้อมูลไฟล์สำหรับการอัปโหลด
            const formData = new FormData();
            validFiles.forEach((file) => formData.append('file_name', file));
    
            try {
                const response = await UploadFileAPI.uploadFile(directory_upload, labinsp_number, formData);
                console.log("API Response:", response);
                if (response.isCompleted) {
                    setAlertMessage("อัปโหลดไฟล์สำเร็จ");
                    setFormState(prev => ({
                        ...prev,
                        labFiles: [
                            ...prev.labFiles,
                            ...validFiles.map(file => ({
                                file_id: Math.random(),
                                file_name: file.name,
                                filesize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                                filetype: file.type.split('/').pop().toUpperCase(),
                                downloadUrl: URL.createObjectURL(file),
                            }))
                        ]
                    }));
                } else {
                    setAlertMessage("การอัปโหลดล้มเหลว: " + response.message);
                }
                setOpenSnackbar(true);
            } catch (error) {
                console.error("Error uploading file:", error.message);
                setAlertMessage("เกิดข้อผิดพลาดระหว่างอัปโหลดไฟล์");
                setOpenSnackbar(true);
            }
        }
    };
    
    
    


    
    const handleDownloadFile = async (file) => {
        try {
            const blob = await UploadFileAPI.downloadFile('DIR_UPLOAD_FILE', 'LN123', file.file_name);
    
            if (!blob) {
                console.warn("Downloaded Blob is empty or invalid.");
                return;
            }
    
            // สร้าง URL จาก Blob และสร้างลิงก์ดาวน์โหลด
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.file_name || 'downloaded-file.pdf');
    
            // เพิ่มลิงก์ลงใน DOM และคลิกเพื่อเริ่มดาวน์โหลด
            document.body.appendChild(link);
            link.click();
    
            // ลบลิงก์ออกจาก DOM และยกเลิก URL ของ Blob
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
    
            console.log("File download initiated successfully.");
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };
    
    
    
    
    
    // const handleDownloadFile = async (file) => {
    //     try {
    //         const response = await UploadFileAPI.downloadFile(directory_upload, labinsp_number, file.file_name);
            
    //         if (response.file) {
    //             // Directly open the file URL in a new tab
    //             window.open(response.file.file_url, '_blank');
                
    //             console.log(`Opened file for download: ${file.file_name}`);
    //         } else {
    //             console.warn("Failed to download file or missing file URL in response.");
    //         }
    //     } catch (error) {
    //         console.error("Error downloading file:", error);
    //     }
    // };
    
    

    // const handleDownloadFile = async (file) => {
    //     try {
    //         await UploadFileAPI.downloadFile();
    //         console.log("ดาวน์โหลดไฟล์สำเร็จ.");
    //     } catch (error) {
    //         console.error("เกิดข้อผิดพลาดขณะดาวน์โหลดไฟล์:", error);
    //     }
    // };
    
    
    
//     const handleDeleteFile = async (file) => {
//     try {
//         const isDeleted = await UploadFileAPI.deleteUploadfile(directory_upload, labinsp_number, file.file_name);
        
//         if (isDeleted) {
//             // อัปเดต state เพื่อเอาไฟล์ที่ลบออกจากรายการ
//             const updatedFiles = formState.labFiles.filter(f => f.file_id !== file.file_id);
//             setFormState({ ...formState, labFiles: updatedFiles });
//             onFileChange(name, updatedFiles);
//             console.log("File deleted and state updated successfully");
//         }
//     } catch (error) {
//         console.error("Error deleting file:", error);
//     }
// };

    
const handleDeleteFile = async (file) => {
    console.log("File to delete:", file); // ตรวจสอบค่า file ก่อนเรียก API
    
    if (!file.file_name) {
        console.warn("Filename is undefined, cannot proceed with deletion.");
        return;
    }

    try {
        const isDeleted = await UploadFileAPI.deleteUploadfile(directory_upload, labinsp_number, file.file_name); // ใช้ file.fileName แทน file.file_name
        
        if (isDeleted) {
            const updatedFiles = formState.labFiles.filter(f => f.file_id !== file.file_id);
            setFormState({ ...formState, labFiles: updatedFiles });
            onFileChange(name, updatedFiles);
            console.log("File deleted and state updated successfully");
        } else {
            console.warn("Failed to delete file.");
        }
    } catch (error) {
        console.error("Error deleting file:", error);
    }
};
    
const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
};
return (
    <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
            <CustomButtonWrapper>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    multiple 
                />
                <Grid container alignItems="center" justifyContent="center" spacing={6}>
                    <Grid item>
                        <CloudUploadIcon fontSize="large" style={{ color: '#4caf50' }} />
                    </Grid>
                    <Grid item>
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="h6" color="textSecondary">
                                อัปโหลดไฟล์
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                ไฟล์ที่รองรับ: {fileType}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item>
                        <MDButton variant="outlined" color="primary" onClick={handleFileUpload}>
                            เลือกไฟล์
                        </MDButton>
                    </Grid>
                </Grid>
            </CustomButtonWrapper>
        </Grid>
        <Grid item xs={12} lg={6}>
    <Box 
        sx={{ 
            padding: '1rem', 
            border: '1px solid #ccc', 
            borderRadius: '8px', 
            overflowY: 'auto', 
            maxHeight: '150px' // กำหนดความสูงของกล่องที่สามารถเลื่อนดูได้
        }}
    >
        {formState.labFiles && formState.labFiles.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                {formState.labFiles.map((file, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        <PictureAsPdfIcon style={{ color: 'red', marginRight: '10px' }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2">{file.file_name || "Unknown File"}</Typography>
                            <Typography variant="caption" color="textSecondary">
                                {file.fileSize ? `${file.fileSize} ` : "Unknown Size"}
                            </Typography>
                        </Box>
                        <IconButton onClick={() => handleDownloadFile(file)} color="primary">
                            <GetAppIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteFile(file)} color="error">
                            <DeleteIcon />
                        </IconButton>
                    </li>
                ))}
            </ul>
        ) : (
            <Typography variant="body2" color="textSecondary">
                ยังไม่มีไฟล์ที่อัปโหลด
            </Typography>
        )}
    </Box>
</Grid>
        <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            message={alertMessage}
        />
    </Grid>
);
    
};

MultiFileUpload.propTypes = {
    name: PropTypes.string.isRequired,
    onFileChange: PropTypes.func.isRequired,
    setting_json: PropTypes.shape({
        allow_file_type: PropTypes.arrayOf(PropTypes.string),
        max_file_size: PropTypes.number
    }).isRequired,
    value: PropTypes.array,
    labinsp_number: PropTypes.string,       // prop สำหรับรับเลขส่งตรวจ
    directory_upload: PropTypes.string      // prop สำหรับรับโฟลเดอร์ย่อยในการเก็บไฟล์
};

export default MultiFileUpload;

