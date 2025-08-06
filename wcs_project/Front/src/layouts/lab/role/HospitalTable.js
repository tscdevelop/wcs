import React from 'react';
import {
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Typography,
} from '@mui/material';
import * as lang from 'utils/langHelper';

const HospitalTable = ({ hospitalList, selectedHospitals, handleHospitalChange, handleSelectAllHospitals }) => {
  const renderHospitalRows = (hospitals) => {
    return hospitals.map((hospital) => (
      <TableRow key={hospital.hospital_code} >
        <TableCell align="center">
          <Checkbox
            checked={selectedHospitals.includes(hospital.hospital_code)}
            onChange={() => handleHospitalChange(hospital.hospital_code)}
          />
        </TableCell>
        <TableCell>
          <Typography variant="h6">{hospital.hospital_name_th}</Typography>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <TableContainer>
      <Table>
        <TableHead  style={{ display: 'table-header-group' }}>
          <TableRow>
            <TableCell align="center">
              <Checkbox
                onChange={handleSelectAllHospitals}
                checked={selectedHospitals.length === hospitalList.length && hospitalList.length > 0}
              />
              {lang.msg("All")}
            </TableCell>
            <TableCell>{lang.msg("ชื่อโรงพยาบาล")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderHospitalRows(hospitalList)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HospitalTable;
