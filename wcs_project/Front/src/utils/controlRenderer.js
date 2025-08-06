/* // utils/controlRenderer.js

import React from 'react';
import TextBoxControl from '../layouts/lab/components/labform/TextBoxControl';
import RangeControl from '../layouts/lab/components/labform/RangeControl';
import RangeLabelControl from '../layouts/lab/components/labform/RangeLabelControl';
import LabelControl from '../layouts/lab/components/labform/LabelControl';
import CompositeLabelControl from '../layouts/lab/components/labform/CompositeLabelControl';
import CommentIconControl from '../layouts/lab/components/labform/CommentIconControl';
import DatePickerControl from '../layouts/lab/components/labform/DatePickerControl';
import LabelDivCenterControl from '../layouts/lab/components/labform/LabelDivCenterControl';

const noop = () => {};

const controlRenderer = (control, handlers) => {
  
    switch (control.controltype) {
      case 'TEXTBOX':
        return (
          <TextBoxControl
            name={control.name}
            value={control.value}
            onChange={(newValue) => handlers.handleInputChange(control.name, newValue)}
            readonly={control.readonly}
            required={control.required}
            setting_json={control.setting_json}
            style={control.style || {}}
          />
        );
  
      case 'RANGE':
        return (
          <RangeControl
            name={control.name}
            value={control.value}
            note_label={control.note_label}
            onChange={(newValue, noteLabel) => handlers.handleInputRangeChange(control.name, newValue, noteLabel)}
            setting_json={control.setting_json}
            style={control.style || {}}
          />
        );
  
      case 'RANGE_LABEL':
        return (
          <RangeLabelControl
            name={control.name}
            value={control.value}
            note_label={control.note_label}
            setting_json={control.setting_json}
            style={control.style || {}}
          />
        );
  
      case 'COMPOSITE_LABEL':
        return (
          <CompositeLabelControl
            name={control.name}
            parts={control.parts}
            style={control.style || {}}
          />
        );
  
      case 'LABEL':
        return (
          <LabelControl
            name={control.name}
            value={control.value}
            style={control.style || {}}
            tooltip={control.tooltip}
          />
        );
  
      case 'LABEL_DIV_CENTER':
        return (
          <LabelDivCenterControl
            name={control.name}
            value={control.value}
            style={control.style || {}}
          />
        );
  
      case 'DATEPICKER':
        return (
          <DatePickerControl
            name={control.name}
            value={control.value}
            onChange={(newValue) => handlers.handleDateChange(control.name, newValue)}
            readonly={control.readonly}
            setting_json={control.setting_json}
            style={control.style || {}}
          />
        );
  
      case 'COMMENT_ICON':
        return (
          <CommentIconControl
            name={control.name}
            value={control.value}
            onSaveComment={(newComment) => handlers.handleSaveComment(control.name, newComment)}
            show_icon={control.show_icon}
            setting_json={control.setting_json}
            style={control.style || {}}
          />
        );
  
      default:
        return null;
    }
  };
  
  export default controlRenderer; */