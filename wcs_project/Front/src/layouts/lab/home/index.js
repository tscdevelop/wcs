
import React from "react";
import { Grid, Card, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Cog from "../../../assets/images/Icon_cog.png";
import * as lang from "utils/langHelper";
import { GlobalVar } from "common/GlobalVar";

const HomePage = () => {
  const navigate = useNavigate();

  // รายการ Role ที่ไม่ต้องการให้แสดงเมนู
  const hiddenRoles = ["REQUESTER"];
  const userRole = GlobalVar.getRole(); // ดึง Role ของผู้ใช้

  // menu_route
  const menuItems = [
    { title: "MRS", path: "/store/tm-store" },
    { title: "WRS", path: "/store/t-store" },
    { title: "Orders", path: "/order/list" },
    { title: "Pick", path: "/transactions/usage" },
    { title: "Put", path: "/transactions/receipt" },
    { title: "transfer", path: "/transactions/transfer" },
    { title: "Order History", path: "/transactions/order" },
    { title: "Emergency Alert(s)", path: "/emergency"},
  ];

  //menu_route
  const Requester = [
    { title: "MRS", path: "/store/tm-store" },
    { title: "WRS", path: "/store/t-store" },
    { title: "Orders", path: "/order/list" },
    { title: "Pick", path: "/transactions/usage" },
    { title: "Put", path: "/transactions/receipt" },
    { title: "transfer", path: "/transactions/transfer" },
    { title: "Order History", path: "/transactions/order" },
    { title: "Emergency Alert(s)", path: "/emergency"}
  ];


// 🧠 Logic เพื่อเลือกเมนูตาม Role
let roleMenu = [];

if (userRole === "REQUESTER") {
  roleMenu = Requester;
} else if (!hiddenRoles.includes(userRole)) {
  roleMenu = menuItems;
}


  // 🔁 แทนที่ส่วน return เก่า ด้วยโค้ดนี้
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box p={4}>
        {/* ✅ แสดง Title ถ้าไม่อยู่ใน hiddenRoles */}
        {!hiddenRoles.includes(userRole) && (
          <>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {lang.msg("Home Page")}
            </Typography>
            <Box
              mb={2}
              sx={{
                width: "100px",
                height: "5px",
                backgroundColor: "#FFA726",
              }}
            />
          </>
        )}
  
        {/* ✅ แสดงเมนูถ้า role มีเมนู */}
        {roleMenu.length > 0 ? (
          <Grid container spacing={4} columns={{ xs: 1, sm: 2, md: 3, lg: 5 }}>
            {roleMenu.map((item, index) => (
              <Grid item xs={1} key={index}>
                <Card
                  onClick={() => navigate(item.path)}
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 2,
                    height: "200px",
                    width: "100%",
                    borderRadius: "26px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
                      transform: "scale(1.05)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={Cog}
                    alt="Menu Icon"
                    sx={{ width: "100px", height: "100px", marginBottom: 1 }}
                  />
                  <Typography variant="h5">{item.title}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box /> // ✅ ถ้าไม่มีเมนูอะไรเลย เช่น ซ่อน role
        )}
      </Box>
    </DashboardLayout>
  );
};

export default HomePage;

