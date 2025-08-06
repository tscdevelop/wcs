import React from 'react';
import PropTypes from 'prop-types';
// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const CompositeLabelControl = ({ parts }) => (
  <MDBox display="flex" alignItems="center" width="100%" gap="0.5rem" className="composite-label">
    {parts.map((part, index) => (
      <MDTypography 
        key={index}
        variant="body" // ปรับขนาดตัวอักษรให้สอดคล้องกับ RangeControl
        color={part.style?.color || 'text'} // ใช้สีที่กำหนดใน style หรือใช้สี default
        style={{ ...part.style, display: 'inline-block' }}
      >
        {part.value}
      </MDTypography>
    ))}
  </MDBox>
);

CompositeLabelControl.propTypes = {
  parts: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      style: PropTypes.object,
    })
  ).isRequired,
};

export default CompositeLabelControl;
