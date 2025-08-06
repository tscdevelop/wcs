
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  useMediaQuery,
  TablePagination,
} from "@mui/material";
import { Edit, Delete, Print, QrCode, Settings } from "@mui/icons-material";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

const TableComponent = ({
  onFilterChange,
  columns,
  data,
  onEdit,
  onDelete,
  onBarcodeClick,
  onPrint,
  onSettings,
  idField,
  codeField,
  userField,
  searchableColumns = [],
  showActions = true,
  hiddenActions = [], // เพิ่ม prop ใหม่สำหรับซ่อน Action
  showPostActionColumn = false,  // ค่าเริ่มต้น false
  postActionColumn = null,       // ถ้าเป็น null ไม่ต้องแสดง
  actionOrder = ["edit", "delete", "print", "barcode", "settings"], //  เพิ่ม actionOrder
  userRole,
  rolePermissions = {
    ADMIN: ["edit", "delete", "print", "barcode", "settings"],
    MANAGEMENT: ["edit", "print", "barcode"],
    OFFICER_PC: ["edit", "delete", "print", "barcode", "settings"],
    OWNER: ["edit", "delete", "print", "barcode", "settings"],
  },
}) => {
  const [searchFilters, setSearchFilters] = useState(
    searchableColumns.reduce((filters, column) => ({ ...filters, [column]: "" }), {})
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isTablet = useMediaQuery("(max-width: 768px)");

  // ฟังก์ชันอัปเดตค่าค้นหาและส่งค่าออกไปยัง BOMDetails
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [name]: value };
      onFilterChange && onFilterChange(updatedFilters); // ส่งค่า filter ออกไป
      return updatedFilters;
    });
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const filteredData = data.filter((row) =>
    searchableColumns.every((field) =>
      searchFilters[field]
        ? (row[field] ?? "")
          .toString()
          .toLowerCase()
          .includes(searchFilters[field].toLowerCase())
        : true
    )
  );

  const paginatedData = filteredData.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );


  // ✅ ตรวจสอบว่า Role มีสิทธิ์ใช้ Action หรือไม่
  const hasPermission = (action) => {
    const allowedActions = rolePermissions[userRole] || [];
    return allowedActions.includes(action);
  };


  // จัดเรียง Action ตาม actionOrder
  const renderActions = (row) => {
    const actionComponents = {
      edit: (
        <IconButton
          key="edit"
          onClick={() => onEdit(row[idField], row[codeField])}
          disabled={!hasPermission("edit")}
        >
          <Edit color={hasPermission("edit") ? "primary" : "disabled"} />
        </IconButton>
      ),
      delete: (
        <IconButton key="delete" onClick={() => onDelete(row[idField])} disabled={!hasPermission("delete")}>
          <Delete color={hasPermission("delete") ? "error" : "disabled"} />
        </IconButton>
      ),
      print: (
        <IconButton key="print" onClick={() => onPrint(row[idField])} disabled={!hasPermission("print")}>
          <Print color={hasPermission("print") ? "action" : "disabled"} />
        </IconButton>
      ),
      barcode: (
        <IconButton key="barcode" onClick={() => onBarcodeClick(row[idField])} disabled={!hasPermission("barcode")}>
          <QrCode color={hasPermission("barcode") ? "action" : "disabled"} />
        </IconButton>
      ),
      settings: (
        <IconButton key="settings" onClick={() => onSettings(row[idField], row[codeField], row[userField])} disabled={!hasPermission("settings")}>
          <Settings color={hasPermission("settings") ? "action" : "disabled"} />
        </IconButton>
      ),
    };

    return actionOrder
      .filter((action) => {
        // ซ่อน edit หากสถานะอนุมัติเป็น APPROVED
        if (action === "edit" && row.outbrm_appr_status === "APPROVED") {
          return false;
        } else if (action === "edit" && row.outbfg_appr_status === "APPROVED") {
          return false;
        } else if (action === "edit" && row.outbsemi_appr_status === "APPROVED") {
          return false;
        } else if (action === "edit" && row.outbtl_appr_status === "APPROVED") {
          return false;
        }
        return !hiddenActions.includes(action);
      })
      .map((action) => hasPermission(action) && actionComponents[action]);
  };



  return (
    <>
      <TableContainer style={{ overflowX: "auto" }}>
        <Table
          style={{
            borderCollapse: "collapse",
            tableLayout: "auto",
            width: "100%",
            minWidth: columns.length > 8 ? `${columns.length * 180}px` : "100%",
          }}
        >
          {/* ------------------------ TABLE HEAD ------------------------ */}
          <TableHead style={{ display: "table-header-group" }}>
            {/* แถว 1: หัวตาราง */}
            <TableRow style={{ backgroundColor: "#F2B600", height: "60px" }}>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align="center"
                  colSpan={col.subColumns ? col.subColumns.length : 1}
                  rowSpan={col.subColumns ? 1 : 2}
                  style={{
                    fontSize: "8px",
                    width: "auto",  // ✅ เพิ่มการกำหนด width
                    maxWidth: "auto",
                    padding: "10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <MDTypography variant="h6" color="inherit">
                    {col.label}
                  </MDTypography>
                </TableCell>
              ))}

              {userRole !== "MANAGER" && showActions && (
                <TableCell
                  align="center"
                  rowSpan={2}
                  style={{
                    fontSize: "12px",
                    width: "150px",      // ✅ กำหนดความกว้างของ Action
                    maxWidth: "150px",   // ✅ จำกัดขนาดไม่ให้กว้างเกินไป
                    padding: "8px",      // ✅ ลด padding ให้ปุ่มไม่ติดกันเกินไป
                  }}
                >
                  <MDTypography variant="h6" color="inherit">
                    Action
                  </MDTypography>
                </TableCell>
              )}

              {/* ถ้า showPostActionColumn = true และมี postActionColumn ถึงจะแสดง */}
              {showPostActionColumn && postActionColumn && (
                <TableCell
                  align="center"
                  rowSpan={2}
                  style={{ fontSize: "14px", width: "auto" }}
                >
                  <MDTypography variant="h6" color="inherit">
                    {postActionColumn.label}
                  </MDTypography>
                </TableCell>
              )}
            </TableRow>

            {/* แถว 2: ถ้ามี subColumns */}
            <TableRow style={{ backgroundColor: "#F9D667" }}>
              {columns
                .filter((col) => col.subColumns)
                .flatMap((col) => col.subColumns)
                .map((subCol) => (
                  <TableCell
                    key={subCol.field}
                    align="center"
                    style={{
                      fontSize: "12px",
                      width: "auto",
                      maxWidth: "auto",
                    }}
                  >
                    <MDTypography variant="h6" color="inherit">
                      {subCol.label}
                    </MDTypography>
                  </TableCell>
                ))}
            </TableRow>

            {/* แถว 3: ช่องค้นหา */}
            <TableRow>
              {columns.map((col) =>
                col.subColumns ? (
                  col.subColumns.map((subCol) =>
                    searchableColumns.includes(subCol.field) ? (
                      <TableCell key={subCol.field} align="center">
                        <MDInput
                          name={subCol.field}
                          placeholder="ค้นหา"
                          value={searchFilters[subCol.field] || ""}
                          onChange={handleSearchChange}
                          fullWidth
                          inputProps={{ style: { fontSize: "12px" } }}
                        />
                      </TableCell>
                    ) : (
                      <TableCell key={subCol.field} align="center"></TableCell>
                    )
                  )
                ) : searchableColumns.includes(col.field) ? (
                  <TableCell key={col.field} align="center">
                    <MDInput
                      name={col.field}
                      placeholder="ค้นหา"
                      value={searchFilters[col.field] || ""}
                      onChange={handleSearchChange}
                      fullWidth
                      inputProps={{ style: { fontSize: isTablet ? "12px" : "inherit" } }}
                    />
                  </TableCell>
                ) : (
                  <TableCell key={col.field} align="center"></TableCell>
                )
              )}

              {showActions && <TableCell align="center"></TableCell>}

              {/* ช่องค้นหาในคอลัมน์หลัง Action (ถ้าต้องการ) */}
              {showPostActionColumn && postActionColumn && (
                <TableCell align="center">
                  {/* ถ้าต้องมีการค้นหาก็ใส่ MDInput ได้
                      หรือถ้าไม่ต้องการค้นหา ก็เว้นว่างไว้ */}
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          {/* ------------------------ TABLE BODY ------------------------ */}
          <TableBody>
            {paginatedData.map((row, rowIndex) => {
              const isUnread = row.notif_status === "UNREAD";
              const rowBackgroundColor = isUnread ? "#fafafa" : "#ffffff";

              return (
                <TableRow key={rowIndex} style={{ backgroundColor: rowBackgroundColor }}>
                  {columns.map((col) =>
                    col.subColumns ? (
                      col.subColumns.map((subCol) => (
                        <TableCell
                          key={subCol.field}
                          align="center"
                          style={{
                            fontSize: "8px",
                            width: "auto",
                            maxWidth: "auto",
                            padding: "10px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            ...(subCol.cellStyle ? subCol.cellStyle(row) : {}),
                          }}
                        >
                          <MDTypography variant="subtitle2" color="inherit">
                            {subCol.render ? subCol.render(row) : row[subCol.field] ?? "-"}
                          </MDTypography>
                        </TableCell>
                      ))
                    ) : (
                      <TableCell
                        key={col.field}
                        align="center"
                        style={{
                          fontSize: "12px",
                          width: "auto",
                          maxWidth: "auto",
                          padding: "10px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          ...(col.cellStyle ? col.cellStyle(row) : {}),
                        }}
                      >
                        <MDTypography variant="subtitle2" color="inherit">
                          {col.render ? col.render(row) : row[col.field] ?? "-"}
                        </MDTypography>
                      </TableCell>
                    )
                  )}

                  {userRole !== "MANAGER" && showActions && (
                    <TableCell
                      align="center"
                      style={{
                        width: "150px",
                        maxWidth: "150px",
                        padding: "4px",
                      }}
                    >
                      <MDBox display="flex" justifyContent="center" gap={0.1}>
                        {renderActions(row)}
                      </MDBox>
                    </TableCell>
                  )}

                  {showPostActionColumn && postActionColumn && (
                    <TableCell align="center">
                      {postActionColumn.render
                        ? postActionColumn.render(row)
                        : row[postActionColumn.field] ?? "-"}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>


        </Table>
      </TableContainer>

      {/* ส่วน Pagination */}
      <TablePagination
        component="div"
        count={filteredData.length}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </>
  );
};

TableComponent.propTypes = {
  onFilterChange: PropTypes.func,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      label: PropTypes.string,
      subColumns: PropTypes.arrayOf(
        PropTypes.shape({
          field: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  idField: PropTypes.string.isRequired,
  codeField: PropTypes.string,
  searchableColumns: PropTypes.arrayOf(PropTypes.string),
  showActions: PropTypes.bool,

  // เพิ่ม prop ใหม่
  showPostActionColumn: PropTypes.bool,
  postActionColumn: PropTypes.shape({
    field: PropTypes.string,
    label: PropTypes.string,
    render: PropTypes.func,
  }),
};

export default TableComponent;



