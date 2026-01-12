// import { useEffect, useState } from "react";

// // react-router components
// import { useLocation, useNavigate } from "react-router-dom"; // ลบ NavLink ที่ไม่ได้ใช้งาน

// // prop-types is a library for typechecking of props.
// import PropTypes from "prop-types";

// // @mui material components
// import List from "@mui/material/List";
// import Divider from "@mui/material/Divider";
// import Link from "@mui/material/Link";
// import Icon from "@mui/material/Icon";

// // Material Dashboard 2 PRO React components
// import MDBox from "components/MDBox";
// import MDTypography from "components/MDTypography";

// // Material Dashboard 2 PRO React examples
// import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
// import SidenavList from "examples/Sidenav/SidenavList";
// import SidenavItem from "examples/Sidenav/SidenavItem";

// // Custom styles for the Sidenav
// import SidenavRoot from "examples/Sidenav/SidenavRoot";
// import { GlobalVar } from "../../common/GlobalVar";
// import LogoutButton from "../../layouts/lab/components/logout_button";
// import userImg from "../../assets/images/user.jpg";
// import UserInfo from "../../layouts/lab/components/user_info";
// import UserAPI from "api/UserAPI";
// import NotificationAPI from "api/NotificationAPI";

// import Badge from "@mui/material/Badge";

// import io from "socket.io-client";
// import { BASE_URL } from "common/constants";

// const socket = io(BASE_URL);
// // Material Dashboard 2 PRO React context
// import {
//   useMaterialUIController,
//   setMiniSidenav,
//   //setTransparentSidenav,
//   //setWhiteSidenav,
// } from "context";

// function Sidenav({ color, routes, ...rest }) {
//   const [openCollapse, setOpenCollapse] = useState(false);
//   const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
//   const [controller, dispatch] = useMaterialUIController();
//   const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

//   const location = useLocation();
//   const navigate = useNavigate(); // เพิ่ม useNavigate
//   const { pathname } = location;
//   const [logoUrl, setLogoUrl] = useState(""); // สถานะสำหรับเก็บ URL ของโลโก้
//   const [userID, setUserID] = useState(null);

//   const [Username, setUsername] = useState("");
//   const [RoleCode, setRoleCoed] = useState("");
//   const profileUser = userImg;

//   //สำหรับ ดึง ข้อมูลuserID จาก API
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const storedUserID = GlobalVar.getUserId();
//         const token = GlobalVar.getToken();

//         if (storedUserID && token) {
//           setUserID(storedUserID);
//           const response = await UserAPI.getUserDataById(storedUserID);

//           if (response.isCompleted && !response.isError) {
//             setUsername(response.data.username);
//             setRoleCoed(response.data.role_code);
//           } else {
//             console.error("Failed to fetch profile data:", response.message);
//           }
//         } else {
//           console.error("No user ID or token found in localStorage");
//         }
//       } catch (error) {
//         console.error("Error fetching profile data:", error.message);
//       }
//     };

//     fetchData();
//   }, [userID]);

//   const [notificationState, setNotificationState] = useState({
//     SHELF_LIFE: 0,
//     MINIMUM_STOCK: 0,
//     TOOL_WITHDRAWAL: 0,
//     REQUEST_APPROVAL: 0,
//   });

//   useEffect(() => {
//     // 📌 โหลดข้อมูลแจ้งเตือนที่ยังไม่อ่าน (ตอนเปิดหน้าเว็บ)
//     const fetchUnreadNotifications = async () => {
//       try {
//         const res = await NotificationAPI.getUnreadNotif();
//         if (res?.isCompleted) {
//           setNotificationState(res.data); // ✅ เซ็ต state
//           localStorage.setItem("unreadNotifications", JSON.stringify(res.data));
//         } else {
//           console.warn("⚠️ Failed to fetch unread notifications:", res.message);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching unread notifications:", err);
//       }
//     };

//     fetchUnreadNotifications();

//     // 📌 รับแจ้งเตือนแบบ real-time ผ่าน WebSocket
//     socket.on("new-notification", (newNotif) => {
//       console.log("📩 New Notification Received:", newNotif);

//       setNotificationState((prev) => {
//         const updatedCount = {
//           ...prev,
//           [newNotif.notif_type]: (prev[newNotif.notif_type] || 0) + 1,
//         };

//         localStorage.setItem("unreadNotifications", JSON.stringify(updatedCount));
//         console.log("✅ Updated count after new noti:", updatedCount);
//         return updatedCount;
//       });
//     });

//     return () => {
//       socket.off("new-notification");
//     };
//   }, []);

//   const menuMapping = {
//     notishelf: "SHELF_LIFE",
//     notimini: "MINIMUM_STOCK",
//     notitooling: "TOOL_WITHDRAWAL",
//     notiapprove: "REQUEST_APPROVAL",
//   };

//   const  = (menuKey, originalIcon) => {
//     // ถ้า menuKey เป็น "noti" ให้ตรวจสอบเมนูย่อย
//     let hasNotification = false;

//     if (menuKey === "noti") {
//       hasNotification = Object.keys(menuMapping).some((subMenuKey) => {
//         const notificationType = menuMapping[subMenuKey];
//         return notificationType && (notificationState[notificationType] || 0) > 0;
//       });
//     } else {
//       const notificationType = menuMapping[menuKey];
//       hasNotification = notificationType && (notificationState[notificationType] || 0) > 0;
//       // console.log("notitype: ", notificationType, " state::::", notificationState[notificationType]);
//     }
//     //console.log("Is noti ::::::::::: ", hasNotification," key :: ", menuKey);
//     return (
//       <Badge
//         color="error"
//         variant="dot"
//         invisible={!hasNotification} // เมื่อไม่มีการแจ้งเตือน badge จะถูกซ่อน
//         overlap="circular"
//       >
//         {originalIcon}
//       </Badge>
//     );
//   };

//   // ฟังก์ชันสำหรับคลิกเมนูเพื่อส่ง state และรีเซ็ตการแจ้งเตือน
//   const handleMenuClick = (route, key, menu_id) => {
//     console.log("handleMenuClick -> menu_id :", menu_id, "rout::", route);

