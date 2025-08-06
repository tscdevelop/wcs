// import React, { useState } from "react";
// import PropTypes from "prop-types";
// import {
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Checkbox,
//   useMediaQuery,
// } from "@mui/material";
// import MDTypography from "components/MDTypography";
// import MDInput from "components/MDInput";

// const DynamicTableComponent = ({ columns, data, onRowSelectionChange, onRowChange }) => {
//   const [selectedRows, setSelectedRows] = useState([]);
//   const isTablet = useMediaQuery("(max-width: 768px)");

//   const handleSelectRow = (row) => {
//     const newSelectedRows = selectedRows.includes(row.bom_id)
//       ? selectedRows.filter((id) => id !== row.bom_id)
//       : [...selectedRows, row.bom_id];

//     setSelectedRows(newSelectedRows);
//     onRowSelectionChange(newSelectedRows); // Notify parent of selection change
//   };

//   const handleInputChange = (row, field, value) => {
//     if (value === "") {
//       onRowChange(row, field, value);
//       return;
//     }

//     const numericValue = Number(value);
//     if (isNaN(numericValue) || numericValue < 0) return; // Prevent non-numeric or negative numbers

//     onRowChange(row, field, numericValue);
//   };

//   return (
//     <TableContainer>
//       <Table
//         style={{
//           borderCollapse: "collapse",
//           tableLayout: isTablet ? "auto" : "fixed",
//           width: "100%",
//         }}
//       >
//         <TableHead
//           style={{
//             display: "table-header-group",
//           }}
//         >
//           <TableRow style={{ backgroundColor: "#F2B600", height: "60px" }}>
//             <TableCell align="center">
//               <MDTypography variant="body02" color="inherit">
//                 Select
//               </MDTypography>
//             </TableCell>
//             {columns.map((col) => (
//               <TableCell key={col.field} align="center">
//                 <MDTypography variant="body02" color="inherit">
//                   {col.label}
//                 </MDTypography>
//               </TableCell>
//             ))}
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {data.map((row, index) => (
//             <TableRow key={row.bom_id || index}>
//               <TableCell align="center">
//                 <Checkbox
//                   checked={selectedRows.includes(row.bom_id)}
//                   onChange={() => handleSelectRow(row)}
//                 />
//               </TableCell>
//               {columns.map((col) => (
//                 <TableCell
//                   key={col.field}
//                   align={isTablet ? "left" : "center"}
//                   style={{
//                     whiteSpace: isTablet ? "normal" : "nowrap",
//                     overflow: isTablet ? "visible" : "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {col.render ? (
//                     col.render(row, (value) =>
//                       handleInputChange(row, col.field, value)
//                     )
//                   ) : (
//                     row[col.field] ?? "-"
//                   )}
//                 </TableCell>
//               ))}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// DynamicTableComponent.propTypes = {
//   columns: PropTypes.arrayOf(
//     PropTypes.shape({
//       field: PropTypes.string.isRequired,
//       label: PropTypes.string.isRequired,
//       render: PropTypes.func,
//     })
//   ).isRequired,
//   data: PropTypes.arrayOf(PropTypes.object).isRequired,
//   onRowSelectionChange: PropTypes.func.isRequired,
//   onRowChange: PropTypes.func.isRequired, // เพิ่ม prop นี้
// };

// export default DynamicTableComponent;





// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import {
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Checkbox,
//   useMediaQuery,
// } from "@mui/material";
// import MDTypography from "components/MDTypography";


// const DynamicTableComponent = ({
//   columns,
//   data,
//   preselectedRows,
//   onRowSelectionChange,
//   onRowChange,
// }) => {
//   const [selectedRows, setSelectedRows] = useState([]);
//   const isTablet = useMediaQuery("(max-width: 768px)");

//   // ตั้งค่า checked เริ่มต้นตาม preselectedRows ที่ส่งมาจาก parent
//   useEffect(() => {
//     if (preselectedRows && preselectedRows.length > 0) {
//       setSelectedRows(preselectedRows);
//     }
//   }, [preselectedRows]);

//   // ฟังก์ชันจัดการเวลาแก้ไขจำนวน
//   const handleInputChange = (row, field, value) => {
//     if (value === "") {
//       onRowChange(row, field, value);
//       return;
//     }
//     const numericValue = Number(value);
//     if (isNaN(numericValue) || numericValue < 0) return;
//     onRowChange(row, field, numericValue);
//   };

//   // ฟังก์ชันจัดการการเช็ก / ยกเลิกเช็ก แถว โดยอิงตาม inbfg_id
//   const handleSelectRow = (inbfg_id) => {
//     const newSelectedRows = selectedRows.includes(inbfg_id)
//       ? selectedRows.filter((id) => id !== inbfg_id) // ถ้าเช็กอยู่แล้ว -> ยกเลิก
//       : [...selectedRows, inbfg_id]; // ถ้ายังไม่เคยเช็ก -> เพิ่ม

//     setSelectedRows(newSelectedRows);           // อัปเดต state ภายใน component
//     onRowSelectionChange(inbfg_id);             // ส่งค่ากลับไปแจ้ง parent
//   };

//   return (
//     <TableContainer>
//       <Table
//         style={{
//           borderCollapse: "collapse",
//           tableLayout: isTablet ? "auto" : "fixed",
//           width: "100%",
//         }}
//       >
//         <TableHead style={{ display: "table-header-group" }}>
//           <TableRow style={{ backgroundColor: "#F2B600", height: "60px" }}>
//             <TableCell align="center">
//               <MDTypography variant="body02" color="inherit">
//                 Select
//               </MDTypography>
//             </TableCell>
//             {columns.map((col) => (
//               <TableCell key={col.field} align="center">
//                 <MDTypography variant="body02" color="inherit">
//                   {col.label}
//                 </MDTypography>
//               </TableCell>
//             ))}
//           </TableRow>
//         </TableHead>

//         <TableBody>
//           {data.map((row, index) => (
//             <TableRow key={row.inbfg_id || index}>
//               {/* Checkbox */}
//               <TableCell align="center">
//                 <Checkbox
//                   checked={selectedRows.includes(row.inbfg_id)}
//                   onChange={() => handleSelectRow(row.inbfg_id)}
//                 />
//               </TableCell>

//               {/* ข้อมูลคอลัมน์ต่าง ๆ */}
//               {columns.map((col) => (
//                 <TableCell
//                   key={col.field}
//                   align={isTablet ? "left" : "center"}
//                   style={{
//                     whiteSpace: isTablet ? "normal" : "nowrap",
//                     overflow: isTablet ? "visible" : "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {col.render ? (
//                     col.render(row, (value) =>
//                       handleInputChange(row, col.field, value)
//                     )
//                   ) : (
//                     row[col.field] ?? "-"
//                   )}
//                 </TableCell>
//               ))}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// DynamicTableComponent.propTypes = {
//   columns: PropTypes.arrayOf(
//     PropTypes.shape({
//       field: PropTypes.string.isRequired,
//       label: PropTypes.string.isRequired,
//       render: PropTypes.func,
//     })
//   ).isRequired,
//   data: PropTypes.arrayOf(PropTypes.object).isRequired,
//   preselectedRows: PropTypes.arrayOf(PropTypes.any),
//   onRowSelectionChange: PropTypes.func.isRequired,
//   onRowChange: PropTypes.func.isRequired,
// };

// DynamicTableComponent.defaultProps = {
//   preselectedRows: [],
// };

// export default DynamicTableComponent;



import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  useMediaQuery,
} from "@mui/material";
import MDTypography from "components/MDTypography";

const DynamicTableComponent = ({
  columns,
  data,
  preselectedRows,
  onRowSelectionChange,
  onRowChange,
  hideSelectColumn, // เพิ่ม prop สำหรับซ่อนคอลัมน์ Select
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const isTablet = useMediaQuery("(max-width: 768px)");

  // ตั้งค่า checked เริ่มต้นตาม preselectedRows ที่ส่งมาจาก parent
  useEffect(() => {
    if (preselectedRows && preselectedRows.length > 0) {
      setSelectedRows(preselectedRows);
    }
  }, [preselectedRows]);

  // ฟังก์ชันจัดการเวลาแก้ไขจำนวน
  const handleInputChange = (row, field, value) => {
    if (value === "") {
      onRowChange(row, field, value);
      return;
    }
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) return;
    onRowChange(row, field, numericValue);
  };

  // ฟังก์ชันจัดการการเช็ก / ยกเลิกเช็ก แถว โดยอิงตาม inbfg_id
  const handleSelectRow = (inbfg_id) => {
    const newSelectedRows = selectedRows.includes(inbfg_id)
      ? selectedRows.filter((id) => id !== inbfg_id)
      : [...selectedRows, inbfg_id];

    setSelectedRows(newSelectedRows);
    onRowSelectionChange(inbfg_id);
  };

  return (
    <TableContainer
      style={{
        maxHeight: "80vh",
        overflowX: "auto", // เปิดการเลื่อนแนวนอน
        overflowY: "auto", // (ถ้าต้องการให้เลื่อนแนวตั้งด้วย)
      }}
    >
      <Table
        style={{
          borderCollapse: "collapse",
          tableLayout: "auto",
          minWidth: 800, // หรือปรับตามจำนวนคอลัมน์ที่ต้องการ
          width: "100%",
        }}
      >
        <TableHead style={{ display: "table-header-group" }}>
          <TableRow style={{ backgroundColor: "#F2B600", height: "60px" }}>
            {/* เงื่อนไขแสดงหัวตารางคอลัมน์ Select */}
            {!hideSelectColumn && (
              <TableCell align="center">
                <MDTypography variant="body02" color="inherit">
                  Select
                </MDTypography>
              </TableCell>
            )}

            {columns.map((col) => (
              <TableCell key={col.field} align="center">
                <MDTypography variant="body02" color="inherit">
                  {col.label}
                </MDTypography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.inbfg_id || index}>
              {/* เงื่อนไขแสดง Checkbox คอลัมน์ Select */}
              {!hideSelectColumn && (
                <TableCell align="center">
                  <Checkbox
                    checked={selectedRows.includes(row.inbfg_id)}
                    onChange={() => handleSelectRow(row.inbfg_id)}
                  />
                </TableCell>
              )}

              {/* คอลัมน์อื่น ๆ */}
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align={isTablet ? "center" : "center"}
                  style={{
                    whiteSpace: isTablet ? "nowrap" : "normal",
                    overflow: isTablet ? "hidden" : "visible",
                    textOverflow: isTablet ? "ellipsis" : "unset",
                  }}
                >
                  {col.render
                    ? col.render(
                      row,
                      (value) => handleInputChange(row, col.field, value),
                      selectedRows.includes(row.inbfg_id) // ✅ ส่ง isChecked เข้า render function
                    )
                    : row[col.field] ?? "-"}
                </TableCell>
              ))}

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

DynamicTableComponent.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  preselectedRows: PropTypes.arrayOf(PropTypes.any),
  onRowSelectionChange: PropTypes.func.isRequired,
  onRowChange: PropTypes.func.isRequired,

  // เพิ่ม prop สำหรับซ่อนคอลัมน์ Select
  hideSelectColumn: PropTypes.bool,
};

DynamicTableComponent.defaultProps = {
  preselectedRows: [],
  hideSelectColumn: false, // ค่าเริ่มต้นเป็น false = แสดงคอลัมน์ Select
};

export default DynamicTableComponent;

