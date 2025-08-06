import React, { useEffect, useState, useRef } from "react";
import { Box, Grid, Card } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { useNavigate } from "react-router-dom";
import * as lang from "utils/langHelper";
import roleAPI from "api/RoleAPI";
import Menu from "api/MenuAPI";
import PermissionTable from "./PermissionTable"; // นำเข้า PermissionTable
import SweetAlertComponent from "../components/sweetAlert";
import ButtonComponent from "../components/ButtonComponent";

const Editrole = () => {
  const [formData, setFormData] = useState({
    role_code: "",
    emp_name: "",
    role_description: "",
    role_is_active: true,
    status: "",
    permissionMenus: [],
    selectAllMenus: false,
    selectedHospitals: [], // กำหนดค่าเริ่มต้นเป็น array ว่าง
  });

  const roleFetched = useRef(false);
  const [mode, setMode] = useState("edit");

  const searchParams = new URLSearchParams(window.location.search);
  const roleCode = searchParams.get("role_code");
  const empName = searchParams.get("emp_name");
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await Menu.getMenuAll();
        if (response.isCompleted) {
          const menus = response.data || [];

          const mapChildren = (parentMenu) => {
            const children = menus.filter((menu) => menu.parent_menu_id === parentMenu.menu_id);
            return children.map((childMenu) => ({
              ...childMenu,
              checked: false,
              isHeader: !childMenu.menu_actions?.length && !!mapChildren(childMenu).length,
              children: mapChildren(childMenu),
              menu_actions:
                childMenu.menu_actions?.map((action) => ({
                  ...action,
                  checked: false,
                })) || [],
            }));
          };

          // ค้นหาเมนูหลัก (Parent Menus)
          const parentMenus = menus.filter((menu) => menu.parent_menu_id === null);

          // ค้นหาเมนูที่ไม่มี parent และไม่มี children
          const standaloneMenus = parentMenus.filter((menu) => {
            const hasChildren = menus.some((child) => child.parent_menu_id === menu.menu_id);
            return !hasChildren; // ไม่มี children
          });

          // กำหนด "เมนูอื่นๆ"
          const otherMenu = {
            menu_id: "others", // ค่า menu_id แบบฟิก
            menu_name: "เมนูอื่นๆ", // ชื่อเมนูที่แสดงใน UI
            parent_menu_id: null,
            checked: false,
            isHeader: false,
            children: standaloneMenus.map((menu) => ({
              ...menu,
              checked: false,
              isHeader: false,
              children: [],
              menu_actions:
                menu.menu_actions?.map((action) => ({
                  ...action,
                  checked: false,
                })) || [],
            })),
            menu_actions: [],
          };

          // จัดโครงสร้างเมนูทั้งหมด
          const structuredMenus = parentMenus
            .filter((menu) => {
              // กรองเมนูหลักที่ไม่ใช่เมนู "อื่นๆ"
              const hasChildren = menus.some((child) => child.parent_menu_id === menu.menu_id);
              return hasChildren;
            })
            .map((parentMenu) => ({
              ...parentMenu,
              checked: false,
              isHeader: !parentMenu.menu_actions?.length && !!mapChildren(parentMenu).length,
              children: mapChildren(parentMenu),
            }));

          // เพิ่ม "เมนูอื่นๆ" เข้าไปในรายการเมนู
          if (otherMenu.children.length > 0) {
            structuredMenus.push(otherMenu);
          }

          // ตั้งค่าใน state
          setFormData((prev) => ({
            ...prev,
            permissionMenus: structuredMenus,
          }));
        }
      } catch (error) {
        console.error("Error fetching menu data:", error.message || error);
      }
    };

    fetchMenuData();
  }, []);

  useEffect(() => {
    if (formData.permissionMenus.length > 0 && roleCode && !roleFetched.current) {
      const fetchRoleCode = async () => {
        try {
          const response = await roleAPI.getByRoleCode(roleCode);
          if (response.isCompleted) {
            const roleInfo = response.data;

            const updateChildren = (menuChildren, rolePermissions) => {
              return menuChildren.map((child) => {
                const foundPermissionSubMenu = rolePermissions.find(
                  (perm) => perm.menu_id === child.menu_id
                );

                return {
                  ...child,
                  checked: !!foundPermissionSubMenu,
                  menu_actions:
                    child.menu_actions?.map((action) => ({
                      ...action,
                      checked:
                        foundPermissionSubMenu?.permission_actions.includes(action.action_code) ||
                        false,
                    })) || [],
                  children: child.children ? updateChildren(child.children, rolePermissions) : [],
                };
              });
            };

            setFormData((prevFormData) => {
              const updatedPermissionMenus = prevFormData.permissionMenus.map((menu) => {
                const foundPermissionMenu = roleInfo.permission_menus.find(
                  (perm) => perm.menu_id === menu.menu_id && menu.menu_level === 2
                );

                return {
                  ...menu,
                  checked: !!foundPermissionMenu && menu.menu_level !== 1,
                  children: updateChildren(menu.children || [], roleInfo.permission_menus),
                };
              });

              return {
                ...prevFormData,
                role_code: roleInfo.role_code,
                role_name: roleInfo.role_name || "",
                role_description: roleInfo.role_description || "",
                role_is_active: roleInfo.role_is_active,
                permissionMenus: updatedPermissionMenus,
              };
            });

            roleFetched.current = true;
          } else {
            console.error("Error fetching role data:", response.message);
          }
        } catch (error) {
          console.error("Error fetching role data:", error.message || error);
        }
      };

      fetchRoleCode();
    }
  }, [formData.permissionMenus, roleCode]);

  useEffect(() => {
    if (roleCode) {
      setMode("edit");
    } else {
      setMode("create");
    }
  }, [roleCode]);

  const handleSelectAllMenusChange = (event) => {
    const { checked } = event.target;

    const updateCheckedStatus = (menus) => {
      return menus.map((menu) => ({
        ...menu,
        checked: checked, // อัปเดตสถานะเช็คของเมนู
        children: menu.children ? updateCheckedStatus(menu.children) : menu.children, // ทำงานกับเมนูย่อยถ้ามี
        // ไม่อัปเดตสถานะของ menu_actions
      }));
    };

    setFormData((prevData) => ({
      ...prevData,
      permissionMenus: updateCheckedStatus(prevData.permissionMenus),
      selectAllMenus: checked,
    }));
  };

  const handleMenuChange = (menu_id) => {
    const updateCheckedStatus = (menus) => {
      return menus.map((menu) => ({
        ...menu,
        checked: menu.menu_id === menu_id ? !menu.checked : menu.checked,
        children: menu.children ? updateCheckedStatus(menu.children) : menu.children,
      }));
    };

    setFormData((prevData) => ({
      ...prevData,
      permissionMenus: updateCheckedStatus(prevData.permissionMenus),
    }));
  };

  const handleActionChange = (menu_id, action_code) => {
    const updateActionCheckedStatus = (menus) => {
      return menus.map((menu) => ({
        ...menu,
        children: menu.children ? updateActionCheckedStatus(menu.children) : menu.children,
        menu_actions:
          menu.menu_id === menu_id
            ? menu.menu_actions.map((action) =>
              action.action_code === action_code
                ? { ...action, checked: !action.checked }
                : action
            )
            : menu.menu_actions,
      }));
    };

    setFormData((prevData) => ({
      ...prevData,
      permissionMenus: updateActionCheckedStatus(prevData.permissionMenus),
    }));
  };



  const navigate = useNavigate();


  const handleCancel = () => {
    navigate("/data/role");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasSelectedMenuOrAction = (menus) => {
      return menus.some(
        (menu) =>
          menu.checked ||
          menu.menu_actions?.some((action) => action.checked) ||
          (menu.children && hasSelectedMenuOrAction(menu.children))
      );
    };

    if (!hasSelectedMenuOrAction(formData.permissionMenus)) {

      return;
    }

    const generatePermissionMenus = (menus) => {
      return menus
        .flatMap((menu) => {
          if (menu.children && menu.children.length > 0) {
            const selectedChildren = generatePermissionMenus(menu.children);
            if (selectedChildren.length > 0) {
              return [
                {
                  menu_id: menu.menu_id,
                  permission_actions: menu.menu_actions
                    ?.filter((action) => action.checked)
                    .map((action) => action.action_code),
                },
                ...selectedChildren,
              ];
            }
          } else if (menu.checked || menu.menu_actions?.some((action) => action.checked)) {
            return [
              {
                menu_id: menu.menu_id,
                permission_actions: menu.menu_actions
                  ?.filter((action) => action.checked)
                  .map((action) => action.action_code),
              },
            ];
          }
          return [];
        })
        .filter((menu) => typeof menu.menu_id === "number");
    };

    const permission_menus = generatePermissionMenus(formData.permissionMenus);

    const form = new FormData();
    form.append("role_code", formData.role_code);
    form.append("role_name", formData.role_name);
    form.append("role_description", formData.role_description);
    form.append("role_is_active", formData.role_is_active);
    form.append("permission_menus", JSON.stringify(permission_menus));

    try {
      let response;
      if (roleCode && mode === "edit") {
        response = await roleAPI.updateRole(roleCode, form);
      } else {
        response = await roleAPI.createRole(form);
      }

      if (response.isCompleted) {
        setAlert({
          show: true,
          type: "success",
          title: "ดำเนินการสำเร็จ",
          message: response.message,
        });
        setTimeout(() => {
          navigate("/data/role");
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "เกิดข้อผิดพลาด",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("❌ Error :", error.message || error);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <form onSubmit={handleSubmit}>
          <MDBox mt={2} ml={5}>
            <MDTypography variant="h4" gutterBottom>
              ตั้งค่า / การเเสดงผลเมนู
            </MDTypography>
          </MDBox>

          <Grid container spacing={2} item xs={12}>
            <Grid item xs={12}>
              <MDBox mt={2}>
                <Card>
                  <MDBox p={2}>
                    <Grid container spacing={4} alignItems="center">
                      <Grid item xs={12} md={6} lg={6}>
                        <Grid container>
                          <Grid item xs={12} sm={4} lg={3}>
                            <MDBox
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              height="100%"
                            >
                              <MDTypography variant="body02" color="inherit">
                                ชื่อ-นานสกุล
                              </MDTypography>
                            </MDBox>
                          </Grid>
                          <Grid item xs={12} sm={8} lg={9}>
                            <MDInput
                              name="empName"
                              variant="outlined"
                              value={empName}
                              onChange
                              sx={{ width: "100%", height: "auto" }}
                              disabled
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12} md={6} lg={6}>
                        <Grid container>
                          <Grid item xs={12} sm={4} lg={3}>
                            <MDBox
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              height="100%"
                            >
                              <MDTypography variant="body02" color="inherit">
                                {lang.msg("role.role_code")}
                              </MDTypography>
                            </MDBox>
                          </Grid>
                          <Grid item xs={12} sm={8} lg={9}>
                            <MDInput
                              name="role_code"
                              value={formData.role_code}
                              disabled
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  role_code: e.target.value.toUpperCase(),
                                })
                              }
                              sx={{ width: "100%", height: "auto" }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </MDBox>
                </Card>
              </MDBox>

              <Grid item xs={12}>
                <MDBox mt={2}>
                  <Card>
                    <MDBox p={2} mt={2} ml={2}>
                      <MDTypography variant="h6" gutterBottom>
                        กำหนดการเเสดงผลเมนู
                      </MDTypography>
                    </MDBox>

                    <MDBox p={2}>
                      <Grid item xs={12}>
                        <MDBox pl={25} pr={25} pt={2}>
                          <PermissionTable
                            permissionMenus={formData.permissionMenus}
                            handleMenuChange={handleMenuChange}
                            handleActionChange={handleActionChange}
                            handleSelectAllMenusChange={handleSelectAllMenusChange}
                            selectAllMenus={formData.selectAllMenus}
                          />
                        </MDBox>
                      </Grid>
                    </MDBox>
                    <Grid item xs={12}></Grid>

                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={3} p={5}>
                        <ButtonComponent type="cancel" onClick={handleCancel}>
                          {lang.btnCancel()}
                        </ButtonComponent>
                        <ButtonComponent type={mode === "add" ? "save" : "edit"} onClick={handleSubmit}>
                          {lang.btnConfirmMenu()}
                        </ButtonComponent>
                      </Box>
                    </Grid>
                  </Card>
                </MDBox>

              </Grid>

            </Grid>


          </Grid>
        </form>
      </MDBox>

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

export default Editrole;