//     // ✅ รีเซ็ตเฉพาะแจ้งเตือนของเมนูที่คลิก
//     setNotificationState((prev) => {
//       const updatedNotifications = { ...prev };
//       if (menuMapping[key]) {
//         updatedNotifications[menuMapping[key]] = 0;
//       }
//       localStorage.setItem("unreadNotifications", JSON.stringify(updatedNotifications));
//       return updatedNotifications;
//     });

//     // ✅ นำทางไปยังหน้าเป้าหมาย
//     navigate(route, { state: { menu_id } });
//   };

//   useEffect(() => {
//     // ปิด sidenav ที่หน้าจอแคบ กว่าหรือเท่ากับ1024
//     if (window.innerWidth <= 1024){
//       setMiniSidenav(dispatch, true);
//     }
//   },[pathname]);

//   const collapseName = pathname.split("/").slice(1)[0];
//   const items = pathname.split("/").slice(1);
//   const itemParentName = items[1];
//   const itemName = items[items.length - 1];

//   let textColor = "dark";
//   if (transparentSidenav || (whiteSidenav && !darkMode)) {
//     textColor = "dark";
//   } else if (whiteSidenav && darkMode) {
//     textColor = "inherit";
//   }

//   // ดึง URL โลโก้เมื่อโหลดคอมโพเนนต์
//   useEffect(() => {
//     const fetchLogo = async () => {
//       const logo = await GlobalVar.getHospitalLogo();
//       setLogoUrl(logo);
//     };
//     fetchLogo();
//   }, []);

//   // const closeSidenav = () => setMiniSidenav(dispatch, true);
//   const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
//   useEffect(() => {
//     setOpenCollapse(collapseName);
//     setOpenNestedCollapse(itemParentName);
//   }, [collapseName, itemParentName]);

//   useEffect(() => {
//     function handleMiniSidenav() {
//       //setMiniSidenav(dispatch, window.innerWidth < 1200);
//       //setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
//       //setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
//     }

//     window.addEventListener("resize", handleMiniSidenav);

//     //handleMiniSidenav();

//     return () => window.removeEventListener("resize", handleMiniSidenav);
//   }, [dispatch, location]);

//   // const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
//   //   color: () => {
//   //     let colorValue = light || darkMode ? white.main : dark.main;

//   //     if (transparentNavbar && !light) {
//   //       colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
//   //     }

//   //     return colorValue;
//   //   },
//   // });

//   const renderHeader = () => (
//     <MDBox
//       display="flex"
//       flexDirection="column"
//       justifyContent="center"
//       alignItems="center"
//       sx={{
//         position: "relative", // ใช้สำหรับการวางตำแหน่งเส้นด้านล่าง
//         backgroundColor: "#FDC068", // สีพื้นหลังของ Header
//         height: "100px", // ปรับความสูง Header ตามต้องการ
//       }}
//     >
//       {/* Logo และ Hamburger Icon */}
//       <MDBox
//         display="flex"
//         alignItems="center"
//         justifyContent="space-between"
//         width="100%" // จัดเรียงให้ปุ่ม Hamburger และ Logo อยู่ในแกนเดียวกัน
//         px={4} // ระยะห่างด้านข้าง
//         sx={{
//           height: "80px", // ความสูงสำหรับเนื้อหาใน Header
//         }}
//       >
//         {/* Logo */}
//         <MDBox component={Link} to="/home" display="flex" alignItems="center">
//           {logoUrl && (
//             <MDBox
//               component="img"
//               src={logoUrl} // โลโก้จาก API
//               alt="Hospital Logo"
//               sx={{
//                 maxHeight: "60px",
//                 objectFit: "contain", // ปรับขนาดโลโก้ให้พอดี
//               }}
//             />
//           )}
//         </MDBox>
//         {/* Hamburger Icon */}
//         <MDBox
//           onClick={handleMiniSidenav}
//           sx={{
//             cursor: "pointer",
//             "&:hover": {
//               backgroundColor: "white",
//               borderRadius: "50%", // ให้มีความโค้งเมื่อ hover
//             },
//           }}
//         >
//           <Icon sx={{ fontSize: "30px", color: "#FFFFFF !important" }}>
//             {miniSidenav ? "menu_open" : "menu"}
//           </Icon>
//         </MDBox>
//       </MDBox>

//       {/* เส้นชิดขอบล่าง */}
//       <MDBox
//         sx={{
//           position: "absolute",
//           bottom: 0, // ชิดขอบล่าง
//           left: "50%", // ตั้งจุดเริ่มต้นให้อยู่กึ่งกลาง
//           transform: "translateX(-50%)", // เลื่อนเส้นให้อยู่ตรงกลาง
//           width: "70%", // ครอบคลุมความกว้างทั้งหมด
//           height: "3px", // ความหนาของเส้น
//           backgroundColor: "#FBB040", // สีของเส้น
//         }}
//       />
//     </MDBox>
//   );

//   // ฟังก์ชันสำหรับเรนเดอร์ nested collapse
//   const renderNestedCollapse = (collapse) => {
//     return collapse.map(({ name, route, key, href, icon, menu_id }) =>
//       href ? (
//         <Link
//           key={key}
//           href={href}
//           target="_blank"
//           rel="noreferrer"
//           sx={{
//             textDecoration: "none",
//             backgroundColor: "#FDD668",
//             color: "black",
//             "&:hover": { backgroundColor: "#FBB040" },
//           }}
//         >
//           <SidenavItem name={name} nested icon={getNotifiedIcon(key, icon)} />
//         </Link>
//       ) : (
//         <div
//           key={key}
//           style={{
//             cursor: "pointer",
//             backgroundColor: "#FDD668",
//             color: "black",
//           }}
//           onClick={() => handleMenuClick(route, key, menu_id)}
//         >
//           <SidenavItem
//             name={name}
//             active={pathname === route}
//             nested
//             // icon={getNotifiedIcon(route, icon)}
//             icon={getNotifiedIcon(key, icon)}
//             sx={{
//               backgroundColor: "#FDD668",
//               "&:hover": { backgroundColor: "#FBB040" },
//             }}
//           />
//         </div>
//       )
//     );
//   };

//   // ฟังก์ชันสำหรับเรนเดอร์ collapse หลัก
//   const renderCollapse = (collapses) => {
//     return collapses.map(({ name, collapse, route, href, key, icon, menu_id }) => {
//       let returnValue;
//       // สร้าง Array ของเมนูย่อยเพื่อใช้ตรวจสอบแจ้งเตือน
//       // const subMenuKeys = collapse ? collapse.map(sub => sub.route) : [];

