
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
  const hiddenRoles = ["MANAGEMENT", "MANAGER", "OFFICER_PC", "OFFICER_TL"];
  const userRole = GlobalVar.getRole(); // ดึง Role ของผู้ใช้

  // รายการเมนู
  const menuItems = [
    { title: lang.msg("home.factory"), path: "/data/factory" },
    { title: lang.msg("home.warehouse"), path: "/data/warehouse" },
    { title: lang.msg("home.zone"), path: "/data/zone" },
    { title: lang.msg("home.location"), path: "/data/location" },
    { title: lang.msg("home.supplier"), path: "/data/supplier" },
    { title: lang.msg("home.transportyard"), path: "/data/dockyard" },
    { title: lang.msg("home.raw_material_setting"), path: "/data/raw" },
    { title: lang.msg("home.fg_setting"), path: "/data/finishedgood" },
    { title: lang.msg("home.semi_fg_setting"), path: "/data/semi" },
    { title: lang.msg("home.tooling_setting"), path: "/data/tooling" },
    { title: lang.msg("home.unit"), path: "/data/unit" },
    { title: lang.msg("home.criterion"), path: "/data/criterion" },
    { title: lang.msg("home.raw_info"), path: "/data/rawinfo" },
    { title: lang.msg("home.fg_info"), path: "/data/fginfo" },
    { title: lang.msg("home.semi_fg_info"), path: "/data/semifg" },
    { title: lang.msg("home.tooling_info"), path: "/data/toolinginfo" },
    { title: lang.msg("home.role"), path: "/data/role" },
  ];

  const Officer_Table = [
    { title: "ติดตามการขนส่ง", path: "/track" },
    { title: "รายการรับ Raw Material", path: "/pickupwithdraw" },
    { title: "ยืนยันการเบิก ส่งสินค้า FG", path: "/confirm" },
    { title: "ยืนยันการเบิก ส่งสินค้า Semi FG", path: "/confirmsemi" },
  ];
  const Officer_PC = [
    { title: "แจ้งเตือนอายุการเก็บรักษา (Shelf Life)", path: "/noti/notishelf" },
    { title: "แจ้งเตือนสินค้าต่ำกว่าเกณฑ์ (Minimum Stock)", path: "/noti/notimini" },
    { title: "แจ้งเตือนเครื่องมือ-อุปกรณ์", path: "/noti/notitooling" },
    { title: "ติดตามการขนส่ง", path: "/track" },
    { title: "BOM", path: "/bom" },
    { title: "รายการรับ Raw Material", path: "/pickupwithdraw" },
    { title: "Inbound Raw Material", path: "/inbound/inrawmaterial" },
    { title: "Inbound FG", path: "/inbound/inboundfg" },
    { title: "Inbound Tooling", path: "/inbound/inboundtooling" },
    { title: "Inbound Semi FG", path: "/inbound/inbsemifg" },
    { title: "outbound Raw Material", path: "/outbound/outboundraw" },
    { title: "outbound FG", path: "/outbound/outboundfg" },
    { title: "outbound Tooling", path: "/outbound/outboundtooling" },
    { title: "outbound Semi FG", path: "/outbound/outboundsemifg" },

  ];

  const Management = [
    { title: "Inventory Raw Material", path: "/inventory/invraw" },
  ];
  const Manager = [
    { title: "แจ้งเตือนอายุการเก็บรักษา (Shelf Life)", path: "/noti/notishelf"},
    { title: "แจ้งเตือนสินค้าต่ำกว่าเกณฑ์ (Minimum Stock)", path: "/noti/notimini"},
    { title: "แจ้งเตือนเครื่องมือ-อุปกรณ์", path: "/noti/notitooling"},
    { title: "แจ้งเตือนอนุมัติคำร้อง", path: "/noti/notiapprove"},
    { title: "ติดตามการขนส่ง", path: "/track"},
    { title: "BOM", path: "/bom" },
    { title: "Inbound Transaction Raw Material", path: "/inbtransaction/inbraw"},
    { title: "Inbound Transaction Semi FG", path: "/inbtransaction/inbsemi"},
    { title: "Inbound Transaction FG", path: "/inbtransaction/inbfg"},
    { title: "Inbound Transaction Tooling", path: "/inbtransaction/inbtooling"},
    { title: "Outbound Transaction เบิก Raw Material", path: "/outbtransaction/outbraw"},
    { title: "Outbound Transaction เบิก Semi FG", path: "/outbtransaction/outbsemi"},
    { title: "Outbound Transaction เบิก FG", path: "/outbtransaction/outbfg"},
    { title: "Outbound Transaction เบิก-คืน Tooling", path: "/outbtransaction/outooling"},
    { title: "Inventory Raw Material", path: "/inventory/invraw"},
    { title: "Inventory Semi FG", path: "/inventory/invsemifg"},
    { title: "Inventory FG", path: "/inventory/invfg"},
    { title: "Inventory Tooling", path: "/inventory/invtooling"},
  ];


// 🧠 Logic เพื่อเลือกเมนูตาม Role
let roleMenu = [];

if (userRole === "OFFICER_TL") {
  roleMenu = Officer_Table;
} else if (userRole === "OFFICER_PC") {
  roleMenu = Officer_PC;
} else if (userRole === "MANAGEMENT") {
  roleMenu = Management;
} else if (userRole === "MANAGER") {
  roleMenu = Manager;
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
              {lang.msg("title.menu")}
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

