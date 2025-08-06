import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  TextField,
  Button,
  TableContainer,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  styled,
  IconButton,
  Card,
  Autocomplete,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ExitToApp } from '@mui/icons-material';
import DataTable from "examples/Tables/DataTable"; // Ensure this import is correct

import MDBox from "components/MDBox"; // Import MDBox
import FormField from "layouts/pages/account/components/FormField"; // Import FormField
import LabForm from 'layouts/lab/checklist/labform'; // Ensure the path is correct

const TableContainerStyled = styled(TableContainer)(({ theme }) => ({
  borderRadius: '10px',
  overflow: 'hidden',
}));

const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#00aaff',
  color: 'white',
  '&:hover': {
    backgroundColor: '#0088cc',
  },
  marginRight: theme.spacing(2),
}));

const HistoryButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ffaa00',
  color: 'white',
  '&:hover': {
    backgroundColor: '#cc8800',
  },
  marginRight: theme.spacing(2),
}));

const LabFilterAndTable = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('ทั้งหมด');
  const [filteredRows, setFilteredRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false); // State to control LabForm visibility
  const [selectedItems, setSelectedItems] = useState([]); // State to store selected items from LabForm
  const [rowsData, setRowsData] = useState([]); // State to store data fetched from backend

  useEffect(() => {
    // Fetch initial data from backend when component mounts
    fetchData();
  }, []);

  const fetchData = (startDate, endDate, status) => {
    let params = {};
    if (startDate) {
      params.startDate = startDate.toISOString().split('T')[0];
    }
    if (endDate) {
      params.endDate = endDate.toISOString().split('T')[0];
    }
    if (status && status !== 'ทั้งหมด') {
      params.status = status;
    }

    axios.get('//tw-server:3002/checklist/getlabdatatable', { params })
      .then(response => {
        setRowsData(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  };

  const handleHistoryClick = () => {
    fetchData(startDate, endDate, status);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const columnset = [
    { Header: "LN", accessor: "ln", width: "20%", align: "center" },
    { Header: "VN/AN", accessor: "vnan", width: "5%", align: "center" },
    { Header: "datetime", accessor: "datetime", width: "15%", align: "center" },
    { Header: "hn", accessor: "hn", width: "7%", align: "center" },
    { Header: "owner", accessor: "owner", align: "center" },
    { Header: "doctor", accessor: "doctor", align: "center" },
    { Header: "status", accessor: "status", align: "center" },
    {
      Header: "Actions",
      accessor: "actions",
      width: "10%",
      align: "center",
      Cell: ({ row }) => (
        <Box display="flex" justifyContent="center">
          <IconButton color="primary" onClick={() => handleView(row)}>
            <SearchIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleEdit(row)}>
            <ExitToApp />
          </IconButton>
        </Box>
      ),
    },
  ];

  const statuslist = [
    "ทั้งหมด",
    "รอรับส่งสั่งตรวจ",
    "ตรวจแลบ",
    "ทราบผลแลบแล้ว",
    "ยกเลิกการตรวจ",
  ];

  const handleClose = () => {
    setOpen(false);
  };

  const handleView = (row) => {
    console.log('View row:', row);
    // Implement the view action here
  };

  const handleEdit = (row) => {
    console.log('Edit row:', row);
    // Implement the edit action here
  };

  const handleFormOpen = () => {
    setSelectedItems([]); // Reset selected items
    setFormOpen(true);
  };

  const handleFormClose = (event, reason) => {
    if (reason && reason === "backdropClick") return;
    setFormOpen(false);
  };

  const handleFormSubmit = () => {
    console.log('Selected items:', selectedItems);
    setFormOpen(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        LAB ใน
      </Typography>
      <MDBox mt={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} lg={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="วันที่เริ่ม"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} lg={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="ถึงวันที่"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} lg={3}>
            <Autocomplete
              defaultValue="ทั้งหมด"
              options={statuslist}
              renderInput={(params) => (
                <FormField
                  {...params}
                  label="สถานะ"
                  InputLabelProps={{ shrink: true }}
                />
              )}
              onChange={(event, newValue) => setStatus(newValue)}
            />
          </Grid>
          <Grid item xs={12} lg={3}>
            <Box display="flex" justifyContent="flex-end">
              <HistoryButton startIcon={<HistoryIcon />} onClick={handleHistoryClick}>
                ประวัติการตรวจ LAB
              </HistoryButton>
            </Box>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox mt={3}>
        <Grid container spacing={1} justifyContent="flex-end">
          <Grid item>
            <AddButton startIcon={<AddIcon />} onClick={handleFormOpen}>
              เพิ่ม LAB ตรวจ
            </AddButton>
          </Grid>
        </Grid>
      </MDBox>

      <TableContainerStyled component={Card}>
        <DataTable
          table={{ columns: columnset, rows: rowsData }}
          canSearch
          canFilter={true}
          entriesPerPage={true}
          showTotalEntries={true}
        />
      </TableContainerStyled>

      <Dialog 
        open={formOpen} 
        onClose={handleFormClose} 
        fullWidth 
        maxWidth="lg"
        disableEscapeKeyDown
      >
        <DialogTitle>เพิ่ม Lab</DialogTitle>
        <DialogContent>
          <LabForm selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormSubmit} color="primary">
            ตกลง
          </Button>
          <Button onClick={handleFormClose} color="secondary">
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

LabFilterAndTable.propTypes = {
  row: PropTypes.object, // Validate the row prop
};

export default LabFilterAndTable;