//       if (collapse) {
//         returnValue = (
//           <SidenavItem
//             key={key}
//             color={color}
//             name={name}
//             active={key === itemParentName ? "isParent" : false}
//             open={openNestedCollapse === key}
//             icon={getNotifiedIcon(key, icon)} // ✅ ส่ง isParent = true และ subMenus
//             onClick={(event) => {
//               const { currentTarget } = event;

//               // ฟังก์ชันสำหรับการเปิด/ปิด nested collapse
//               if (
//                 openNestedCollapse === key &&
//                 currentTarget.classList.contains("MuiListItem-root")
//               ) {
//                 setOpenNestedCollapse(false);
//               } else {
//                 setOpenNestedCollapse(key);
//               }

//               // เรียกใช้งานฟังก์ชัน handleMenuClick ด้วย route และ menu_id
//               // handleMenuClick(route, key, menu_id);
//               // console.log("skipppppppppppppppp");
//             }}
//           >
//             {renderNestedCollapse(collapse)}
//           </SidenavItem>
//         );
//       } else {
//         returnValue = href ? (
//           <Link
//             href={href}
//             key={key}
//             target="_blank"
//             rel="noreferrer"
//             sx={{ textDecoration: "none" }}
//           >
//             <SidenavItem
//               color={color}
//               name={name}
//               active={key === itemName}
//               icon={getNotifiedIcon(key, icon)}
//             />
//           </Link>
//         ) : (
//           <div
//             key={key}
//             style={{ cursor: "pointer" }}
//             onClick={() => handleMenuClick(route, key, menu_id)}
//           >
//             <SidenavItem
//               color={color}
//               name={name}
//               active={pathname === route}
//               icon={getNotifiedIcon(key, icon)}
//             />
//           </div>
//         );
//       }
//       return <SidenavList key={key}>{returnValue}</SidenavList>;
//     });
//   };

//   // สร้างเมนู จาก Routes
//   const renderRoutes = routes.map(
//     ({ type, name, icon, title, collapse, noCollapse, key, href, route, menu_id }) => {
//       let returnValue;
//       if (type === "collapse") {
//         if (href) {
//           returnValue = (
//             <SidenavCollapse
//               key={key}
//               name={name}
//               icon={getNotifiedIcon(key, icon || <Icon>fiber_manual_record</Icon>)}
//               active={key === collapseName}
//               open={openCollapse === key}
//               onClick={() => setOpenCollapse(openCollapse === key ? false : key)}
//             >
//               {collapse ? renderCollapse(collapse) : null}
//             </SidenavCollapse>
//           );
//         } else if (noCollapse && route) {
//           returnValue = (
//             <div
//               key={key}
//               style={{ cursor: "pointer" }}
//               onClick={() => handleMenuClick(route, key, menu_id)}
//             >
//               <SidenavCollapse
//                 name={name}
//                 icon={getNotifiedIcon(key, icon || <Icon>fiber_manual_record</Icon>)}
//                 noCollapse={noCollapse}
//                 active={key === collapseName}
//               >
//                 {collapse ? renderCollapse(collapse) : null}
//               </SidenavCollapse>
//             </div>
//           );
//         } else {
//           returnValue = (
//             <SidenavCollapse
//               key={key}
//               name={name}
//               icon={getNotifiedIcon(key, icon || <Icon>fiber_manual_record</Icon>)}
//               active={key === collapseName}
//               open={openCollapse === key}
//               onClick={() => (openCollapse === key ? setOpenCollapse(false) : setOpenCollapse(key))}
//             >
//               {collapse ? renderCollapse(collapse) : null}
//             </SidenavCollapse>
//           );
//         }
//       } else if (type === "title") {
//         returnValue = (
//           <MDTypography
//             key={key}
//             color={textColor}
//             display="block"
//             variant="caption"
//             fontWeight="bold"
//             textTransform="uppercase"
//             pl={3}
//             mt={2}
//             mb={1}
//             ml={1}
//           >
//             {title}
//           </MDTypography>
//         );
//       } else if (type === "divider") {
//         returnValue = <Divider key={key} />;
//       } else if (type === "item" && route) {
//         returnValue = (
//           <div
//             key={key}
//             style={{ cursor: "pointer" }}
//             onClick={() => handleMenuClick(route, key, menu_id)}
//           >
//             <SidenavItem
//               color={color}
//               name={name}
//               active={pathname === route}
//               icon={getNotifiedIcon(key, icon || <Icon>fiber_manual_record</Icon>)}
//             />
//           </div>
//         );
//       }

//       return returnValue;
//     }
//   );

//   return (
//     <SidenavRoot
//       {...rest}
//       variant="permanent"
//       ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
//       sx={{
//         backgroundColor: "#FDC068 ", // สีพื้นหลังเหลืองอ่อน
//       }}
//     >
//       {renderHeader()} {/* เรียกใช้ฟังก์ชัน renderHeader */}
//       <List
//         sx={{
//           backgroundColor: "#FEE4A0",
//           flexGrow: 1, // ขยายให้เต็มพื้นที่ที่เหลือ
//           padding: 0, // เอาการ padding ออกเพื่อเต็มพื้นที่
//           overflow: "auto", // เลื่อนเมื่อเนื้อหาเกิน
//         }}
//       >
//         <UserInfo Username={Username} RoleCode={RoleCode} profileUser={profileUser} />
//         {renderRoutes}
//       </List>
//       <Divider
//         sx={{
//           color: "FBB040",
//           margin: 0, // เว้นระยะห่างจากเนื้อหาด้านล่าง
//         }}
//       />
//       <LogoutButton />
//     </SidenavRoot>
//   );
// }

// // Typechecking props for the Sidenav
// Sidenav.propTypes = {
//   color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
//   routes: PropTypes.arrayOf(PropTypes.object).isRequired,
// };

// export default Sidenav;

// // import { useEffect, useState } from "react";

// // // react-router components
// // import { useLocation, NavLink, useNavigate  } from "react-router-dom";

// // // prop-types is a library for typechecking of props.
// // import PropTypes from "prop-types";

// // // @mui material components
// // import List from "@mui/material/List";
// // import Divider from "@mui/material/Divider";
// // import Link from "@mui/material/Link";
// // import Icon from "@mui/material/Icon";

