import React from 'react';
import PropTypes from 'prop-types';
// Material Dashboard 2 PRO React components
import MDTypography from "components/MDTypography";
import { Tooltip } from '@mui/material';

const LabelControl = ({ value, style, tooltip }) => (
  <Tooltip title={tooltip || ''}>
    <MDTypography 
      variant="body" 
      style={{ ...style, textAlign: 'center' }}>
      {value}
    </MDTypography>
  </Tooltip>
);

LabelControl.propTypes = {
  value: PropTypes.string.isRequired,
  style: PropTypes.object,
  tooltip: PropTypes.string,
};

export default LabelControl;
