// 2024-10-25 : ปรับมาใช้ setting_json และ style และให้ซ่อน ขอบ Textbox , รูปปฎิทิน เมื่อทำการ print
// ตัวอย่างข้อมูล setting_json  = "{ \"format\":\"dd/MM/yyyy\",\"defaultValue\":\"25/10/2024\" }"
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField, InputAdornment } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DatePickerControl = ({ value, onChange, setting_json, style = {}, readonly = false }) => {
  const [inputValue, setInputValue] = useState(value);

  // Parse setting_json only if it's a string
  const settings = typeof setting_json === 'string' ? JSON.parse(setting_json) : setting_json;
  const format = settings?.format || "dd/MM/yyyy";
  const defaultValue = settings?.defaultValue || null;

  useEffect(() => {
    // Set initial value to defaultValue only once on component mount
    if (!value && !inputValue && defaultValue) {
      setInputValue(defaultValue);
      onChange(defaultValue);
    } else if (value) {
      // Convert value to ISO format if it's in dd/MM/yyyy format
      const convertedValue = convertToISOFormat(value, format);
      setInputValue(convertedValue);
    }
  }, [defaultValue, value, onChange, format]);

  const handleDateChange = (newValue) => {
    if (newValue) {
      const formattedDate = newValue.toISOString().split('T')[0]; // ส่งวันที่ในรูปแบบ YYYY-MM-DD
      setInputValue(formattedDate);
      onChange(formattedDate);
    } else {
      setInputValue('');
      onChange(''); // หากไม่มีวันที่ ให้ส่งค่าว่าง
    }
  };

  // Function to convert date to ISO format if necessary
  const convertToISOFormat = (dateString, format = "dd/MM/yyyy") => {
    if (format === "dd/MM/yyyy" && dateString) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month}-${day}`;
    }
    return dateString; // Return the original string if it's already in ISO format
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={inputValue ? new Date(inputValue) : null}
        onChange={!readonly ? handleDateChange : null} // Disable onChange when readonly is true
        inputFormat={format}
        readOnly={readonly} // Make the input read-only if the prop is true
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            className={`print-friendly-textbox ${readonly ? 'readonly-mode' : ''}`} // ใช้คลาสเพื่อควบคุมการแสดงผลในโหมดพิมพ์และ readonly
            placeholder={style.placeholder || "Select a date"}
            InputProps={{
              ...params.InputProps,
              endAdornment: !readonly ? (
                <InputAdornment position="end" className="print-friendly-calendar-icon">
                  <CalendarTodayIcon />
                </InputAdornment>
              ) : null, // Hide the calendar icon if readonly is true
              inputProps: {
                ...params.inputProps,
                style: { textAlign: style.textAlign || 'center', ...style }, // ใช้สไตล์จาก style object
                readOnly: readonly, // Make the input truly readonly
              },
            }}
            fullWidth
            sx={{
              width: '100%',
              ...style,
            }}
          />
        )}
        componentsProps={{
          actionBar: {
            actions: !readonly ? ["cancel", "clear", "today", "accept"] : [], // Hide action bar when readonly
            sx: {
              justifyContent: "center", // จัดตำแหน่งปุ่มให้อยู่ตรงกลาง
              "& .MuiButton-root": { minWidth: "100px" } // ปรับความกว้างของปุ่ม
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

DatePickerControl.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setting_json: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  style: PropTypes.shape({
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    placeholder: PropTypes.string,
    backgroundColor: PropTypes.string,
  }),
  readonly: PropTypes.bool, // กำหนด prop เพื่อควบคุม readonly
};

export default DatePickerControl;








// ก่อนปรับ ไปใช้ setting_json แทนการกำหนด Prop
/* import React from 'react';
import PropTypes from 'prop-types';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField, InputAdornment } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // นำเข้าไอคอนปฏิทิน

const DatePickerControl = ({ value, onChange, format = "dd/MM/yyyy", placeholder = "Select a date" }) => {
  const handleDateChange = (newValue) => {
    if (newValue) {
      onChange(newValue.toISOString().split('T')[0]); // ส่งวันที่ในรูปแบบ YYYY-MM-DD
    } else {
      onChange(''); // หากไม่มีวันที่ ให้ส่งค่าว่าง
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={value ? new Date(value) : null}
        onChange={handleDateChange}
        inputFormat={format} // รูปแบบวันที่ในช่อง input
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder} // กำหนดข้อความ placeholder
            InputProps={{
              ...params.InputProps,
              endAdornment: ( // เพิ่มไอคอนปฏิทินที่ด้านขวาของ TextField
                <InputAdornment position="end">
                  <CalendarTodayIcon />
                </InputAdornment>
              ),
              inputProps: {
                ...params.inputProps,
                style: { textAlign: 'center' }, // จัดตำแหน่งวันที่ให้อยู่ตรงกลาง
              },
              sx: {
                backgroundColor: 'InfoBackground', // กำหนดสีพื้นหลังของ TextField
              },
            }}
          />
        )}
        componentsProps={{
          actionBar: {
            actions: ["cancel", "clear", "today", "accept"], // เพิ่มปุ่ม Clear และ Today
            sx: { 
              justifyContent: "center", // จัดตำแหน่งปุ่มให้อยู่ตรงกลาง
              "& .MuiButton-root": { minWidth: "100px" } // ปรับความกว้างของปุ่ม
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

DatePickerControl.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  format: PropTypes.string,
  placeholder: PropTypes.string,
};

export default DatePickerControl; */







/* import React from 'react';
import PropTypes from 'prop-types';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField } from '@mui/material';

const DatePickerControl = ({ value, onChange }) => {
  const handleDateChange = (newValue) => {
    // ตรวจสอบว่ามีค่าก่อนแปลงเป็น string
    if (newValue) {
      onChange(newValue.toISOString().split('T')[0]); // ส่งวันที่ในรูปแบบ YYYY-MM-DD
    } else {
      onChange(''); // หากไม่มีวันที่ ให้ส่งค่าว่าง
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={value ? new Date(value) : null}
        onChange={handleDateChange}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
};

DatePickerControl.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default DatePickerControl;
 */