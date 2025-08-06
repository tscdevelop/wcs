import React from "react";
import {
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Typography,
} from "@mui/material";
import * as lang from "utils/langHelper";

const PermissionTable = ({ permissionMenus, handleMenuChange, handleActionChange, handleSelectAllMenusChange, selectAllMenus }) => {
  const renderMenuRows = (menus) => {
    return menus.map((menu) => {
      const menuName = lang.msg(menu.menu_name); // แปลงข้อความเมนู


      
      return (
        <React.Fragment key={menu.menu_id}>
          {/* ระดับที่ 1: menu */}
          <TableRow
            style={{
              backgroundColor: "#f0f0f0",
            }}
          >
            <TableCell />
            <TableCell>
              <Typography variant="h6">{menuName}</Typography> {/* ใช้ชื่อเมนูที่แปลแล้ว */}
            </TableCell>
            <TableCell />
          </TableRow>

          {/* ระดับที่ 2: submenu ที่ไม่ใช่หัวข้อ (แสดงเป็นเมนูย่อยของ menu) */}
          {Array.isArray(menu.children) && menu.children.map((submenu) => (
            <React.Fragment key={submenu.menu_id}>
              {!submenu.isHeader && (
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={submenu.checked || false}
                      onChange={() => handleMenuChange(submenu.menu_id)}
                    />
                  </TableCell>
                  {/* เยื้องไปทางขวา */}
                  <TableCell sx={{ paddingLeft: 4 }}>
                    {lang.msg(submenu.menu_name)}
                  </TableCell> {/* แปลงข้อความเมนูย่อย */}
                  <TableCell>
                    {Array.isArray(submenu.menu_actions) && submenu.menu_actions.map((action) => {
                      const actionName = lang.msg(action.action_name); // แปลงข้อความ action
                      return (
                        <div key={action.action_code}>
                          <Checkbox
                            checked={action.checked || false}
                            onChange={() => handleActionChange(submenu.menu_id, action.action_code)}
                          />
                          {actionName}
                        </div>
                      );
                    })}
                  </TableCell>
                </TableRow>
              )}

              {/* ระดับที่ 2: submenu ที่เป็นหัวข้อ (แสดงหัวของ grandchild) */}
              {submenu.isHeader && (
                <>
                  <TableRow
                  style={{
                    backgroundColor: "#f0f0f0",
                  }}
                  >
                    <TableCell>
                    </TableCell>
                    {/* เยื้องไปทางขวาเล็กน้อย */}
                    <TableCell sx={{ paddingLeft: 4 }}>
                      <Typography variant="h6" style={{ fontWeight: "bold" }}>
                        {lang.msg(submenu.menu_name)}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>

                  {/* ระดับที่ 3: grandchild ของหัวข้อ */}
                  {Array.isArray(submenu.children) && submenu.children.map((grandchild) => (
                    <React.Fragment key={grandchild.menu_id}>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            checked={grandchild.checked || false}
                            onChange={() => handleMenuChange(grandchild.menu_id)}
                          />
                        </TableCell>
                        {/* เยื้องไปทางขวาอีก */}
                        <TableCell sx={{ paddingLeft: 8 }}>
                          {lang.msg(grandchild.menu_name)}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(grandchild.menu_actions) && grandchild.menu_actions.map((action) => {
                            const actionName = lang.msg(action.action_name); // แปลงข้อความ action
                            return (
                              <div key={action.action_code}>
                                <Checkbox
                                  checked={action.checked || false}
                                  onChange={() => handleActionChange(grandchild.menu_id, action.action_code)}
                                />
                                {actionName}
                              </div>
                            );
                          })}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </>
              )}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <TableContainer>
      <Table>
        <TableHead style={{ display: "table-header-group" }}>
          <TableRow>
            <TableCell>
              <Checkbox
                onChange={handleSelectAllMenusChange}
                checked={selectAllMenus} // ใช้ prop จาก parent เพื่อเช็คสถานะ Select All
              />
              All
            </TableCell>
            <TableCell>Menu</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderMenuRows(permissionMenus)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PermissionTable;
