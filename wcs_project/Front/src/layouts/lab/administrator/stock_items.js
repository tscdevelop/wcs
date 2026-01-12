import React, { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
import { Card, Grid, InputAdornment } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import SweetAlertComponent from "../components/sweetAlert";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
// import TableComponent from "../components/table_component";
import MDTypography from "components/MDTypography";
import StockItemsAPI from "api/StockItemsAPI";
// import { GlobalVar } from "../../../common/GlobalVar";
import ReusableDataTable from "../components/table_component_v2";
import MDButton from "components/MDButton";
import ItemsFormDialog from "./stock_items_form";
import MDInput from "components/MDInput";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const StockItemsData = () => {
    const [loading , setLoading] = useState(true);
    const [deleteItems, setDeleteItems] = useState(""); // รหัสที่จะลบ
    const [confirmAlert, setConfirmAlert] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: "",
    });
    const [itemsList, setItemsList] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchItems, setSearchItems] = useState({ date: "", time: "" });

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create"); // "create" | "edit"
    const [editingItems, setEditingItems] = useState(null);

    const fetchDataAll = async () => {
        try {
        const response = await StockItemsAPI.getAll();

        const list = Array.isArray(response?.data) ? response.data : [];
        setItemsList(list);
        } catch (error) {
        console.error("Error fetching data: ", error);
        setItemsList([]);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataAll();
    }, []);

    // --- Filter Logic ---
    useEffect(() => {
        const filtered = itemsList.filter(
        (item) =>
            (item.requested_at || "").includes(searchItems.date) &&
            (item.requested_at || "").includes(searchItems.time)
        );
        setFilteredItems(filtered);
    }, [itemsList, searchItems]);

    const handleAdd = () => {
        setFormMode("create");
        setEditingItems(null);
        setFormOpen(true);
    };

    const fetchDataById = async (item_id) => {
        try {
        const response = await StockItemsAPI.getByID(item_id);
        if (response.isCompleted) {
            const data = response.data;
            setEditingItems({
            item_id: data.item_id,
            stock_item: data.stock_item,
            item_name: data.item_name,
            item_desc: data.item_desc ?? "",
            item_img: data.item_img ?? "",
            item_img_url: data.item_img_url ?? "",
            });
            setFormOpen(true); // เปิดฟอร์มหลังได้ข้อมูล
        } else {
            console.error("Failed to fetch stock items:", response.message);
        }
        } catch (error) {
        console.error("Error fetching stock items by id:", error);
        }
    };

    const handleEditClick = (row) => {
        setFormMode("edit");
        fetchDataById(row.item_id); // ใช้ item_id ดึงข้อมูล
    };

    const handleSubmitUser = async (payload) => {
        try {

        let res;
        if (formMode === "edit") {
            res = await StockItemsAPI.update(editingItems.item_id, payload);
        } else {
            res = await StockItemsAPI.create(payload);
        }

        if (res?.isCompleted) {
            setAlert({
            show: true,
            type: "success",
            title: formMode === "edit" ? "Updated" : "Created",
            message: res.message,
            });
            await fetchDataAll();
            return true;
        } else {
            setAlert({
            show: true,
            type: "error",
            title: "Error",
            message: res?.message || "Failed",
            });
            return false;
        }
        } catch (err) {
        console.error("Error in handleSubmitUser:", err);
        return false;
        }
    };

    const handleDelete = async () => {
        try {
        const response = await StockItemsAPI.delete(deleteItems);
        if (response.isCompleted) {
            setAlert({
            show: true,
            type: "success",
            title: "Success",
            message: response.message,
            });
            await fetchDataAll();
        } else {
            setAlert({
            show: true,
            type: "error",
            title: "Error",
            message: response.message,
            });
        }
        } catch (error) {
        console.error("Error during submit:", error);
        } finally {
        setConfirmAlert(false); // ซ่อน SweetAlert ยืนยัน
        }
    };

    const columns = [
        { field: "stock_item", label: "Stock Item ID" },
        { field: "item_name", label: "Stock Item Name" },
        { field: "item_desc", label: "Stock Item Description" },
    ];

    return (
        <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={2}>
            <MDBox mt={2}>
            <MDTypography variant="h3" color="inherit">
                Stock Items Data
            </MDTypography>
            </MDBox>
        </MDBox>

        <MDBox mt={3}>
            <Card>
            <MDBox mt={3} p={3}>
                <Grid container spacing={1} mb={1}>
                <Grid item xs={3}>
                    <MDTypography variant="h6">Date</MDTypography>
                    <MDInput
                    placeholder="dd/mm/yyyy"
                    value={searchItems.date}
                    onChange={(e) => setSearchItems({ ...searchItems, date: e.target.value })}
                    InputProps={{
                        endAdornment: (
                        <InputAdornment position="end">
                            <CalendarMonthIcon fontSize="small" />
                        </InputAdornment>
                        ),
                    }}
                    />
                </Grid>
                <Grid item xs={3}>
                    <MDTypography variant="h6">Time</MDTypography>
                    <MDInput
                    placeholder="-- : --"
                    value={searchItems.time}
                    onChange={(e) => setSearchItems({ ...searchItems, time: e.target.value })}
                    InputProps={{
                        endAdornment: (
                        <InputAdornment position="end">
                            <AccessTimeIcon fontSize="small" />
                        </InputAdornment>
                        ),
                    }}
                    />
                </Grid>
                </Grid>
                <MDBox mb={5} display="flex" justifyContent="flex-end">
                <MDButton color="dark" onClick={handleAdd}>
                    Create
                </MDButton>
                </MDBox>
                {loading ? (
  <div>Loading...</div>
) : (
                <ReusableDataTable
                columns={columns}
                rows={filteredItems}
                idField="item_id"
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50]}
                showActions={["edit", "delete"]}
                onEdit={(row) => handleEditClick(row)}
                onDelete={(row) => {
                    setDeleteItems(row.item_id);
                    setConfirmAlert(true);
                }}
                />
            )}
            </MDBox>
            </Card>
        </MDBox>

        {/* Pop-up */}
        <ItemsFormDialog
            open={formOpen}
            mode={formMode}
            initialData={editingItems}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmitUser}
        />

        {confirmAlert && (
            <SweetAlertComponent
            type="error"
            title="Confirm Deletion"
            message="Are you sure you want to delete this data?"
            show={confirmAlert}
            showCancel
            confirmText="OK"
            cancelText="Cancel"
            onConfirm={handleDelete}
            onCancel={() => setConfirmAlert(false)}
            />
        )}
        <SweetAlertComponent
            show={alert.show}
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onConfirm={() => setAlert({ ...alert, show: false })}
        />
        </DashboardLayout>
    );
    };
export default StockItemsData;
