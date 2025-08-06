import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid } from '@mui/material';
import TextBoxControl from './TextBoxControl';
import RangeControl from './RangeControl';
import RangeLabelControl from './RangeLabelControl';
import LabelControl from './LabelControl';
import CompositeLabelControl from './CompositeLabelControl';
import CommentIconControl from './CommentIconControl';
import DatePickerControl from './DatePickerControl';
import LabelDivCenterControl from './LabelDivCenterControl';
import DropdownControl from './DropdownControl';
import './LabResultTable.css';

const LabForm_ControlLayout = ({ data }) => {
    const [formData, setFormData] = useState(data);
  
    const handleInputChange = (name, newValue) => {
      setFormData((prevFormData) => {
        const updatedControls = prevFormData.controls.map((control) =>
          control.name === name ? { ...control, value: newValue } : control
        );
        return { ...prevFormData, controls: updatedControls };
      });
    };
  
    const handleSaveComment = (name, newComment) => {
      setFormData((prevFormData) => {
        const updatedControls = prevFormData.controls.map((control) =>
          control.name === name ? { ...control, value: newComment } : control
        );
        return { ...prevFormData, controls: updatedControls };
      });
    };
  
    const controlRenderer = (control) => {
      switch (control.controltype) {
        case 'TEXTBOX':
          return (
            <TextBoxControl
              key={control.name}
              name={control.name}
              value={control.value}
              setting_json={control.setting_json}
              style={control.style}
              onChange={(newValue) => handleInputChange(control.name, newValue)}
            />
          );

      case 'DROPDOWN':
            return (   <DropdownControl
          name={control.name}
          value={control.value}
          setting_json={control.setting_json}
          style={{ marginBottom: '20px' }}
          readonly={control.readonly}
          required={control.required}
        />
      );
  
        case 'RANGE':
          return (
            <RangeControl
              key={control.name}
              name={control.name}
              value={control.value}
              note_label={control.note_label}
              setting_json={control.setting_json}
              style={control.style}
              onChange={(newValue, noteLabel) => handleInputChange(control.name, newValue, noteLabel)}
            />
          );
  
        case 'RANGE_LABEL':
          return (
            <RangeLabelControl
              key={control.name}
              name={control.name}
              value={control.value}
              note_label={control.note_label}
              setting_json={control.setting_json}
              style={control.style}
            />
          );
  
        case 'LABEL':
          return (
            <LabelControl
              key={control.name}
              name={control.name}
              value={control.value}
              style={control.style}
            />
          );
  
        case 'COMPOSITE_LABEL':
          return (
            <CompositeLabelControl
              key={control.name}
              name={control.name}
              parts={control.parts}
            />
          );
  
        case 'COMMENT_ICON':
          return (
            <CommentIconControl
              key={control.name}
              name={control.name}
              value={control.value}
              onSaveComment={(newComment) => handleSaveComment(control.name, newComment)}
              show_icon={control.show_icon}
              setting_json={control.setting_json}
              style={control.style}
            />
          );
  
        case 'DATEPICKER':
          return (
            <DatePickerControl
              key={control.name}
              name={control.name}
              value={control.value}
              onChange={(newValue) => handleInputChange(control.name, newValue)}
              readonly={control.readonly}
              setting_json={control.setting_json}
              style={control.style}
            />
          );
  
        case 'LABEL_DIV_CENTER':
          return (
            <LabelDivCenterControl
              key={control.name}
              name={control.name}
              value={control.value}
              style={control.style}
            />
          );
  
        default:
          return null;
      }
    };
  
    return (
        <Box
          className="lab-form-layout" // เพิ่ม className เพื่อกำหนดฟอนต์และสไตล์
          display="grid"
          gridTemplateColumns={`repeat(${formData.layout.columns}, 1fr)`} // กำหนดจำนวนคอลัมน์
          gap="16px" // ระยะห่างระหว่าง Control แต่ละตัว
          sx={{
            gridAutoRows: 'minmax(60px, auto)', // กำหนดความสูงขั้นต่ำของแถว
            width: '100%',
          }}
        >
          {formData.controls.map((control) => (
            <Box
              key={control.name}
              className="control-container" // เพิ่ม className เพื่อใช้ควบคุมสไตล์ของ control
              gridColumn={`${control.position.col} / span ${control.position.colSpan || 1}`} // ระบุตำแหน่งคอลัมน์
              gridRow={control.position.row} // ระบุแถว
            >
              {controlRenderer(control)}
            </Box>
          ))}
        </Box>
      );
  };
  
  LabForm_ControlLayout.propTypes = {
    data: PropTypes.shape({
      layout: PropTypes.shape({
        rows: PropTypes.number.isRequired,
        columns: PropTypes.number.isRequired,
      }),
      controls: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          controltype: PropTypes.string.isRequired,
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          setting_json: PropTypes.object,
          style: PropTypes.object,
          position: PropTypes.shape({
            row: PropTypes.number.isRequired,
            col: PropTypes.number.isRequired,
            colSpan: PropTypes.number,
          }),
        })
      ).isRequired,
    }).isRequired,
  };
  
  export default LabForm_ControlLayout;
