// RoleViewModel.ts
export class RoleModel {
    role_code: string;
    role_name: string;
    role_description: string;
    role_is_active: boolean;
    permission_menus: {
        menu_id: number;
        permission_actions: string[];
    }[];
}

export class RoleCreateModel extends RoleModel {
    create_by: string;
}

export class RoleUpdateModel extends RoleModel {
    update_by: string;
}

export function mapToRoleModel(rawData: any[]): RoleModel {
    const role = new RoleModel();
    role.role_code = rawData[0].role_code;
    role.role_name = rawData[0].role_name;
    role.role_description = rawData[0].role_description;
    role.role_is_active = Boolean(rawData[0].role_is_active);
    role.permission_menus = [];

    const menuMap = new Map<number, any>();

    rawData.forEach(item => {
        if (!menuMap.has(item.menu_id)) {
            menuMap.set(item.menu_id, {
                menu_id: item.menu_id,
                permission_actions: []
            });
        }
        if (item.action_code) {
            menuMap.get(item.menu_id).permission_actions.push(item.action_code);
        }
    });

    role.permission_menus = Array.from(menuMap.values());

    return role;
}