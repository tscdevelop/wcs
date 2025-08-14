import React, { useState, useEffect } from "react"; // นำเข้า useState และ useEffect จาก React
import { Card } from "@mui/material"; // นำเข้า components จาก MUI (Material-UI)
import SweetAlertComponent from "../components/sweetAlert";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // นำเข้า layout component
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // นำเข้า navbar component
import MDBox from "components/MDBox";
import { useNavigate } from "react-router-dom"; // นำเข้า Link และ useNavigate สำหรับการจัดการ routing
// import TableComponent from "../components/table_component";
import MDTypography from "components/MDTypography";
import RoleAPI from "api/RoleAPI";
// import { GlobalVar } from "../../../common/GlobalVar";
import ReusableDataTable from "../components/table_component_v2";
import MDButton from "components/MDButton";

const Role = () => {
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [roleAll, setRoleAll] = useState([]);
    const [deleteRole, setDeleteRole] = useState(""); // รหัสโรงงานที่จะลบ
    const navigate = useNavigate();
    const [confirmAlert, setConfirmAlert] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        type: "success",
        title: "",
        message: "",
    });
    // useEffect(() => {
    //     const userRole = GlobalVar.getRole(); // ✅ ดึง Role จาก GlobalVar
    //     setRole(userRole);
    // }, []);
    const fetchDataAll = async () => {
        try {
            const response = await RoleAPI.searchRole();
            if (response?.isCompleted) {
                setRoleAll(response.data);
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
        navigate("/role-edit");
    };

    const handleEditClick = (role_code) => {
        navigate(`/role-edit?role_code=${encodeURIComponent(role_code)}`); // นำทางไปยังหน้า Editlabform พร้อมส่ง emp_name
    };

    const handleDelete = async () => {
        try {
            const response = await RoleAPI.deleteRole(deleteRole);
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
        { field: "role_code", label: "Role" },
        { field: "role_name", label: "Name" },
        { field: "role_description", label: "Description" },
    ];



    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox p={2}>
                <MDBox mt={2} >
                    <MDTypography variant="h3" color="inherit">
                        Permissions Management
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
                            rows={roleAll}
                            idField="role_code"
                            defaultPageSize={10}
                            pageSizeOptions={[10, 25, 50]}
                            showActions={["edit", "delete"]}
                            onEdit={(row) => handleEditClick(row.role_code)}
                            onDelete={(row) => {
                                setDeleteRole(row.role_code);
                                setConfirmAlert(true);
                            }}

                        />
                    </MDBox>
                </Card>
            </MDBox>
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
export default Role;