export class MenuRouteModel {
  type: string;     // ถ้ามีเมนูย่อย' กำหนดเป็น 'collapse' ถ้าไม่มีเมนูย่อย ให้กำหนดเป็น 'item'
  menu_id: string;  // menu_id
  key: string;      // menu_key
  name: string;     // menu_name
  route?: string;   // menu_route
  noCollapse?: boolean; // กรณีไม่มีเมนูย่อย กำหนดเป็น true ถ้ามีเมนูย่อย กำหนดเป็น false
  collapse?: MenuRouteModel[];  // ให้เก็บ เมนูย่อย
}
/* ผลที่ได้
[
  {
    "type": "collapse",
    "key": "laboratory",
    "menu_id": "1",
    "name": "menu.laboratory",
    "route": null,
    "noCollapse": false,
    "collapse": [
      {
        "type": "item",
        "key": "lab-inspect-item",
        "menu_id": "2",
        "name": "menu.lab-inspect-item",
        "route": "/laboratory/lab-inspect-item",
        "noCollapse": true,
        "collapse": []
      }
    ]
  },
  {
    "type": "collapse",
    "key": "setting",
    "menu_id": "3",
    "name": "menu.settings",
    "route": null,
    "noCollapse": false,
    "collapse": [
      {
        "type": "collapse",
        "key": "cust-pet",
        "menu_id": "4",
        "name": "menu.customer-pet",
        "route": null,
        "noCollapse": false,
        "collapse": [
          {
            "type": "item",
            "key": "customer-pet-register",
            "menu_id": "10",
            "name": "menu.customer-pet-register",
            "route": "/setting/cust-pet/customer-pet-register",
            "noCollapse": true,
            "collapse": []
          },
          {
            "type": "item",
            "key": "customer-pet-search",
            "menu_id": "11",
            "name": "menu.customer-pet-search",
            "route": "/setting/cust-pet/customer-pet-search",
            "noCollapse": true,
            "collapse": []
          }
        ]
      },
      {
        "type": "item",
        "key": "hospital",
        "menu_id": "5",
        "name": "menu.hospital",
        "route": "/setting/hospital",
        "noCollapse": true,
        "collapse": []
      },
      {
        "type": "item",
        "key": "lab-price",
        "menu_id": "6",
        "name": "menu.lab-price",
        "route": "/setting/lab-price",
        "noCollapse": true,
        "collapse": []
      },
      {
        "type": "item",
        "key": "lab-form-header",
        "menu_id": "7",
        "name": "menu.lab-form-header",
        "route": "/setting/lab-form-header",
        "noCollapse": true,
        "collapse": []
      },
      {
        "type": "item",
        "key": "employee",
        "menu_id": "8",
        "name": "menu.employee",
        "route": "/setting/employee",
        "noCollapse": true,
        "collapse": []
      },
      {
        "type": "item",
        "key": "role",
        "menu_id": "9",
        "name": "menu.role",
        "route": "/setting/role",
        "noCollapse": true,
        "collapse": []
      }
    ]
  }
]
 */


/* export class MenuRouteModel {
  type: string;
  name?: string;
  key: string;
  icon?: string;
  route?: string;
  component?: string;
  noCollapse?: boolean;
  collapse?: MenuRouteModel[];  // ทำให้เป็น optional ด้วยการใส่ '?'
  title?: string;
  parent_menu_id?: any;
}

export class NewMenuRouteModel {
  type: string;
  key: string;
  name: string;
  icon?: any;
  route?: string;
  component?: any;
  noCollapse?: boolean;
  collapse?: NewMenuRouteModel[];  // ทำให้เป็น optional
}
 */

//   export class MenuRouteModel {
//     type: string;
//     name?: string;
//     key: string;  // ใช้ menu_key ในการตั้งค่า
//     menu_id?: any;  // เพิ่มฟิลด์ menu_id สำหรับเปรียบเทียบ
//     icon?: string;
//     route?: string;
//     component?: string;
//     noCollapse?: boolean;
//     collapse?: MenuRouteModel[];  // Optional
//     title?: string;
//     parent_menu_id?: any;
// }

// export class NewMenuRouteModel {
//     type: string;
//     key: string;  // ใช้ menu_key ในการตั้งค่า
//     menu_id?: any;  // เพิ่มฟิลด์ menu_id สำหรับเปรียบเทียบ
//     name: string;
//     icon?: any;
//     route?: string;
//     component?: any;
//     noCollapse?: boolean;
//     collapse?: NewMenuRouteModel[];  // Optional
// }


/* 
  // การประกาศ object และเซ็ตค่า
const routes: MenuRouteModel[] = [
    {
      type: "collapse",
      key: "blank",
      name: "blank",
      icon: "content_paste",
      route: "/blank",
      component: "BlankPage",
      noCollapse: true
    },
    {
      type: "collapse",
      key: "checklist",
      name: "Check List",
      icon: "content_paste",
      route: "/checklist",
      component: "CheckList",
      noCollapse: true
    },
    {
      type: "collapse",
      key: "user",
      name: "User",
      icon: "content_paste",
      collapse: [
        {
          type: "collapse",
          key: "login",
          name: "Log-in",
          route: "/user/login",
          component: "Login"
        },
        {
          type: "collapse",
          key: "signup",
          name: "Sign-Up",
          route: "/user/signup",
          component: "Signup"
        }
      ]
    },
    {
      type: "divider",
      key: "divider-2"
    },
    {
      type: "title",
      key: "lab",
      title: "Lab Form"
    },
    {
      type: "collapse",
      key: "menu",
      name: "ตั้งค่าพื้นฐาน",
      icon: "content_paste",
      collapse: [
        {
          type: "collapse",
          key: "custdata",
          name: "ข้อมูลลูกค้าและสัตว์เลี้ยง",
          route: "/customer/custdata",
          component: "Infocustomer"
        },
        {
          type: "collapse",
          key: "settingHospital",
          name: "ข้อมูลโรงพยาบาล/คลินิค",
          route: "/SettingHospital",
          component: "SettingHospital"
        },
        {
          type: "collapse",
          key: "SettingLabPrice",
          name: "ตั้งราคา LAB",
          route: "/SettingLabPrice",
          component: "SettingLabPrice"
        },
        {
          type: "collapse",
          key: "LabHeader",
          name: "หัวออกรีพอร์ต LAB",
          route: "/LabHeader",
          component: "LabHeader"
        },
        {
          type: "collapse",
          key: "Employee",
          name: "ข้อมูลพนักงาน",
          route: "/employee",
          component: "Employee"
        },
        {
          type: "collapse",
          key: "Role",
          name: "สิทธิ์การใช้งาน",
          route: "/Role",
          component: "Role"
        }
      ]
    },
    {
      type: "collapse",
      key: "Editrole",
      name: "Editrole",
      icon: "content_paste",
      route: "/Editrole",
      component: "Editrole",
      noCollapse: true
    },
    {
      type: "collapse",
      key: "Editlabform",
      name: "Editlabform",
      icon: "content_paste",
      route: "/Editlabform",
      component: "Editlabform",
      noCollapse: true
    }
  ]; */