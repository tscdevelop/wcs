import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import MDBox from "components/MDBox";

const TextAreaControl = ({ value, name, onChange, setting_json, style = {}, readonly = false, required = false }) => {
  const [inputValue, setInputValue] = useState(value);

  // Parse setting_json only if it's a string
  const settings = typeof setting_json === 'string' ? JSON.parse(setting_json) : setting_json;
  const maxLength = settings?.maxLength || 1000; // Default max length to 1000 for TextArea
  const defaultValue = settings?.defaultValue || '';
  const rows = settings?.rows || 4; // Default rows for TextArea

  useEffect(() => {
    // Set initial value to defaultValue only once on component mount
    if (!value && !inputValue && defaultValue) {
      setInputValue(defaultValue);
      onChange(defaultValue);
    }
  }, []); // Empty dependency array ensures this runs only once

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setInputValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <MDBox display="flex" alignItems="center" justifyContent="center" width="100%">
      <TextField
        variant="outlined"
        className="print-friendly-textarea"
        name={name}
        value={inputValue}
        onChange={handleChange}
        placeholder={style.placeholder || "Enter text"}
        inputProps={{
          style: { textAlign: style.textAlign || 'left' },
          maxLength: maxLength,
          readOnly: readonly, // กำหนดให้อ่านอย่างเดียวถ้า readonly เป็น true
        }}
        fullWidth
        required={required} // กำหนดเป็น required ถ้า required เป็น true
        multiline // ทำให้กลายเป็น TextArea
        rows={rows} // กำหนดจำนวนแถว
        sx={{
          width: "100%",
          backgroundColor: readonly ? 'transparent' : 'white', // สีพื้นหลังเป็นโปร่งใสเมื่อ readonly เป็น true
          ...style,
        }}
      />
    </MDBox>
  );
};

TextAreaControl.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setting_json: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  style: PropTypes.shape({
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    placeholder: PropTypes.string,
  }),
  readonly: PropTypes.bool, // เพิ่ม prop สำหรับ readonly
  required: PropTypes.bool, // เพิ่ม prop สำหรับ required
};

export default TextAreaControl;
