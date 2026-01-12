
// App.js
import React, { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation,useNavigate  } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
// import MDBox from "components/MDBox";

// Material Dashboard 2 PRO React examples
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 PRO React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 PRO React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 PRO React route
import { generateRoutesFromApi, initialRoutes } from "routes";

// API
import roles from "./api/RoleAPI"; // Import roles service

// Material Dashboard 2 PRO React contexts
import { useMaterialUIController, setMiniSidenav } from "context";

// Images
//import brandWhite from "assets/images/lab/logo_hospital_parket.png";
//import brandDark from "assets/images/lab/logo_hospital_parket.png";


//import * as Constants from 'common/constants';
import { GlobalVar } from "common/GlobalVar";


export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
   
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const [routes, setRoutes] = useState(initialRoutes); 
  // const [routesIntital, setRoutesIntital] = useState(initialRoutes); 
  // const [loading, setLoading] = useState(true); // เพิ่มสถานะ loading เพื่อให้ระบบรู้ว่าควรรอจนกว่าจะดึงข้อมูลเสร็จ

  const navigate = useNavigate(); // ใช้สำหรับเปลี่ยนเส้นทาง


  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  // const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  const fetchMenuPermissions = async () => {
  try {
    const apiResponse = await roles.getPermissionByMenu();
    //console.log("📌 API Response:", apiResponse.data); // ✅ ตรวจสอบว่า API ส่งค่าอะไรมา

    if (apiResponse.data) {
      const apiRoutes = await generateRoutesFromApi(apiResponse.data);
      //console.log("📌 Generated Routes:", apiRoutes); // ✅ ตรวจสอบว่ามีเมนูย่อยหรือไม่

      setRoutes(apiRoutes);
    }
  } catch (error) {
    console.error("❌ Error fetching menu permissions:", error);
  } 
};


  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // ตรวจสอบ token เมื่อแอปโหลดขึ้นมา
  useEffect(() => {
    const token = GlobalVar.getToken(); // หรือใช้ localStorage.getItem('token');

    if (!token && pathname !== "/login") {
      // ถ้าไม่มี token และไม่ได้อยู่ที่หน้า login ให้เปลี่ยนเส้นทางไปที่หน้า Login
      navigate("/login", { replace: true });
    } else {
      fetchMenuPermissions(); // เรียกดึงเมนูทันทีหลังจากล็อกอิน
    }
  }, [navigate, pathname]);

  // Fetch routes from API and set routes state
  useEffect(() => {
    fetchMenuPermissions(); // เรียกใช้งานเมื่อ component โหลดครั้งแรก
  }, []);

  const getRoutes = (allRoutes) =>
    //console.log("getRoutes allRoutes : ", allRoutes);
    allRoutes.map( (route) => {
      //console.log("getRoutes route : ", route);
      if (route.collapse) {
        //console.log("getRoutes route.collapse : ", route.collapse);
        return  getRoutes(route.collapse);
      }

      if (route.route) {
        //console.log("getRoutes route : ", route);
        return  <Route 
                      exact 
                      path={route.route} 
                      element={route.component} 
                      key={route.key} />;
      }

      return null;
    });

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? GlobalVar.getHospitalLogo() : GlobalVar.getHospitalLogo()}
              brandName={""}
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
         {/*  {getRoutes(routesIntital)} */}
         {/*  <Route path="*" element={<Navigate to="/login" />} /> */}
          { getRoutes(routes)}
          <Route path="*" element={<Navigate to="/home" />} />
          {/* <Route 
            path="*" 
            element={
              <ProtectedRoutes>
                <Navigate to="/home" />
              </ProtectedRoutes>
            }
          /> */}
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? GlobalVar.getHospitalLogo() : GlobalVar.getHospitalLogo()}
            // brandName={GlobalVar.getHospitalCode()}
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {/* {getRoutes(routesIntital)} */}
        {/* <Route path="*" element={<Navigate to="/login" />} /> */}
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/home" />} />
        {/* <Route 
            path="*" 
            element={
              <ProtectedRoutes>
                <Navigate to="/home" />
              </ProtectedRoutes>
            }
        /> */}
      </Routes>
    </ThemeProvider>
  );
}





