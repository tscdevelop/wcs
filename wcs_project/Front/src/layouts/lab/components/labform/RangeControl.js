// 2024-10-29 : เพิ่ม prop เก็บค่า note_label
import React, { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import PropTypes from 'prop-types';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { evaluateRange } from 'utils/rangeEvaluator';
import { getColorFromClass } from 'utils/BaseHelper';

const RangeControl = ({
  value,
  name,
  note_label: initialNoteLabel, // รับค่า note_label เป็น prop
  onChange,
  setting_json,
  style = {},
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [note_label, setNoteLabel] = useState(initialNoteLabel || '');
  const defaultTextColor = style.textColor || 'black';
  const [textColor, setTextColor] = useState(defaultTextColor);

  // Parse setting_json only if it's a string
  const {
    operator,
    value1,
    value2,
    note,
    note_above: noteAbove,
    note_below: noteBelow
  } = typeof setting_json === 'string' ? JSON.parse(setting_json) : setting_json;

  const updateNoteAndColor = (value) => {
    if (value === '') {
      setInputValue(value || '');
      setNoteLabel('');
      setTextColor(defaultTextColor);
      onChange(value, ''); // ส่งค่า note_label เป็นค่าว่างเมื่อไม่มีค่าใน input
    } else {
      const cell = { operator, value1, value2, note, note_above: noteAbove, note_below: noteBelow };
      const { label, source } = evaluateRange(cell, value);
      setInputValue(value || '');
      setNoteLabel(label || '');
      setTextColor(style.textColor || getColorFromClass(`note-label ${source}`) || defaultTextColor);
      onChange(value, label); // ส่งค่า note_label ที่อัปเดตไปด้วย
    }
  };

  useEffect(() => {
    updateNoteAndColor(value);
  }, [value, operator, value1, value2, note, noteAbove, noteBelow]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (/^\d*\.?\d{0,3}$/.test(newValue)) {
      setInputValue(newValue);
      updateNoteAndColor(newValue);
    }
  };

  return (
    <MDBox className="print-friendly-range" display="flex" alignItems="center" gap={2}>
      <TextField
        variant="outlined"
        name={name}
        value={inputValue}
        onChange={handleChange}
        placeholder={style.placeholder || "Enter value"}
        inputProps={{
          inputMode: 'decimal',
          style: { textAlign: style.textAlign || 'center', color: textColor }
        }}
        fullWidth
        sx={{ flex: 0.8 }}
      />
      {note_label && (
        <MDBox component="span">
          <MDTypography 
            style={{ color: textColor }}  
            variant="body"
            fullWidth
            sx={{ flex: 0.2 }}
          >
            {note_label}
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
};

RangeControl.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setting_json: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  style: PropTypes.shape({
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    placeholder: PropTypes.string,
    textColor: PropTypes.string
  }),
  note_label: PropTypes.string // เพิ่ม prop สำหรับรับค่า note_label
};

export default RangeControl;


// 2024-10-25 : ปรับมาใช้ settign_json แทนการส่ง Prop

// Usage Example
{/* <RangeControl 
  value="1.2" 
  name="example" 
  onChange={(newValue) => console.log(newValue)} 
  setting_json='{ "ref_range": "1 - 1.5", "operator": "BETWEEN", "value1": "1", "value2": "1.5", "note": "", "note_above": "H", "note_below": "L" }'
  style={{ textAlign: "right", placeholder: "Please enter a value", textColor: "blue" }}
/> */}
/* 
import React, { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import PropTypes from 'prop-types';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { evaluateRange } from 'utils/rangeEvaluator';
import { getColorFromClass } from 'utils/BaseHelper';

const RangeControl = ({
  value,
  name,
  onChange,
  setting_json,
  style = {}
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [noteLabel, setNoteLabel] = useState('');
  const defaultTextColor = style.textColor || 'black';
  const [textColor, setTextColor] = useState(defaultTextColor);

  // Parse setting_json only if it's a string
  const {
    operator,
    value1,
    value2,
    note,
    note_above: noteAbove,
    note_below: noteBelow
  } = typeof setting_json === 'string' ? JSON.parse(setting_json) : setting_json;

  const updateNoteAndColor = (value) => {
    if (value === '') {
      setInputValue(value || '');
      setNoteLabel('');
      setTextColor(defaultTextColor);
    } else {
      const cell = { operator, value1, value2, note, note_above: noteAbove, note_below: noteBelow };
      const { label, source } = evaluateRange(cell, value);
      setInputValue(value || '');
      setNoteLabel(label || '');
      setTextColor(style.textColor || getColorFromClass(`note-label ${source}`) || defaultTextColor);
    }
  };

  useEffect(() => {
    updateNoteAndColor(value);
  }, [value, operator, value1, value2, note, noteAbove, noteBelow]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (/^\d*\.?\d{0,3}$/.test(newValue)) {
      setInputValue(newValue);
      onChange(newValue);
      updateNoteAndColor(newValue);
    }
  };

  return (
    <MDBox className="print-friendly-range" display="flex" alignItems="center" gap={2}>
      <TextField
        variant="outlined"
        name={name}
        value={inputValue}
        onChange={handleChange}
        placeholder={style.placeholder || "Enter value"}
        inputProps={{
          inputMode: 'decimal',
          style: { textAlign: style.textAlign || 'center', color: textColor }
        }}
        fullWidth
        sx={{ flex: 0.8 }}
      />
      {noteLabel && (
        <MDBox component="span">
          <MDTypography 
            style={{ color: textColor }}  
            variant="body"
            fullWidth
            sx={{ flex: 0.2 }}
          >
            {noteLabel}
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
};

RangeControl.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setting_json: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  style: PropTypes.shape({
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    placeholder: PropTypes.string,
    textColor: PropTypes.string
  })
};

export default RangeControl; */




// ก่อนปรับ ไปใช้ setting_json แทนการกำหนด Prop
/* import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { evaluateRange } from 'utils/rangeEvaluator';
import { getColorFromClass } from 'utils/BaseHelper';

const RangeControl = ({
  value,
  name,
  onChange,
  operator,
  value1,
  value2,
  note,
  noteAbove,
  noteBelow,
  placeholder = "Enter value",
  textAlign = "center"
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [noteLabel, setNoteLabel] = useState('');
  const [textColor, setTextColor] = useState('black');

  // ฟังก์ชันสำหรับการตรวจสอบเงื่อนไขและตั้งค่า
  const updateNoteAndColor = (value) => {
    if (value === '') {
      setInputValue(value || '');
      setNoteLabel('');
      setTextColor('black');
    } else {
      const cell = { operator, value1, value2, note, note_above: noteAbove, note_below: noteBelow };
      const { label, source } = evaluateRange(cell, value);
      setInputValue(value || '');
      setNoteLabel(label || '');
      setTextColor(getColorFromClass(`note-label ${source}`) || 'black');
    }
  };

  useEffect(() => {
    // เรียกฟังก์ชัน updateNoteAndColor เมื่อมีการเปลี่ยนแปลงค่าใน dependency array
    updateNoteAndColor(value);
  }, [value, operator, value1, value2, note, noteAbove, noteBelow]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (/^\d*\.?\d{0,3}$/.test(newValue)) {
      setInputValue(newValue);
      onChange(newValue);
      updateNoteAndColor(newValue); // เรียกใช้ฟังก์ชันที่แยกออกมา
    }
  };

  return (
    <MDBox display="flex" alignItems="center" gap={2}>
      <TextField
        variant="outlined"
        name={name}
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        inputProps={{
          inputMode: 'decimal',
          style: { textAlign, color: textColor }
        }}
        fullWidth
        sx={{ flex: 0.8 }}
      />
      {noteLabel && (
        <MDBox component="span">
          <MDTypography 
            style={{ color: textColor }}  
            variant="body"
            //variant="h6"
            //fontWeight="medium"
            fullWidth
            sx={{ flex: 0.2 }}
          >
            {noteLabel}
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
};

RangeControl.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  operator: PropTypes.string,
  value1: PropTypes.string,
  value2: PropTypes.string,
  note: PropTypes.string,
  noteAbove: PropTypes.string,
  noteBelow: PropTypes.string,
  placeholder: PropTypes.string,
  textAlign: PropTypes.oneOf(['left', 'center', 'right'])
};

export default RangeControl; */


/* ก่อนปรับให้ กำหนด notelabel และ color เมื่อส่ง value เข้ามา
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import MDBox from "components/MDBox"; // ใช้ MDBox จาก Material Dashboard
import MDTypography from "components/MDTypography";
import { evaluateRange } from 'utils/rangeEvaluator';
import { getColorFromClass } from 'utils/BaseHelper';

const RangeControl = ({
  value,
  name,
  onChange,
  operator,
  value1,
  value2,
  note,
  noteAbove,
  noteBelow,
  placeholder = "Enter value",
  textAlign = "center"
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [noteLabel, setNoteLabel] = useState('');
  const [textColor, setTextColor] = useState('black');

  useEffect(() => {
    if (value === '') {
      setNoteLabel('');
      setTextColor('black');
    } else {
      const cell = { operator, value1, value2, note, note_above: noteAbove, note_below: noteBelow };
      const { label, source } = evaluateRange(cell, value);
      setNoteLabel(label);
      setTextColor(getColorFromClass(`note-label ${source}`));
    }
  }, [value, operator, value1, value2, note, noteAbove, noteBelow]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (/^\d*\.?\d{0,3}$/.test(newValue)) {
      setInputValue(newValue);
      onChange(newValue);

      if (newValue === '') {
        setNoteLabel('');
        setTextColor('black');
      } else {
        const cell = { operator, value1, value2, note, note_above: noteAbove, note_below: noteBelow };
        const { label, source } = evaluateRange(cell, newValue);
        setNoteLabel(label);
        setTextColor(getColorFromClass(`note-label ${source}`));
      }
    }
  };

  return (
    <MDBox display="flex" alignItems="center" gap={2}>
      <TextField
        variant="outlined"
        name={name}
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        inputProps={{
          inputMode: 'decimal',
          style: { textAlign, color: textColor }
        }}
        fullWidth
        sx={{ flex: 0.8 }} // กำหนดให้ใช้พื้นที่ 80%
      />
      {noteLabel && (
        <MDBox component="span">
          <MDTypography 
            style={{ color: textColor }}  
            variant="h6" // ปรับขนาดตัวอักษรให้สอดคล้องกับ RangeControl
            fontWeight="medium"
            fullWidth
            sx={{ flex: 0.2 }} // กำหนดให้ใช้พื้นที่ 20%
          >
            {noteLabel}
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
};

RangeControl.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  operator: PropTypes.string,
  value1: PropTypes.string,
  value2: PropTypes.string,
  note: PropTypes.string,
  noteAbove: PropTypes.string,
  noteBelow: PropTypes.string,
  placeholder: PropTypes.string,
  textAlign: PropTypes.oneOf(['left', 'center', 'right'])
};

export default RangeControl;
 */