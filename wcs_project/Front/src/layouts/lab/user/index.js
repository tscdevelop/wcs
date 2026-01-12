import React, { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
import { Card } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import SweetAlertComponent from "../components/sweetAlert";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
import { useNavigate } from "react-router-dom"; // นำเข้า Link และ useNavigate สำหรับการจัดการ routing
// import TableComponent from "../components/table_component";
import MDTypography from "components/MDTypography";
import UserApi from "api/UserAPI";
// import { GlobalVar } from "../../../common/GlobalVar";
import ReusableDataTable from "../components/table_component_v2";
import MDButton from "components/MDButton";
import UserFormDialog from "./user_form";

const User = () => {
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [userAll, setUserAll] = useState([]);
    const [deleteUser, setDeleteUser] = useState(""); // รหัสโรงงานที่จะลบ
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();
    const [confirmAlert, setConfirmAlert] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: "",
    });

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create"); // "create" | "edit"
    const [editingUser, setEditingUser] = useState(null);

    const fetchDataAll = async () => {
        try {
            const response = await UserApi.searchUser();
            if (response?.isCompleted) {
                setUserAll(response.data);
            } else {
                console.error("API response error: ", response?.message);
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataAll();
    }, []);

    const handleAdd = () => {
        setFormMode("create");
        setEditingUser(null);
        setFormOpen(true);
    };


    const fetchDataById = async (user_id) => {
        try {
            const response = await UserApi.getUserDataById(user_id);
            console.log("User By ID: ", response);
            if (response.isCompleted) {
                const data = response.data;
                setEditingUser({
                    user_id: data.user_id,
                    user_first_name: data.user_first_name ?? "",
                    user_last_name: data.user_last_name ?? "",
                    username: data.username ?? "",
                    user_email: data.user_email ?? "",
                    role_code: data.role_code ?? "",
                    mc_code: data.mc_code ?? ""
                });
                setFormOpen(true); // เปิดฟอร์มหลังได้ข้อมูล
            } else {
                console.error("Failed to fetch user:", response.message);
            }
        } catch (error) {
            console.error("Error fetching user by id:", error);
        }
    };

    const handleEditClick = (row) => {
        setFormMode("edit");
        fetchDataById(row.user_id); // ใช้ user_id ดึงข้อมูล
    };


    const handleSubmitUser = async (payload) => {
        try {
            // ✅ normalize mc_code ให้เป็น array เสมอ
            const normalizedPayload = {
                ...payload,
                mc_code: Array.isArray(payload.mc_code)
                    ? payload.mc_code
                    : payload.mc_code
                        ? [payload.mc_code]
                        : [], // กรณีไม่เลือกอะไร
            };

            let res;
            if (formMode === "edit") {
                res = await UserApi.updateUser(
                    editingUser.user_id,
                    normalizedPayload
                );
            } else {
                res = await UserApi.createUser(normalizedPayload);
            }
            if (res?.isCompleted) {
                setAlert({
                    show: true,
                    type: "success",
                    title: formMode === "edit" ? "Updated" : "Created",
                    message: res.message,
                });
                await fetchDataAll(); // refresh table
                return true; // ให้ dialog ปิด
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
            setAlert({
                show: true,
                type: "error",
                title: "Error",
                message: "Unexpected error",
            });
            return false;
        }
    };


    const handleDelete = async () => {
        try {
            const response = await UserApi.deleteUser(deleteUser);
            if (response.isCompleted) {
                setAlert({
                    show: true,
                    type: "success",
                    title: "ลบสำเร็จ",
                    message: response.message,
                });
                await fetchDataAll();
            } else {
                setAlert({
                    show: true,
                    type: "error",
                    title: "ลบไม่สำเร็จ",
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
        { field: "username", label: "Username" },
        { field: "fullname", label: "Full Name" },
        { field: "user_email", label: "Email" },
        { field: "role_code", label: "Role" },
        { field: "mc_code", label: "Maintenance Contract"}
    ];


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox p={2}>
                <MDBox mt={2} >
                    <MDTypography variant="h3" color="inherit">
                        User Management
                    </MDTypography>
                </MDBox>
            </MDBox>

            <MDBox mt={5}>
                <Card>
                    <MDBox mt={3} p={3}>
                        <MDBox mb={5} display="flex" justifyContent="flex-end">

                            <MDButton
                                color="dark"
                                onClick={handleAdd}
                            >
                                Create
                            </MDButton>
                        </MDBox>
                        <ReusableDataTable
                            columns={columns}
                            rows={userAll}
                            idField="user_id"
                            defaultPageSize={10}
                            pageSizeOptions={[10, 25, 50]}
                            showActions={["edit", "delete"]}
                            onEdit={(row) => handleEditClick(row)}
                            onDelete={(row) => {
                                setDeleteUser(row.user_id);
                                setConfirmAlert(true);
                            }}

                        />
                    </MDBox>
                </Card>
            </MDBox>

            {/* Pop-up */}
            <UserFormDialog
                open={formOpen}
                mode={formMode}
                initialData={editingUser}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmitUser}
            />

            {confirmAlert && (
                <SweetAlertComponent
                    type="error"
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this user?"
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
export default User;