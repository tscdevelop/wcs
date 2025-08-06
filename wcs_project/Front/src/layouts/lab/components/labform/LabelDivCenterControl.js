import React from 'react';
import PropTypes from 'prop-types';
// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const LabelDivCenterControl = ({ value, style }) => {
  return (
    <MDBox display="flex" alignItems="center" justifyContent="center" height="100%" width="100%" p={1} style={style}>
      <MDTypography 
        variant="body" 
        textAlign="center">
        {value}
      </MDTypography>
    </MDBox>
  );
};

LabelDivCenterControl.propTypes = {
  value: PropTypes.string.isRequired,
  style: PropTypes.object,
};

export default LabelDivCenterControl;