// // // Material Dashboard 2 PRO React components
// // import MDBox from "components/MDBox";
// // import MDTypography from "components/MDTypography";

// // // Material Dashboard 2 PRO React examples
// // import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
// // import SidenavList from "examples/Sidenav/SidenavList";
// // import SidenavItem from "examples/Sidenav/SidenavItem";

// // // Custom styles for the Sidenav
// // import SidenavRoot from "examples/Sidenav/SidenavRoot";
// // import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// // // Material Dashboard 2 PRO React context
// // import {
// //   useMaterialUIController,
// //   setMiniSidenav,
// //   setTransparentSidenav,
// //   setWhiteSidenav,
// // } from "context";

// // function Sidenav({ color, brand, brandName, brandLabel, routes, ...rest }) {
// //   const [openCollapse, setOpenCollapse] = useState(false);
// //   const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
// //   const [controller, dispatch] = useMaterialUIController();
// //   const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

// //   const location = useLocation();
// //   const navigate = useNavigate(); // เพิ่ม useNavigate
// //   const { pathname } = location;

// //   // ฟังก์ชันสำหรับคลิกเมนูเพื่อส่ง state
// //   const handleMenuClick = (route, menu_id) => {
// //     console.log('handleMenuClick -> menu_id : ', menu_id);
// //     // ใช้ navigate เพื่อส่ง state ไปยังหน้าปลายทาง
// //     navigate(route, { state: { menu_id } }); // ส่ง menu_id ผ่าน state
// //   };

// //   const collapseName = pathname.split("/").slice(1)[0];
// //   const items = pathname.split("/").slice(1);
// //   const itemParentName = items[1];
// //   const itemName = items[items.length - 1];

// //   let textColor = "white";
// //   if (transparentSidenav || (whiteSidenav && !darkMode)) {
// //     textColor = "dark";
// //   } else if (whiteSidenav && darkMode) {
// //     textColor = "inherit";
// //   }

// //   const closeSidenav = () => setMiniSidenav(dispatch, true);

// //   useEffect(() => {
// //     setOpenCollapse(collapseName);
// //     setOpenNestedCollapse(itemParentName);
// //   }, [collapseName, itemParentName]);

// //   useEffect(() => {
// //     function handleMiniSidenav() {
// //       setMiniSidenav(dispatch, window.innerWidth < 1200);
// //       setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
// //       setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
// //     }

// //     window.addEventListener("resize", handleMiniSidenav);

// //     handleMiniSidenav();

// //     return () => window.removeEventListener("resize", handleMiniSidenav);
// //   }, [dispatch, location]);

// //   // ฟังก์ชันสำหรับเรนเดอร์ nested collapse
// //   const renderNestedCollapse = (collapse) => {
// //     return collapse.map(({ name, route, key, href, icon, menu_id }) =>  // เพิ่ม icon ที่รับจากแต่ละเมนู เพิ่ม menu_id
// //       href ? (
// //         <Link
// //           key={key}
// //           href={href}
// //           target="_blank"
// //           rel="noreferrer"
// //           sx={{ textDecoration: "none" }}
// //         >
// //           <SidenavItem name={name} nested icon={icon} />  {/* ส่ง icon ไปด้วย */}
// //         </Link>
// //       ) : (
// //         <NavLink to={route} key={key} style={{ textDecoration: "none" }} onClick={() => handleMenuClick(route, menu_id)}>  {/* ส่ง menu_id ตอน Click ไปด้วย */}
// //           <SidenavItem name={name} active={pathname === route} nested icon={icon} /> {/* ส่ง icon ไปด้วย */}
// //         </NavLink>
// //       )
// //     );
// //   };

// //   // ฟังก์ชันสำหรับเรนเดอร์ collapse หลัก
// //   const renderCollapse = (collapses) => {
// //     return collapses.map(({ name, collapse, route, href, key, icon, menu_id  }) => {  // เพิ่ม icon ที่รับจากแต่ละเมนู
// //       let returnValue;

// //       if (collapse) {
// //         returnValue = (
// //           <SidenavItem
// //             key={key}
// //             color={color}
// //             name={name}
// //             active={key === itemParentName ? "isParent" : false}
// //             open={openNestedCollapse === key}
// //             icon={icon}  // ส่ง icon ไปด้วย
// //             onClick={({ currentTarget }) =>
// //               openNestedCollapse === key && currentTarget.classList.contains("MuiListItem-root")
// //                 ? setOpenNestedCollapse(false)
// //                 : setOpenNestedCollapse(key)
// //             }
// //           >
// //             {renderNestedCollapse(collapse)}
// //           </SidenavItem>
// //         );
// //       } else {
// //         returnValue = href ? (
// //           <Link
// //             href={href}
// //             key={key}
// //             target="_blank"
// //             rel="noreferrer"
// //             sx={{ textDecoration: "none" }}
// //           >
// //             <SidenavItem color={color} name={name} active={key === itemName} icon={icon} />  {/* ส่ง icon ไปด้วย */}
// //           </Link>
// //         ) : (
// //           <NavLink to={route} key={key} style={{ textDecoration: "none" }} onClick={() => handleMenuClick(route, menu_id)}>  {/* ส่ง menu_id ตอน Click ไปด้วย */}
// //             <SidenavItem color={color} name={name} active={pathname === route} icon={icon} />  {/* ส่ง icon ไปด้วย */}
// //           </NavLink>
// //         );
// //       }
// //       return <SidenavList key={key}>{returnValue}</SidenavList>;
// //     });
// //   };

// //   // สร้างเมนู จาก Routes
// //   const renderRoutes = routes.map(
// //     ({ type, name, icon, title, collapse, noCollapse, key, href, route, menu_id  }) => {
// //       let returnValue;

