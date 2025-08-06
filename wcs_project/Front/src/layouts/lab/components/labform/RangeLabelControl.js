// 2024-10-29 : เพิ่ม prop เก็บค่า note_label
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { evaluateRange } from 'utils/rangeEvaluator';
import { getColorFromClass } from 'utils/BaseHelper';

const RangeLabelControl = ({
  value,
  name,
  note_label: initialNoteLabel, // รับค่า note_label เป็น prop
  setting_json,
  style = {},
}) => {
  const [noteLabel, setNoteLabel] = useState(initialNoteLabel || ''); // ใช้ note_label ที่รับจาก prop หรือค่าเริ่มต้นเป็น ''
  const defaultTextColor = style.textColor || 'text';
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

  useEffect(() => {
    if (value === '') {
      setNoteLabel(initialNoteLabel || ''); // ใช้ค่า note_label ที่รับมาเป็นค่าเริ่มต้น
      setTextColor(defaultTextColor);
    } else {
      const cell = { operator, value1, value2, note, note_above: noteAbove, note_below: noteBelow };
      const { label, source } = evaluateRange(cell, value);
  
      if (label) {
        setNoteLabel(label);
      } else {
        setNoteLabel(''); // หากไม่มีค่า ให้เคลียร์
      }
  
      const colorClass = getColorFromClass(`note-label ${source}`);
      setTextColor(style.textColor || colorClass || defaultTextColor);
    }
  }, [value, operator, value1, value2, note, noteAbove, noteBelow, initialNoteLabel]);
  

  return (
    <MDBox 
      name={name} 
      display="flex" 
      alignItems={style.textAlign || 'center'} 
      width="100%" 
      gap="0.5rem" 
      className="composite-label"
    >
      <MDTypography 
        variant="body"
        sx={{ color: textColor }}
      >
        {value}
      </MDTypography>
      <MDTypography 
        variant="body"
        sx={{ color: textColor }}
      >
        {noteLabel}
      </MDTypography>
    </MDBox>
  );
};

RangeLabelControl.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  setting_json: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  style: PropTypes.shape({
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    textColor: PropTypes.string
  }),
  note_label: PropTypes.string // เพิ่ม prop สำหรับรับค่า note_label
};

export default RangeLabelControl;


// 2024-10-25 : ปรับมาใช้ settign_json แทนการส่ง Prop

/* 
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { evaluateRange } from 'utils/rangeEvaluator';
import { getColorFromClass } from 'utils/BaseHelper';

const RangeLabelControl = ({
  value,
  name,
  setting_json,
  style = {}
}) => {
  const [noteLabel, setNoteLabel] = useState('');
  const defaultTextColor = style.textColor || 'text';
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

  useEffect(() => {
    if (value === '') {
      setNoteLabel('');
      setTextColor(defaultTextColor);
    } else {
      const cell = { operator, value1, value2, note, note_above: noteAbove, note_below: noteBelow };
      const { label, source } = evaluateRange(cell, value);
  
      // ตรวจสอบว่า label และ source มีค่าถูกต้อง
      if (label) {
        setNoteLabel(label);
      } else {
        setNoteLabel(''); // หากไม่มีค่า ให้เคลียร์
      }
  
      const colorClass = getColorFromClass(`note-label ${source}`);
      setTextColor(style.textColor || colorClass || defaultTextColor);
    }
  }, [value, operator, value1, value2, note, noteAbove, noteBelow]);
  

  return (
    <MDBox 
      name={name} 
      display="flex" 
      alignItems={style.textAlign || 'center'} 
      width="100%" 
      gap="0.5rem" 
      className="composite-label"
    >
      <MDTypography 
        variant="body"
        sx={{ color: textColor }}
      >
        {value}
      </MDTypography>
      <MDTypography 
        variant="body"
        sx={{ color: textColor }}
      >
        {noteLabel}
      </MDTypography>
    </MDBox>
  );
};

RangeLabelControl.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  setting_json: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  style: PropTypes.shape({
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    textColor: PropTypes.string
  })
};

export default RangeLabelControl; */




// ก่อนปรับ ไปใช้ setting_json แทนการกำหนด Prop
/* import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { evaluateRange } from 'utils/rangeEvaluator';
import { getColorFromClass } from 'utils/BaseHelper';

const RangeLabelControl = ({
  value,
  name,
  operator,
  value1,
  value2,
  note,
  noteAbove,
  noteBelow,
  textAlign = "center"
}) => {

  const [noteLabel, setNoteLabel] = useState('');
  const [textColor, setTextColor] = useState('text');

  useEffect(() => {
    if (value === '') {
      setNoteLabel('');
      setTextColor('text');
    } else {
      const cell = { operator, value1, value2, note, note_above: noteAbove, note_below: noteBelow };
      console.log('cell : ', cell);
      const { label, source } = evaluateRange(cell, value);
      console.log('label : ', label);
      console.log('source : ', source);
      setNoteLabel(label || '');
      const colorClass = getColorFromClass(`note-label ${source}`);
      setTextColor(colorClass || 'text');
      console.log('textColor : ', textColor);
    }
  }, [value, operator, value1, value2, note, noteAbove, noteBelow]);

  return (
    <MDBox name={name} display="flex" alignItems={textAlign} width="100%" gap="0.5rem" className="composite-label">
      <MDTypography 
        variant="body"
        sx={{ color: textColor }} // ใช้ sx แทน color
      >
        {value}
      </MDTypography>
      
      
        <MDTypography 
          variant="body"
          sx={{ color: textColor }} // ใช้ sx แทน color
        >
          {noteLabel}
        </MDTypography>
      
    </MDBox>
  );
};

RangeLabelControl.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  operator: PropTypes.string,
  value1: PropTypes.string,
  value2: PropTypes.string,
  note: PropTypes.string,
  noteAbove: PropTypes.string,
  noteBelow: PropTypes.string,
  textAlign: PropTypes.oneOf(['left', 'center', 'right'])
};

export default RangeLabelControl;
 */