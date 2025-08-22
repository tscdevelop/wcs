import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Card,
    IconButton,

    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Settings as SettingsIcon, QrCode as QrCodeIcon, Print as PrintIcon } from "@mui/icons-material";
import MDButton from "components/MDButton"; // ✅ เพิ่มบรรทัดนี้
/**
 * ReusableDataTable
 * A flexible, reusable table component with:
 *  - Dynamic columns
 *  - Client-side sorting
 *  - Client-side pagination + page-size selector ("entries per page")
 *  - Optional actions column (edit/delete/settings/print/barcode) with callbacks
 *  - Custom cell rendering via `renderCell` or `valueGetter`
 *
 * Props:
 *  - columns: Array<{
 *      field: string,
 *      label?: string,          // Header label
 *      align?: 'left'|'center'|'right',
 *      sortable?: boolean,           // default true
 *      minWidth?: number,            // CSS px
 *      flex?: number,                // for responsive width
 *      valueGetter?: (row) => any,   // compute value from row
 *      renderCell?: (value, row) => ReactNode
 *    }>
 *  - rows: Array<object>
 *  - idField?: string                // unique key field; defaults to 'id' or fallback index
 *  - pageSizeOptions?: number[]      // default [10, 25, 50, 100]
 *  - defaultPageSize?: number        // default 10
 *  - stickyHeader?: boolean          // default true
 *  - density?: 'compact'|'standard'  // row height preset
 *  - showActions?: boolean | string[] // true to show all; array to include subset e.g. ['edit','delete']
 *  - onEdit?: (row) => void
 *  - onDelete?: (row) => void
 *  - onSettings?: (row) => void
 *  - onPrint?: (row) => void
 *  - onBarcode?: (row) => void
 */