// //       if (type === "collapse") {
// //         if (href) {
// //           returnValue = (
// //             <SidenavCollapse
// //               key={key}
// //               name={name}
// //               icon={icon}
// //               active={key === collapseName}
// //               open={openCollapse === key}
// //               onClick={() => setOpenCollapse(openCollapse === key ? false : key)}
// //             >
// //               {collapse ? renderCollapse(collapse) : null}
// //             </SidenavCollapse>
// //           );
// //         } else if (noCollapse && route) {
// //           returnValue = (
// //             <NavLink to={route} key={key} onClick={() => handleMenuClick(route, menu_id)}>  {/* ส่ง menu_id ตอน Click ไปด้วย */}
// //               <SidenavCollapse
// //                 name={name}
// //                 icon={icon}
// //                 noCollapse={noCollapse}
// //                 active={key === collapseName}
// //               >
// //                 {collapse ? renderCollapse(collapse) : null}
// //               </SidenavCollapse>
// //             </NavLink>
// //           );
// //         } else {
// //           returnValue = (
// //             <SidenavCollapse
// //               key={key}
// //               name={name}
// //               icon={icon}
// //               active={key === collapseName}
// //               open={openCollapse === key}
// //               onClick={() => (openCollapse === key ? setOpenCollapse(false) : setOpenCollapse(key))}
// //             >
// //               {collapse ? renderCollapse(collapse) : null}
// //             </SidenavCollapse>
// //           );
// //         }
// //       } else if (type === "title") {
// //         returnValue = (
// //           <MDTypography
// //             key={key}
// //             color={textColor}
// //             display="block"
// //             variant="caption"
// //             fontWeight="bold"
// //             textTransform="uppercase"
// //             pl={3}
// //             mt={2}
// //             mb={1}
// //             ml={1}
// //           >
// //             {title}
// //           </MDTypography>
// //         );
// //       } else if (type === "divider") {
// //         returnValue = <Divider key={key} light={(!darkMode && !whiteSidenav && !transparentSidenav)} />;
// //       }

// //       return returnValue;
// //     }
// //   );

// //   return (
// //     <SidenavRoot
// //       {...rest}
// //       variant="permanent"
// //       ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
// //     >
// //       <MDBox pt={3} pb={1} px={4} textAlign="center">
// //         <MDBox
// //           display={{ xs: "block", xl: "none" }}
// //           position="absolute"
// //           top={0}
// //           right={0}
// //           p={1.625}
// //           onClick={closeSidenav}
// //           sx={{ cursor: "pointer" }}
// //         >
// //           <MDTypography variant="h6" color="secondary">
// //             <Icon sx={{ fontWeight: "bold" }}>close</Icon>
// //           </MDTypography>
// //         </MDBox>
// //         <MDBox component={NavLink} to="/home" display="flex" alignItems="center">
// //           {brand && <MDBox component="img" src={brand} alt="Brand"  width="90%" />}
// //         </MDBox>
// //       </MDBox>
// //       <Divider
// //         light={
// //           (!darkMode && !whiteSidenav && !transparentSidenav) ||
// //           (darkMode && !transparentSidenav && whiteSidenav)
// //         }
// //       />
// //       <List>{renderRoutes}</List>
// //     </SidenavRoot>
// //   );
// // }

// // // Typechecking props for the Sidenav
// // Sidenav.propTypes = {
// //   color: PropTypes.oneOf([
// //     "primary",
// //     "secondary",
// //     "info",
// //     "success",
// //     "warning",
// //     "error",
// //     "dark",
// //   ]),
// //   brand: PropTypes.string,
// //   brandName: PropTypes.string.isRequired,
// //   brandLabel: PropTypes.string,
// //   routes: PropTypes.arrayOf(PropTypes.object).isRequired,
// // };

// // export default Sidenav;

// // import { useEffect, useState } from "react";

// // // react-router components
// // import { useLocation, NavLink } from "react-router-dom";

// // // prop-types is a library for typechecking of props.
// // import PropTypes from "prop-types";

// // // @mui material components
// // import List from "@mui/material/List";
// // import Divider from "@mui/material/Divider";
// // import Link from "@mui/material/Link";
// // import Icon from "@mui/material/Icon";

// // // Material Dashboard 2 PRO React components
// // import MDBox from "components/MDBox";
// // import MDTypography from "components/MDTypography";

// // // Material Dashboard 2 PRO React examples
// // import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
// // import SidenavList from "examples/Sidenav/SidenavList";
// // import SidenavItem from "examples/Sidenav/SidenavItem";

// // // Custom styles for the Sidenav
// // import SidenavRoot from "examples/Sidenav/SidenavRoot";
// // import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// // // Material Dashboard 2 PRO React context
// // import {
// //   useMaterialUIController,
// //   setMiniSidenav,
// //   setTransparentSidenav,
// //   setWhiteSidenav,
// // } from "context";

// // // Custom styles for the Sidenav
// // // import '../../layouts/Lab/components/print.css';
// // //import * as Constants from 'common/constants';
// // //import { getPublicAssetUrl } from "utils/BaseHelper";

// // function Sidenav({ color, brand, brandName, brandLabel, routes, ...rest }) {
// //   const [openCollapse, setOpenCollapse] = useState(false);
// //   const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
// //   const [controller, dispatch] = useMaterialUIController();
// //   const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

// //   // ใช้ useLocation เพื่อดึงเส้นทางปัจจุบัน
// //   const location = useLocation();
// //   const { pathname } = location;

// //   // การตั้งค่าชื่อของ collapse และเส้นทาง
// //   const collapseName = pathname.split("/").slice(1)[0];
// //   const items = pathname.split("/").slice(1);
// //   const itemParentName = items[1];
// //   const itemName = items[items.length - 1];

// //   let textColor = "white";
// //   if (transparentSidenav || (whiteSidenav && !darkMode)) {
// //     textColor = "dark";
// //   } else if (whiteSidenav && darkMode) {
// //     textColor = "inherit";
// //   }

// //   const closeSidenav = () => setMiniSidenav(dispatch, true);

// //   useEffect(() => {
// //     setOpenCollapse(collapseName);
// //     setOpenNestedCollapse(itemParentName);
// //   }, [collapseName, itemParentName]);

// //   useEffect(() => {
// //     // A function that sets the mini state of the sidenav.
// //     function handleMiniSidenav() {
// //       setMiniSidenav(dispatch, window.innerWidth < 1200);
// //       setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
// //       setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
// //     }

// //     /**
// //      The event listener that's calling the handleMiniSidenav function when resizing the window.
// //     */
// //     window.addEventListener("resize", handleMiniSidenav);

// //     // Call the handleMiniSidenav function to set the state with the initial value.
// //     handleMiniSidenav();

// //     // Remove event listener on cleanup
// //     return () => window.removeEventListener("resize", handleMiniSidenav);
// //   }, [dispatch, location]);

