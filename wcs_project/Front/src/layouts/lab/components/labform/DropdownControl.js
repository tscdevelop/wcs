import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { StyledFormControl, StyledMenuItem, StyledSelect } from "common/Global.style";

const DropdownControl = ({
  name,
  value,
  onChange,
  setting_json,
  style = {},
  readonly = false,
  required = false
}) => {
  // Parse setting_json only if it's a string
  const settings = typeof setting_json === 'string' ? JSON.parse(setting_json) : setting_json;
  const options = settings?.options || [];
  const defaultValue = settings?.defaultValue || '';
  const label = settings.label || '';

  // Check if value exists in options, otherwise use defaultValue
  const validValue = options.some(option => option.value === value) ? value : defaultValue;

  // Local state to manage dropdown value
  const [selectedValue, setSelectedValue] = useState(validValue);

  // Update selectedValue when value prop changes
  useEffect(() => {
    if (options.some(option => option.value === value)) {
      setSelectedValue(value);
    }
  }, [value, options]);

  // Ensure onChange is a function before calling it
  const handleChange = (e) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ width: '100%', ...style }}>
      <StyledFormControl fullWidth required={required} disabled={readonly} variant="outlined">
        <InputLabel>{label}</InputLabel>
        <StyledSelect
          name={name}
          value={selectedValue} // Use local state to manage value
          onChange={handleChange}
          label={label}
        >
          {options.map((option) => (
            <StyledMenuItem key={option.value} value={option.value}>
              {option.text}
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </StyledFormControl>
    </Box>
  );
};

DropdownControl.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  setting_json: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  style: PropTypes.object,
  readonly: PropTypes.bool,
  required: PropTypes.bool,
};

export default DropdownControl;