export default function ReusableDataTable({
    columns,
    rows,
    idField = "id",
    pageSizeOptions = [10, 25, 50, 100],
    defaultPageSize = 10,
    stickyHeader = true,
    density = "standard",
    showActions = false,
    onEdit,
    onDelete,
    onSettings,
    onPrint,
    onBarcode,

    // ✅ ตัวเลือกใหม่
    actionsVariant = "icons", // "icons" | "buttons" | "both"
    extraActionButtons = [],  // [{label, color, onClick:(row)=>void}] ปุ่มเสริม
}) {
    // ---- local state ----
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
    const [orderBy, setOrderBy] = useState(null); // field
    const [order, setOrder] = useState("asc"); // 'asc' | 'desc'

    // Normalize actions list
    const actionsList = useMemo(() => {
        if (!showActions) return [];
        const all = ["edit", "delete", "settings", "print", "barcode" ,"stop","confirm"];
        return Array.isArray(showActions) ? all.filter((a) => showActions.includes(a)) : all;
    }, [showActions]);

    // ทำให้ rows ปลอดภัยเป็นอาเรย์เสมอ
    const safeRows = useMemo(() => {
        if (Array.isArray(rows)) return rows;
        if (rows && Array.isArray(rows.items)) return rows.items; // เผื่อ API คืน { items: [...] }
        if (rows && Array.isArray(rows.data)) return rows.data;   // เผื่อ API คืน { data: [...] }
        console.warn("ReusableDataTable: `rows` is not an array. Received:", rows);
        return [];
    }, [rows]);


    const getRowId = (row, index) => (row?.[idField] ?? index);

    // Sorting utils
    const getValue = (row, col) => {
        if (col.valueGetter) return col.valueGetter(row);
        return row?.[col.field];
    };

    const sortedRows = useMemo(() => {
        if (!orderBy) return safeRows;
        const col = columns.find((c) => c.field === orderBy);
        if (!col) return safeRows;
        const arr = [...safeRows];
        arr.sort((a, b) => {
            const va = getValue(a, col);
            const vb = getValue(b, col);
            if (va == null && vb == null) return 0;
            if (va == null) return order === "asc" ? -1 : 1;
            if (vb == null) return order === "asc" ? 1 : -1;
            if (typeof va === "number" && typeof vb === "number") {
                return order === "asc" ? va - vb : vb - va;
            }
            const sa = String(va).toLowerCase();
            const sb = String(vb).toLowerCase();
            if (sa < sb) return order === "asc" ? -1 : 1;
            if (sa > sb) return order === "asc" ? 1 : -1;
            return 0;
        });
        return arr;
    }, [safeRows, columns, orderBy, order]);

    const pagedRows = useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return sortedRows.slice(start, end);
    }, [sortedRows, page, rowsPerPage]);

    const handleSort = (field, sortable = true) => {
        if (!sortable) return;
        if (orderBy === field) {
            setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setOrderBy(field);
            setOrder("asc");
        }
    };


    // ✅ เรนเดอร์ส่วน Actions เป็น “ไอคอน/ปุ่ม/ทั้งคู่”
    const renderActions = (row) => {
        const showIcons = actionsVariant === "icons" || actionsVariant === "both";
        const showButtons = actionsVariant === "buttons" || actionsVariant === "both";

        return (
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} flexWrap="wrap">
                {showIcons && (
                    <>
                        {actionsList.includes("edit") && (
                            <Tooltip title="Edit">
                                <span>
                                    <IconButton size="small" onClick={() => onEdit?.(row)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {actionsList.includes("delete") && (
                            <Tooltip title="Delete">
                                <span>
                                    <IconButton size="small" onClick={() => onDelete?.(row)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {actionsList.includes("settings") && (
                            <Tooltip title="Settings">
                                <span>
                                    <IconButton size="small" onClick={() => onSettings?.(row)}>
                                        <SettingsIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {actionsList.includes("print") && (
                            <Tooltip title="Print">
                                <span>
                                    <IconButton size="small" onClick={() => onPrint?.(row)}>
                                        <PrintIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {actionsList.includes("barcode") && (
                            <Tooltip title="Barcode">
                                <span>
                                    <IconButton size="small" onClick={() => onBarcode?.(row)}>
                                        <QrCodeIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {actionsList.includes("stop") && (
                            <Tooltip title="Stop">
                                <span>
                                    <MDButton
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => console.log("Approve row:", row)}
                                    >
                                        Stop
                                    </MDButton>
                                </span>
                            </Tooltip>
                        )}
                        {actionsList.includes("confirm") && (
                            <Tooltip title="Confirm">
                                <span>
                                    <MDButton
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => console.log("Approve row:", row)}
                                    >
                                        Confirm
                                    </MDButton>
                                </span>
                            </Tooltip>
                        )}

                    </>
                )}

                {showButtons && (
                    <>
                        {actionsList.includes("edit") && (
                            <MDButton size="small" color="dark" onClick={() => onEdit?.(row)}>
                                Edit
                            </MDButton>
                        )}
                        {actionsList.includes("delete") && (
                            <MDButton size="small" color="error" onClick={() => onDelete?.(row)}>
                                Delete
                            </MDButton>
                        )}
                        {actionsList.includes("settings") && (
                            <MDButton size="small" color="info" onClick={() => onSettings?.(row)}>
                                Settings
                            </MDButton>
                        )}
                        {actionsList.includes("print") && (
                            <MDButton size="small" onClick={() => onPrint?.(row)}>
                                Print
                            </MDButton>
                        )}
                        {actionsList.includes("barcode") && (
                            <MDButton size="small" onClick={() => onBarcode?.(row)}>
                                Barcode
                            </MDButton>
                        )}
                    </>
                )}

                {/* ✅ ปุ่มเสริมที่ส่งเข้ามาเอง */}
                {extraActionButtons.map((btn, i) => (
                    <MDButton
                        key={i}
                        size="small"
                        color={btn.color || "dark"}
                        onClick={() => btn.onClick?.(row)}
                    >
                        {btn.label}
                    </MDButton>
                ))}
            </Box>
        );
    };

    return (
        <Card variant="outlined" sx={{ overflow: "hidden", borderRadius: 0 }}>
            {/* Top controls: entries-per-page */}


            <TableContainer sx={{ maxHeight: 640, borderRadius: 0 }}>
                <Table stickyHeader={stickyHeader} size={density === "compact" ? "small" : "medium"}>
                    <TableHead style={{ display: "table-header-group" }}>
                        <TableRow>
                            {columns.map((col) => {
                                const sortable = col.sortable !== false;
                                const active = orderBy === col.field;
                                return (
                                    <TableCell
                                        key={col.field}
                                        onClick={() => handleSort(col.field, sortable)}
                                        sx={{
                                            cursor: sortable ? "pointer" : "default",
                                            minWidth: col.minWidth,
                                            fontWeight: 600,
                                            backgroundColor: "#fff", // ✅ พื้นหลังสีขาว
                                            color: "#757575",        // ✅ ตัวหนังสือสีเทา
                                        }}
                                        align={col.align || "left"}
                                    >
                                        <Box display="inline-flex" alignItems="center" gap={0.5}>
                                            {col.label ?? col.field}
                                            {sortable && (
                                                <Box component="span" sx={{ opacity: active ? 1 : 0.3 }}>
                                                    {active ? (order === "asc" ? "▲" : "▼") : "↕"}
                                                </Box>
                                            )}
                                        </Box>
                                    </TableCell>
                                );
                            })}

                            {actionsList.length > 0 && (
                                <TableCell
                                    align="center"
                                    sx={{
                                        width: 160,
                                        fontWeight: 600,
                                        backgroundColor: "#fff", // ✅ พื้นหลังสีขาว
                                        color: "#757575",        // ✅ ตัวหนังสือสีเทา
                                    }}
                                >
                                    Actions
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {pagedRows.map((row, idx) => (
                            <TableRow hover key={getRowId(row, idx)}>
                                {columns.map((col) => {
                                    const value = getValue(row, col);
                                    return (
                                        <TableCell key={col.field} align={col.align || "left"}>
                                            {col.renderCell ? col.renderCell(value, row) : value}
                                        </TableCell>
                                    );
                                })}

                                {actionsList.length > 0 && (
                                    <TableCell align="center">{renderActions(row)}</TableCell>
                                )}
                            </TableRow>
                        ))}

                        {safeRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actionsList.length > 0 ? 1 : 0)}>
                                    <Typography variant="body2" color="text.secondary" align="center">
                                        No data
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Bottom pagination */}
            <TablePagination
                component="div"
                count={safeRows.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={pageSizeOptions}
                labelDisplayedRows={({ from, to, count }) => `Showing ${from} to ${to} of ${count} entries`}
            />
        </Card>
    );
}

ReusableDataTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            field: PropTypes.string.isRequired,
            label: PropTypes.string,
            align: PropTypes.oneOf(["left", "center", "right"]),
            sortable: PropTypes.bool,
            minWidth: PropTypes.number,
            flex: PropTypes.number,
            valueGetter: PropTypes.func,
            renderCell: PropTypes.func,
        })
    ).isRequired,
    rows: PropTypes.array.isRequired,
    idField: PropTypes.string,
    pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
    defaultPageSize: PropTypes.number,
    stickyHeader: PropTypes.bool,
    density: PropTypes.oneOf(["compact", "standard"]),
    showActions: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.arrayOf(
            PropTypes.oneOf(["edit", "delete", "settings", "print", "barcode"])
        ),
    ]),
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onSettings: PropTypes.func,
    onPrint: PropTypes.func,
    onBarcode: PropTypes.func,

    // ✅ ใหม่
    actionsVariant: PropTypes.oneOf(["icons", "buttons", "both"]),
    extraActionButtons: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            color: PropTypes.string,
            onClick: PropTypes.func,
        })
    ),
};