// //   // ฟังก์ชันสำหรับเรนเดอร์ nested collapse
// //   const renderNestedCollapse = (collapse) => {
// //     return collapse.map(({ name, route, key, href }) =>
// //       href ? (
// //         <Link
// //           key={key}
// //           href={href}
// //           target="_blank"
// //           rel="noreferrer"
// //           sx={{ textDecoration: "none" }}
// //         >
// //           <SidenavItem name={name} nested />
// //         </Link>
// //       ) : (
// //         <NavLink to={route} key={key} style={{ textDecoration: "none" }}>
// //           {/* ไฮไลท์รายการที่เส้นทางตรงกับ pathname */}
// //           <SidenavItem name={name} active={pathname === route} nested />
// //         </NavLink>
// //       )
// //     );
// //   };

// //   // ฟังก์ชันสำหรับเรนเดอร์ collapse หลัก
// //   const renderCollapse = (collapses) => {
// //     return collapses.map(({ name, collapse, route, href, key }) => {
// //       let returnValue;

// //       if (collapse) {
// //         returnValue = (
// //           <SidenavItem
// //             key={key}
// //             color={color}
// //             name={name}
// //             active={key === itemParentName ? "isParent" : false}
// //             open={openNestedCollapse === key}
// //             onClick={({ currentTarget }) =>
// //               openNestedCollapse === key && currentTarget.classList.contains("MuiListItem-root")
// //                 ? setOpenNestedCollapse(false)
// //                 : setOpenNestedCollapse(key)
// //             }
// //           >
// //             {renderNestedCollapse(collapse)}
// //           </SidenavItem>
// //         );
// //       } else {
// //         returnValue = href ? (
// //           <Link
// //             href={href}
// //             key={key}
// //             target="_blank"
// //             rel="noreferrer"
// //             sx={{ textDecoration: "none" }}
// //           >
// //             <SidenavItem color={color} name={name} active={key === itemName} />
// //           </Link>
// //         ) : (
// //           <NavLink to={route} key={key} style={{ textDecoration: "none" }}>
// //             {/* ไฮไลท์รายการที่เส้นทางตรงกับ pathname */}
// //             <SidenavItem color={color} name={name} active={pathname === route} />
// //           </NavLink>
// //         );
// //       }
// //       return <SidenavList key={key}>{returnValue}</SidenavList>;
// //     });
// //   };

// //   // สร้างเมนู จาก Routes
// //   const renderRoutes = routes.map(
// //     ({ type, name, icon, title, collapse, noCollapse, key, href, route }) => {
// //       let returnValue;

// //       if (type === "collapse") {
// //         if (href) {
// //           returnValue = (
// //             <SidenavCollapse
// //               key={key}
// //               name={name}
// //               icon={icon}
// //               active={key === collapseName}
// //               open={openCollapse === key}
// //               onClick={() => setOpenCollapse(openCollapse === key ? false : key)}
// //             >
// //               {collapse ? renderCollapse(collapse) : null}
// //             </SidenavCollapse>
// //           );
// //         } else if (noCollapse && route) {
// //           returnValue = (
// //             <NavLink to={route} key={key}>
// //               <SidenavCollapse
// //                 name={name}
// //                 icon={icon}
// //                 noCollapse={noCollapse}
// //                 active={key === collapseName}
// //               >
// //                 {collapse ? renderCollapse(collapse) : null}
// //               </SidenavCollapse>
// //             </NavLink>
// //           );
// //         } else {
// //           returnValue = (
// //             <SidenavCollapse
// //               key={key}
// //               name={name}
// //               icon={icon}
// //               active={key === collapseName}
// //               open={openCollapse === key}
// //               onClick={() => (openCollapse === key ? setOpenCollapse(false) : setOpenCollapse(key))}
// //             >
// //               {collapse ? renderCollapse(collapse) : null}
// //             </SidenavCollapse>
// //           );
// //         }
// //       } else if (type === "title") {
// //         returnValue = (
// //           <MDTypography
// //             key={key}
// //             color={textColor}
// //             display="block"
// //             variant="caption"
// //             fontWeight="bold"
// //             textTransform="uppercase"
// //             pl={3}
// //             mt={2}
// //             mb={1}
// //             ml={1}
// //           >
// //             {title}
// //           </MDTypography>
// //         );
// //       } else if (type === "divider") {
// //         returnValue = <Divider key={key} light={(!darkMode && !whiteSidenav && !transparentSidenav)} />;
// //       }

// //       return returnValue;
// //     }
// //   );

// //   return (
// //     <SidenavRoot
// //       {...rest}
// //       variant="permanent"
// //       ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
// //     >
// //       {/* <MDBox pt={3} pb={1} px={4} textAlign="center">
// //         <MDBox
// //           display={{ xs: "block", xl: "none" }}
// //           position="absolute"
// //           top={0}
// //           right={0}
// //           p={1.625}
// //           onClick={closeSidenav}
// //           sx={{ cursor: "pointer" }}
// //         >
// //           <MDTypography variant="h6" color="secondary">
// //             <Icon sx={{ fontWeight: "bold" }}>close</Icon>
// //           </MDTypography>
// //         </MDBox>
// //         <MDBox
// //           component={NavLink}
// //           to="/"
// //           display="flex"
// //           justifyContent="center"
// //           alignItems="center"
// //           sx={{ height: "100px", width: "100px", margin: "0 auto" }}
// //         >
// //           <img src={Constants.IMAGE_LOGO} alt={brandLabel} style={{ width: '100%', height: 'auto' }} />
// //         </MDBox>
// //       </MDBox> */}
// //       <MDBox pt={3} pb={1} px={4} textAlign="center">
// //         <MDBox
// //           display={{ xs: "block", xl: "none" }}
// //           position="absolute"
// //           top={0}
// //           right={0}
// //           p={1.625}
// //           onClick={closeSidenav}
// //           sx={{ cursor: "pointer" }}
// //         >
// //           <MDTypography variant="h6" color="secondary">
// //             <Icon sx={{ fontWeight: "bold" }}>close</Icon>
// //           </MDTypography>
// //         </MDBox>
// //         <MDBox component={NavLink} to="/home" display="flex" alignItems="center">
// //           {brand && <MDBox component="img" src={brand} alt="Brand"  width="90%" />}
// //           {/* <MDBox
// //             width={!brandName && "100%"}
// //             sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
// //           >
// //             <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
// //               {brandName}
// //             </MDTypography>
// //           </MDBox> */}
// //         </MDBox>
// //       </MDBox>
// //       <Divider
// //         light={
// //           (!darkMode && !whiteSidenav && !transparentSidenav) ||
// //           (darkMode && !transparentSidenav && whiteSidenav)
// //         }
// //       />
// //       <List>{renderRoutes}</List>
// //     </SidenavRoot>
// //   );
// // }

