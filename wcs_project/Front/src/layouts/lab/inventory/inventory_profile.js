import React, { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
import { Card, Grid, InputAdornment, Box } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import SweetAlertComponent from "../components/sweetAlert";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import StockItemsAPI from "api/StockItemsAPI";
import { GlobalVar } from "../../../common/GlobalVar";
import ReusableDataTable from "../components/table_component_v2";
import MDButton from "components/MDButton";
import ItemsFormDialog from "./inventory_profile_form";
import MDInput from "components/MDInput";
import SearchIcon from "@mui/icons-material/Search";

const InventoryProfile = () => {
    const storeType = GlobalVar.getStoreType();
    
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
    const [searchItems, setSearchItems] = useState({
        stock_item: "",
        item_name: "",
        item_desc: "",
    });

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create"); // "create" | "edit"
    const [editingItems, setEditingItems] = useState(null);

    const fetchDataAll = async () => {
        try {
            const response = await StockItemsAPI.getAll();

            const list = Array.isArray(response?.data) ? response.data : [];

            const mappedList = list.map((item) => ({
            ...item,
            item_img: item.item_img ? "Yes" : "No",
            }));

            setItemsList(mappedList);
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
            (item.stock_item || "").includes(searchItems.stock_item) &&
            (item.item_name || "").includes(searchItems.item_name) &&
            (item.item_desc || "").includes(searchItems.item_desc)
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
        { field: "stock_item", label: "Stock Item No." },
        { field: "item_name", label: "Stock Item Name" },
        { field: "item_desc", label: "Stock Item Description" },
        { field: "item_img", label: "Photo" },
    ];

    //แปลงชื่อคลัง
    let storeTypeTrans = "";

    switch (storeType) {
        case "T1":
        storeTypeTrans = "T1 Store";
        break;

        case "T1M":
        storeTypeTrans = "T1M Store";
        break;

        case "AGMB":
        storeTypeTrans = "AGMB Store";
        break;

        case "WCS":
        storeTypeTrans = "WCS";
        break;

        default:
        storeTypeTrans = storeType;
    }
    
    return (
        <DashboardLayout>
        <DashboardNavbar />
        {/* ===== Header Home ===== */}
        <MDBox p={2}>
            <Box display="flex" alignItems="baseline" gap={1}>
            {/* storeTypeTrans + underline */}
            <Box display="inline-block">
                <MDTypography variant="h3" fontWeight="bold" gutterBottom>
                {storeTypeTrans}
                </MDTypography>
                <Box
                sx={{
                    width: "100%",
                    height: "5px",
                    backgroundColor: "#FFA726",
                    borderRadius: "4px",
                }}
                />
            </Box>
            {/* Inventory Profile */}
            <MDTypography variant="h3" color="bold">
                - Inventory - Profile
            </MDTypography>
            </Box>
        </MDBox>

        {/* 🟠 ขวา : ปุ่ม (ซ้าย / ขวา) */}
        <MDBox display="flex" justifyContent="flex-end" gap={2} mb={3}>
            {/* ซ้าย : Create */}
            <MDButton variant="contained" color="info" onClick={handleAdd}>
            Create
            </MDButton>

            {/* ขวา : Import */}
            <MDButton variant="contained" color="info">
            Import
            </MDButton>
        </MDBox>

        <MDBox mt={1}>
            <Card>
            <MDBox p={3}>
                {
                <Grid container spacing={2} sx={{ mb: 0.5 }}>
                    {/* Stock Item No. */}
                    <Grid item xs={12} md={3}>
                    <MDTypography variant="caption" fontWeight="bold">
                        Stock Item No.
                    </MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchItems.stock_item}
                        onChange={(e) => setSearchItems({ ...searchItems, stock_item: e.target.value })}
                        displayEmpty
                        InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                            <SearchIcon />
                            </InputAdornment>
                        ),
                        }}
                        fullWidth
                    />
                    </Grid>
                    {/* Stock Item Name */}
                    <Grid item xs={12} md={3}>
                    <MDTypography variant="caption" fontWeight="bold">
                        Stock Item Name
                    </MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchItems.item_name}
                        onChange={(e) => setSearchItems({ ...searchItems, item_name: e.target.value })}
                        displayEmpty
                        InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                            <SearchIcon />
                            </InputAdornment>
                        ),
                        }}
                        fullWidth
                    />
                    </Grid>
                    {/* Stock Item Description */}
                    <Grid item xs={12} md={3}>
                    <MDTypography variant="caption" fontWeight="bold">
                        Stock Item Description
                    </MDTypography>
                    <MDInput
                        placeholder="Text Field"
                        sx={{ height: "45px" }}
                        value={searchItems.item_desc}
                        onChange={(e) => setSearchItems({ ...searchItems, item_desc: e.target.value })}
                        displayEmpty
                        InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                            <SearchIcon />
                            </InputAdornment>
                        ),
                        }}
                        fullWidth
                    />
                    </Grid>
                </Grid>
                }
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
export default InventoryProfile;
