/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 PRO React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/



// Material Dashboard 2 PRO React layouts
/* import Analytics from "layouts/dashboards/analytics";
import Sales from "layouts/dashboards/sales";
import ProfileOverview from "layouts/pages/profile/profile-overview";
import AllProjects from "layouts/pages/profile/all-projects";
import NewUser from "layouts/pages/users/new-user";
import Settings from "layouts/pages/account/settings";
import Billing from "layouts/pages/account/billing";
import Invoice from "layouts/pages/account/invoice";
import Timeline from "layouts/pages/projects/timeline";
import PricingPage from "layouts/pages/pricing-page";
import Widgets from "layouts/pages/widgets";
import RTL from "layouts/pages/rtl";
import Charts from "layouts/pages/charts";
import Notifications from "layouts/pages/notifications";
import Kanban from "layouts/applications/kanban";
import Wizard from "layouts/applications/wizard";
import DataTables from "layouts/applications/data-tables";
import Calendar from "layouts/applications/calendar";
import NewProduct from "layouts/ecommerce/products/new-product";
import EditProduct from "layouts/ecommerce/products/edit-product";
import ProductPage from "layouts/ecommerce/products/product-page";
import OrderList from "layouts/ecommerce/orders/order-list";
import OrderDetails from "layouts/ecommerce/orders/order-details";
import SignInBasic from "layouts/authentication/sign-in/basic";
import SignInCover from "layouts/authentication/sign-in/cover";
import SignInIllustration from "layouts/authentication/sign-in/illustration";
import SignUpCover from "layouts/authentication/sign-up/cover";
import ResetCover from "layouts/authentication/reset-password/cover";
 */

// Images
//import profilePicture from "assets/images/team-3.jpg";

// import React, { useEffect, useState ,useContext} from 'react';
// import axios from 'axios';

// ภาษา language
//import * as lang from "utils/langHelper.js"

// @mui icons


import Icon from "@mui/material/Icon";

// Menu initial
import HomePage from "layouts/lab/home";
import LoginPage from "layouts/lab/login";
import LogoutPage from "layouts/lab/logout";
import RolePage from "layouts/lab/role";



import CreateTaskForm from "layouts/lab/task/add";
import RoleEditPage from "layouts/lab/role/edit_role";



const getComponent = (componentName) => {
  switch (componentName) {
    // for menu intital
    case "home":
      return <HomePage />;
    case "login":
      return <LoginPage />;
    case "logout":
      return <LogoutPage />;
    case "view-role":
      return <RolePage />;
    case "role-edit":
        return <RoleEditPage />;
    case "create-task":
        return <CreateTaskForm />;

    // เพิ่มกรณีสำหรับ components อื่นๆ
    default:
      return null;
  }
};

const getIcon = (menuKey) => {
  switch (menuKey) {
    case "home":
      return <Icon fontSize="medium">home</Icon>;
    case "login":
      return <Icon fontSize="medium">login</Icon>;
    case "data":
      return <Icon fontSize="medium">grid_view</Icon>;
    case "setting":
      return <Icon fontSize="medium"></Icon>;
    case "role":
      return <Icon fontSize="medium">admin_panel_settings</Icon>;

    case "task-add":
      return <Icon fontSize="medium">home</Icon>;
    default:
      return <Icon fontSize="medium">fiber_manual_record</Icon>;
  }
};

// กำหนด route ที่ไม่ได้อยู่ใน menu database
const initialRoutes = [
  {
    type: "collapse",
    name: "menu.home",
    key: "home",
    icon: getIcon("home"),
    route: "/home",
    component: getComponent("home"),
    noCollapse: true,
  },
  {
    name: "menu.login",
    key: "login",
    route: "/login",
    component: getComponent("login"),
  },
  {
    name: "menu.logout",
    key: "logout",
    route: "/logout",
    component: getComponent("logout"),
  },
  {
    name: "menu.role-edit",
    key: "role-edit",
    route: "/role-edit",
    component: getComponent("role-edit"),
  }
];

const initialRoutesTest = [
  { type: "divider", key: "divider-2" },
];


const transformRoute =  (route) => ({
  type: route.type,
  name: route.name,
  key: route.key,
  icon: getIcon(route.key),
  route: route.route,
  menu_id: route.menu_id, // เพิ่มส่ง menu_id
  // ปรับการสร้าง route URL เพื่อใส่ menu_id เข้าไปใน route
  //route: route.route ? `${route.route}/${route.menu_id}` : undefined,  // เพิ่ม menu_id เข้าไปใน route
  // เพิ่ม Query Parameters ใน route
  //route: `${route.route}?menu_id=${route.menu_id}`, // เพิ่ม menu_id เป็น query parameter
  component: getComponent(route.key),
  noCollapse: route.noCollapse,
  collapse: Array.isArray(route.collapse) && route.collapse.length > 0
    ? route.collapse.map(subRoute => transformRoute(subRoute))
    : undefined,
});

export async function  generateRoutesFromApi(apiRoutes) {
  const apiRoutesTransformed = await apiRoutes.map(transformRoute);
  return [  ...initialRoutes,...apiRoutesTransformed,...initialRoutesTest ];
}


export { initialRoutes};