// // /* // Setting default values for the props of Sidenav
// // Sidenav.defaultProps = {
// //   color: "info",
// //   brandName: "TEST",
// // }; */

// // // Typechecking props for the Sidenav
// // Sidenav.propTypes = {
// //   color: PropTypes.oneOf([
// //     "primary",
// //     "secondary",
// //     "info",
// //     "success",
// //     "warning",
// //     "error",
// //     "dark",
// //   ]),
// //   brand: PropTypes.string,
// //   brandName: PropTypes.string.isRequired,
// //   brandLabel: PropTypes.string,
// //   routes: PropTypes.arrayOf(PropTypes.object).isRequired,
// // };

// // export default Sidenav;




import { useEffect, useState } from "react";

// react-router components
import { useLocation, useNavigate } from "react-router-dom"; // ลบ NavLink ที่ไม่ได้ใช้งาน

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavList from "examples/Sidenav/SidenavList";
import SidenavItem from "examples/Sidenav/SidenavItem";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import { GlobalVar } from "../../common/GlobalVar";
import LogoutButton from "../../layouts/lab/components/logout_button";
import userImg from "../../assets/images/user.jpg";
import UserInfo from "../../layouts/lab/components/user_info";
import UserAPI from "api/UserAPI";




// Material Dashboard 2 PRO React context
import {
  useMaterialUIController,
  setMiniSidenav,
  //setTransparentSidenav,
  //setWhiteSidenav,
} from "context";

