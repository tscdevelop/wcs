// 2024-10-25 : ปรับ ไปใช้ setting_json แทนการกำหนด Prop และซ่อนไอคอนเมื่อพิมพ์
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import MDTypography from "components/MDTypography"; // ใช้ MDTypography จาก Material Dashboard
import MDButton from "components/MDButton";
import MDBox from "components/MDBox"; // ใช้ MDBox สำหรับการจัดตำแหน่ง

// CommentIconControl ใช้ MDButton และ MDTypography เพื่อให้สอดคล้องกับธีมของ Material Dashboard
const CommentIconControl = ({ value, onSaveComment, setting_json, style = {}, show_icon = true }) => {
  const [open, setOpen] = useState(false);
  const [tempComment, setTempComment] = useState(value || '');
  
  // Parse setting_json only if it's a string
  const settings = typeof setting_json === 'string' ? JSON.parse(setting_json) : setting_json;
  const maxLength = settings?.maxLength || 255; // Default max length to 255
  const defaultValue = settings?.defaultValue || '';

  useEffect(() => {
    // Set initial value to defaultValue only once on component mount
    if (!value && !tempComment && defaultValue) {
      setTempComment(defaultValue);
      onSaveComment(defaultValue);
    }
  }, []); // Empty dependency array ensures this runs only once

  const handleSave = () => {
    onSaveComment(tempComment);
    setOpen(false);
  };

  const handleOpen = () => {
    setTempComment(value || '');
    setOpen(true);
  };

  return (
    <MDBox display="flex" alignItems="center">
      {show_icon && (
        <Tooltip title={value || style.placeholder || 'Add your comment'}>
          <IconButton onClick={handleOpen} className="no-print"> {/* ใช้คลาส no-print เพื่อซ่อนเมื่อพิมพ์ */}
            <CommentIcon className={value ? 'comment-icon--highlight' : ''} />
          </IconButton>
        </Tooltip>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Comment</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={tempComment}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setTempComment(e.target.value);
              }
            }}
            placeholder={style.placeholder || "Add your comment"}
            inputProps={{ maxLength: maxLength }}
          />
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} color="info" variant="gradient">
            <MDTypography variant="button" fontWeight="medium" color="white">SAVE</MDTypography>
          </MDButton>
          <MDButton onClick={() => setOpen(false)} color="secondary">
            <MDTypography variant="button" fontWeight="medium">CANCEL</MDTypography>
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

CommentIconControl.propTypes = {
  value: PropTypes.string,
  onSaveComment: PropTypes.func.isRequired,
  setting_json: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  style: PropTypes.shape({
    placeholder: PropTypes.string,
  }),
  show_icon: PropTypes.bool, // กำหนด prop เพื่อแสดงหรือซ่อน IconButton
};

export default CommentIconControl;



// ก่อนปรับ ไปใช้ setting_json แทนการกำหนด Prop และซ่อนไอคอนเมื่อพิมพ์
/* import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import MDTypography from "components/MDTypography"; // ใช้ MDTypography จาก Material Dashboard
import MDButton from "components/MDButton";
import MDBox from "components/MDBox"; // ใช้ MDBox สำหรับการจัดตำแหน่ง

// CommentIconControl ใช้ MDButton และ MDTypography เพื่อให้สอดคล้องกับธีมของ Material Dashboard
const CommentIconControl = ({ value, onSaveComment }) => {
  const [open, setOpen] = useState(false);
  const [tempComment, setTempComment] = useState(value || ''); // State ชั่วคราวสำหรับเก็บคอมเมนต์

  const handleSave = () => {
    onSaveComment(tempComment); // ส่งคอมเมนต์ที่บันทึกไปยังฟังก์ชัน onSaveComment
    setOpen(false);
  };

  const handleOpen = () => {
    setTempComment(value || ''); // ตั้งค่า tempComment ใหม่เมื่อเปิด dialog เพื่อให้แสดงค่าปัจจุบัน
    setOpen(true);
  };

  return (
    <MDBox display="flex" alignItems="center">
      <Tooltip title={value || 'Add your comment'}>
        <IconButton onClick={handleOpen}>
          <CommentIcon className={value ? 'comment-icon--highlight' : ''} />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Comment</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={tempComment} // ใช้ tempComment เป็นตัวแสดงค่า
            onChange={(e) => setTempComment(e.target.value)} // เก็บค่าชั่วคราวใน tempComment
            placeholder="Add your comment"
          />
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} color="info" variant="gradient">
            <MDTypography variant="button" fontWeight="medium" color="white">SAVE</MDTypography>
          </MDButton>
          <MDButton onClick={() => setOpen(false)} color="secondary">
            <MDTypography variant="button" fontWeight="medium">CANCEL</MDTypography>
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

CommentIconControl.propTypes = {
  value: PropTypes.string,
  onSaveComment: PropTypes.func.isRequired,
};

export default CommentIconControl; */
