// 2024-10-25 : ปรับมาใช้ settign_json แทนการส่ง Prop
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import MDBox from "components/MDBox";

const TextBoxControl = ({ value, name, onChange, setting_json, style = {}, readonly = false, required = false }) => {
  const [inputValue, setInputValue] = useState(value);

  // Parse setting_json only if it's a string
  const settings = typeof setting_json === 'string' ? JSON.parse(setting_json) : setting_json;
  const maxLength = settings?.maxLength || 255; // Default max length to 255
  const defaultValue = settings?.defaultValue || '';

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
        className="print-friendly-textbox"
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
        sx={{
          width: "100%",
          backgroundColor: readonly ? 'transparent' : 'white', // สีพื้นหลังเป็นโปร่งใสเมื่อ readonly เป็น true
          ...style,
        }}
      />
    </MDBox>
  );
};

TextBoxControl.propTypes = {
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

export default TextBoxControl;





// ก่อนปรับ ไปใช้ setting_json แทนการกำหนด Prop
// import React from 'react';
// import PropTypes from 'prop-types';
// import { TextField } from '@mui/material';
// import MDBox from "components/MDBox"; // ใช้ MDBox สำหรับการจัดตำแหน่งให้เข้ากับธีม

// const TextBoxControl = ({ value, name, onChange, placeholder = "Enter text", textAlign = "left" }) => (
//   <MDBox display="flex" alignItems="center" justifyContent="center" width="100%"> {/* ทำให้ MDBox กว้างเต็ม 100% */}
//     <TextField
//       variant="outlined"
//       name={name}
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       placeholder={placeholder}
//       inputProps={{ style: { textAlign } }} // ปรับการจัดตำแหน่งข้อความตามค่าที่ส่งมา
//       fullWidth
//       sx={{ width: "100%" }} // กำหนดให้ TextField ใช้ความกว้าง 100% ของ MDBox
//     />
//   </MDBox>
// );

// TextBoxControl.propTypes = {
//   value: PropTypes.string,
//   name: PropTypes.string,
//   onChange: PropTypes.func.isRequired,
//   placeholder: PropTypes.string,
//   textAlign: PropTypes.oneOf(['left', 'center', 'right']),
// };

// export default TextBoxControl;