function Sidenav({ color, routes, ...rest }) {
  const [openCollapse, setOpenCollapse] = useState(false);
  const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

  const location = useLocation();
  const navigate = useNavigate(); // เพิ่ม useNavigate
  const { pathname } = location;
  // eslint-disable-next-line no-unused-vars
  const [logoUrl, setLogoUrl] = useState(""); // สถานะสำหรับเก็บ URL ของโลโก้
  const [userID, setUserID] = useState(null);

  const [Username, setUsername] = useState("");
  const [RoleCode, setRoleCoed] = useState("");
  const profileUser = userImg;

  //สำหรับ ดึง ข้อมูลuserID จาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserID = GlobalVar.getUserId();
        const token = GlobalVar.getToken();

        if (storedUserID && token) {
          setUserID(storedUserID);
          const response = await UserAPI.getUserDataById(storedUserID);

          if (response.isCompleted && !response.isError) {
            setUsername(response.data.username);
            setRoleCoed(response.data.role_code);
          } else {
            console.error("Failed to fetch profile data:", response.message);
          }
        } else {
          console.error("No user ID or token found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error.message);
      }
    };

    fetchData();
  }, [userID]);

  


 
  // ฟังก์ชันสำหรับคลิกเมนูเพื่อส่ง state และรีเซ็ตการแจ้งเตือน
  const handleMenuClick = (route, key, menu_id) => {
    //console.log("handleMenuClick -> menu_id :", menu_id, "rout::", route);

    

    // ✅ นำทางไปยังหน้าเป้าหมาย
    navigate(route, { state: { menu_id } });
  };

  useEffect(() => {
    // ปิด sidenav ที่หน้าจอแคบ กว่าหรือเท่ากับ1024
    if (window.innerWidth <= 1024){
      setMiniSidenav(dispatch, true);
    }
  },[pathname]);

  const collapseName = pathname.split("/").slice(1)[0];
  const items = pathname.split("/").slice(1);
  const itemParentName = items[1];
  const itemName = items[items.length - 1];

  let textColor = "dark";
  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  // ดึง URL โลโก้เมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    const fetchLogo = async () => {
      const logo = await GlobalVar.getHospitalLogo();
      setLogoUrl(logo);
    };
    fetchLogo();
  }, []);

  // const closeSidenav = () => setMiniSidenav(dispatch, true);
  // eslint-disable-next-line no-unused-vars
  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  useEffect(() => {
    setOpenCollapse(collapseName);
    setOpenNestedCollapse(itemParentName);
  }, [collapseName, itemParentName]);

  useEffect(() => {
    function handleMiniSidenav() {
      //setMiniSidenav(dispatch, window.innerWidth < 1200);
      //setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      //setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    window.addEventListener("resize", handleMiniSidenav);

    //handleMiniSidenav();

    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
  //   color: () => {
  //     let colorValue = light || darkMode ? white.main : dark.main;

  //     if (transparentNavbar && !light) {
  //       colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
  //     }

  //     return colorValue;
  //   },
  // });

  const renderHeader = () => (
  <MDBox
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    sx={{
      position: "relative",
      backgroundColor: "#fff",
      height: { xs: 72, sm: 84 },
    }}
  >
    {/* แถวโลโก้ + ชื่อระบบ */}
    <MDBox
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      width="100%"
      px={3}
      sx={{ height: "100%" }}
    >
      {/* ✅ โลโก้ (SVG) — แสดงตลอด */}
      <svg
        viewBox="0 0 64 64"
        width="26"
        height="26"
        style={{ display: "block", flexShrink: 0, marginRight: 10 }}
        role="img"
        aria-label="WCS logo"
      >
        <path
          d="M12 20v24l20 10 20-10V20L32 10 12 20z"
          fill="none"
          stroke="#2b2b6a"
          strokeWidth="3"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M32 10v40"
          fill="none"
          stroke="#2b2b6a"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M12 20l20 10 20-10"
          fill="none"
          stroke="#2b2b6a"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* ชื่อระบบ — โชว์เมื่อไม่ mini (ถ้าอยากให้โชว์ตลอด ให้เอาเงื่อนไข !miniSidenav ออก) */}
      {!miniSidenav && (
  <MDTypography
    variant="subtitle1"        // เล็กลงกว่าก่อน (เดิม h6)
    fontWeight="bold"
    sx={{
      fontSize: { xs: 12, sm: 12 }, // ✅ ปรับขนาดตามหน้าจอ
      lineHeight: 1.2,
      color: "#0b0b0b",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      flex: 1,                     // ✅ ให้ยืด/หดได้ใน flex row
      minWidth: 0,                 // ✅ จำเป็นเพื่อให้ ellipsis ทำงานใน flex
    }}
  >
    Warehouse Control System
  </MDTypography>
)}

    </MDBox>

    {/* เส้นคั่นด้านล่าง */}
    <MDBox
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "1px",
        backgroundColor: "#e5e7eb",
      }}
    />
  </MDBox>
);


  // ฟังก์ชันสำหรับเรนเดอร์ nested collapse
  const renderNestedCollapse = (collapse) => {
    return collapse.map(({ name, route, key, href, icon, menu_id }) =>
      href ? (
        <Link
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          sx={{
            textDecoration: "none",
            backgroundColor: "#363636ff",
            color: "black",
            "&:hover": { backgroundColor: "#ffffffff" },
          }}
        >
          <SidenavItem name={name} nested icon={(key, icon)} />
        </Link>
      ) : (
        <div
          key={key}
          style={{
            cursor: "pointer",
            backgroundColor: "#363636ff",
            color: "black",
          }}
          onClick={() => handleMenuClick(route, key, menu_id)}
        >
          <SidenavItem
            name={name}
            active={pathname === route}
            nested
            // icon={(route, icon)}
            icon={(key, icon)}
            sx={{
              backgroundColor: "#363636ff",
              "&:hover": { backgroundColor: "#363636ff" },
            }}
          />
        </div>
      )
    );
  };

  // ฟังก์ชันสำหรับเรนเดอร์ collapse หลัก
  const renderCollapse = (collapses) => {
    return collapses.map(({ name, collapse, route, href, key, icon, menu_id }) => {
      let returnValue;
      // สร้าง Array ของเมนูย่อยเพื่อใช้ตรวจสอบแจ้งเตือน
      // const subMenuKeys = collapse ? collapse.map(sub => sub.route) : [];

      if (collapse) {
        returnValue = (
          <SidenavItem
            key={key}
            color={color}
            name={name}
            active={key === itemParentName ? "isParent" : false}
            open={openNestedCollapse === key}
            icon={(key, icon)} // ✅ ส่ง isParent = true และ subMenus
            onClick={(event) => {
              const { currentTarget } = event;

              // ฟังก์ชันสำหรับการเปิด/ปิด nested collapse
              if (
                openNestedCollapse === key &&
                currentTarget.classList.contains("MuiListItem-root")
              ) {
                setOpenNestedCollapse(false);
              } else {
                setOpenNestedCollapse(key);
              }

              // เรียกใช้งานฟังก์ชัน handleMenuClick ด้วย route และ menu_id
              // handleMenuClick(route, key, menu_id);
              // console.log("skipppppppppppppppp");
            }}
          >
            {renderNestedCollapse(collapse)}
          </SidenavItem>
        );
      } else {
        returnValue = href ? (
          <Link
            href={href}
            key={key}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <SidenavItem
              color={color}
              name={name}
              active={key === itemName}
              icon={(key, icon)}
            />
          </Link>
        ) : (
          <div
            key={key}
            style={{ cursor: "pointer" }}
            onClick={() => handleMenuClick(route, key, menu_id)}
          >
            <SidenavItem
              color={color}
              name={name}
              active={pathname === route}
              icon={(key, icon)}
            />
          </div>
        );
      }
      return <SidenavList key={key}>{returnValue}</SidenavList>;
    });
  };

  // สร้างเมนู จาก Routes
  const renderRoutes = routes.map(
    ({ type, name, icon, title, collapse, noCollapse, key, href, route, menu_id }) => {
      let returnValue;
      if (type === "collapse") {
        if (href) {
          returnValue = (
            <SidenavCollapse
              key={key}
              name={name}
              icon={(key, icon || <Icon>fiber_manual_record</Icon>)}
              active={key === collapseName}
              open={openCollapse === key}
              onClick={() => setOpenCollapse(openCollapse === key ? false : key)}
            >
              {collapse ? renderCollapse(collapse) : null}
            </SidenavCollapse>
          );
        } else if (noCollapse && route) {
          returnValue = (
            <div
              key={key}
              style={{ cursor: "pointer" }}
              onClick={() => handleMenuClick(route, key, menu_id)}
            >
              <SidenavCollapse
                name={name}
                icon={(key, icon || <Icon>fiber_manual_record</Icon>)}
                noCollapse={noCollapse}
                active={key === collapseName}
              >
                {collapse ? renderCollapse(collapse) : null}
              </SidenavCollapse>
            </div>
          );
        } else {
          returnValue = (
            <SidenavCollapse
              key={key}
              name={name}
              icon={(key, icon || <Icon>fiber_manual_record</Icon>)}
              active={key === collapseName}
              open={openCollapse === key}
              onClick={() => (openCollapse === key ? setOpenCollapse(false) : setOpenCollapse(key))}
            >
              {collapse ? renderCollapse(collapse) : null}
            </SidenavCollapse>
          );
        }
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = <Divider key={key} />;
      } else if (type === "item" && route) {
        returnValue = (
          <div
            key={key}
            style={{ cursor: "pointer" }}
            onClick={() => handleMenuClick(route, key, menu_id)}
          >
            <SidenavItem
              color={color}
              name={name}
              active={pathname === route}
              icon={(key, icon || <Icon>fiber_manual_record</Icon>)}
            />
          </div>
        );
      }

      return returnValue;
    }
  );

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
      sx={{
        backgroundColor: "#ffffffff ", // สีพื้นหลังเหลืองอ่อน
      }}
    >
      {renderHeader()} {/* เรียกใช้ฟังก์ชัน renderHeader */}
      <List
        sx={{
          backgroundColor: "#ffffffff",
          flexGrow: 1, // ขยายให้เต็มพื้นที่ที่เหลือ
          padding: 0, // เอาการ padding ออกเพื่อเต็มพื้นที่
          overflow: "auto", // เลื่อนเมื่อเนื้อหาเกิน
        }}
      >
        <UserInfo Username={Username} RoleCode={RoleCode} profileUser={profileUser} />
        {renderRoutes}
      </List>
      <Divider
        sx={{
          color: "FBB040",
          margin: 0, // เว้นระยะห่างจากเนื้อหาด้านล่าง
        }}
      />
      <LogoutButton />
    </SidenavRoot>
  );
}

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;