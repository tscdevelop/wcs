import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import TableComponent from "./table_component";
import ButtonComponent from "./ButtonComponent";

const FormComponent = ({ fields, onChange, onSubmit, buttonType, tableProps }) => {
  return (
    <MDBox p={3}>
      <form onSubmit={onSubmit}>
        <Grid container spacing={3}>
          {fields.map((field) => (
            <Grid item xs={field.size || 12} key={field.name}>
              <MDInput
                fullWidth
                label={field.label}
                name={field.name}
                type={field.type || "text"}
                value={field.value}
                onChange={onChange}
                multiline={field.multiline || false}
                rows={field.rows || 1}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
          <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="flex-end" height="100%">
              <ButtonComponent type={buttonType} onClick={onSubmit} />
            </MDBox>
          </Grid>
        </Grid>
      </form>
      {/* Display TableComponent */}
      {tableProps && (
        <MDBox mt={4}>
          <TableComponent {...tableProps} />
        </MDBox>
      )}
    </MDBox>
  );
};

// PropTypes
FormComponent.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      size: PropTypes.number,
      type: PropTypes.string,
      multiline: PropTypes.bool,
      rows: PropTypes.number,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  buttonType: PropTypes.string.isRequired,
  tableProps: PropTypes.shape({
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  }),
};

export default FormComponent;
