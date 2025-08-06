// // role-menu.model.ts

// export class RoleMenuModel {
//     role_code: string;
//     role_name: string;
//     role_description: string;
//     role_is_active: boolean;
//     permission_menus: PermissionMenu[];
//   }
  
//   export class PermissionMenu {
//     menu_id: number;
//     menu_seq: string;
//     menu_name: string;
//     parent_menu_id: number;
//     menu_is_active: boolean;
//     menu_actions: PermissionAction[];
//   }
  
//   export class PermissionAction {
//     menuact_id: number;
//     action_code: string;
//     action_name: string;
//   }
  

// export function mapToRoleMenuModel(rawData: any[]): RoleMenuModel {
//     const role = new RoleMenuModel();
//     role.role_code = rawData[0].role_code;
//     role.role_name = rawData[0].role_name;
//     role.role_description = rawData[0].role_description;
//     role.role_is_active = Boolean(rawData[0].role_is_active);
//     role.permission_menus = [];

//     const menuMap = new Map<number, PermissionMenu>();

//     rawData.forEach((data) => {
//         const {
//             menu_id,
//             menu_seq,
//             menu_name,
//             parent_menu_id,
//             menu_is_active,
//             menuact_id,
//             action_code,
//             action_name,
//         } = data;

//         if (!menuMap.has(menu_id)) {
//             menuMap.set(menu_id, {
//                 menu_id,
//                 menu_seq,
//                 menu_name,
//                 parent_menu_id,
//                 menu_is_active: Boolean(menu_is_active),
//                 menu_actions: []
//             });
//         }

//         if (menuact_id) {
//             menuMap.get(menu_id)!.menu_actions.push({
//                 menuact_id,
//                 action_code,
//                 action_name,
//             });
//         }
//     });

//     role.permission_menus = Array.from(menuMap.values());

//     return role;
// }



//V.2
// role-menu.model.ts

// export class RoleMenuModel {
//     role_code: string;
//     role_name: string;
//     role_description: string;
//     role_is_active: boolean;
//     permission_menus: PermissionMenu[];
// }

// export class PermissionMenu {
//     menu_id: number;
//     menu_seq: string;
//     menu_name: string;
//     parent_menu_id: number;
//     menu_is_active: boolean;
//     menu_route: string;
//     menu_key: string;
//     menu_icon: string;
//     menu_component: string;
//     menu_actions: PermissionAction[];
// }

// export class PermissionAction {
//     menuact_id: number;
//     action_code: string;
//     action_name: string;
// }

// export function mapToRoleMenuModel(rawData: any[]): RoleMenuModel {
//     const role = new RoleMenuModel();
//     role.role_code = rawData[0].role_code;
//     role.role_name = rawData[0].role_name;
//     role.role_description = rawData[0].role_description;
//     role.role_is_active = Boolean(rawData[0].role_is_active);
//     role.permission_menus = [];

//     const menuMap = new Map<number, PermissionMenu>();

//     rawData.forEach((data) => {
//         const {
//             menu_id,
//             menu_seq,
//             menu_name,
//             parent_menu_id,
//             menu_is_active,
//             menu_route,
//             menu_key,
//             menu_icon,
//             menu_component,
//             menuact_id,
//             action_code,
//             action_name,
//         } = data;

//         if (!menuMap.has(menu_id)) {
//             menuMap.set(menu_id, {
//                 menu_id,
//                 menu_seq,
//                 menu_name,
//                 parent_menu_id,
//                 menu_is_active: Boolean(menu_is_active),
//                 menu_route,
//                 menu_key,
//                 menu_icon,
//                 menu_component,
//                 menu_actions: []
//             });
//         }

//         if (menuact_id) {
//             menuMap.get(menu_id)!.menu_actions.push({
//                 menuact_id,
//                 action_code,
//                 action_name,
//             });
//         }
//     });

//     role.permission_menus = Array.from(menuMap.values());

//     return role;
// }




//v.3
// role-menu.model.ts

export class RoleMenuModel {
    role_code: string;
    role_name: string;
    role_description: string;
    role_is_active: boolean;
    permission_menus: PermissionMenu[];
    menu_routes: MenuRoute[]; // เพิ่มเมนูรูท
}

export class PermissionMenu {
    menu_id: number;
    menu_seq: string;
    menu_name: string;
    parent_menu_id: number;
    menu_is_active: boolean;
    menu_route: string;
    menu_key: string;
    menu_icon: string;
    menu_component: string;
    menu_actions: PermissionAction[];
}

export class PermissionAction {
    menuact_id: number;
    action_code: string;
    action_name: string;
}

// เพิ่ม MenuRoute เพื่อเก็บข้อมูลเมนูรูท
export class MenuRoute {
    route: string;
    key: string;
    icon: string;
    component: string;
}

export function mapToRoleMenuModel(rawData: any[]): RoleMenuModel {
    const role = new RoleMenuModel();
    role.role_code = rawData[0].role_code;
    role.role_name = rawData[0].role_name;
    role.role_description = rawData[0].role_description;
    role.role_is_active = Boolean(rawData[0].role_is_active);
    role.permission_menus = [];
    role.menu_routes = []; // Initialize menu_routes

    const menuMap = new Map<number, PermissionMenu>();

    rawData.forEach((data) => {
        const {
            menu_id,
            menu_seq,
            menu_name,
            parent_menu_id,
            menu_is_active,
            menu_route,
            menu_key,
            menu_icon,
            menu_component,
            menuact_id,
            action_code,
            action_name,
        } = data;

        // Handle menu routes
        const routeInfo = {
            route: menu_route || '',
            key: menu_key || '',
            icon: menu_icon || '',
            component: menu_component || '',
        };
        if (!role.menu_routes.some(route => route.route === routeInfo.route)) {
            role.menu_routes.push(routeInfo);
        }

        if (!menuMap.has(menu_id)) {
            menuMap.set(menu_id, {
                menu_id,
                menu_seq,
                menu_name,
                parent_menu_id,
                menu_is_active: Boolean(menu_is_active),
                menu_route,
                menu_key,
                menu_icon,
                menu_component,
                menu_actions: []
            });
        }

        if (menuact_id) {
            menuMap.get(menu_id)!.menu_actions.push({
                menuact_id,
                action_code,
                action_name,
            });
        }
    });

    role.permission_menus = Array.from(menuMap.values());

    return role;
}
