// menu.model.ts
export class MenuModel {
    menu_id: number;
    menu_seq: string;
    menu_name: string;
    menu_name_desc: string;
    parent_menu_id : number; 
    menu_is_active: boolean;
    menu_actions: {
        menuact_id: number;
        action_code: string;
        action_name: string;
    }[];
}

export function mapToMenuModel(rawData: any[]): MenuModel[] {
    const menuMap = new Map<number, MenuModel>();

    rawData.forEach((data) => {
        const {
            menu_id,
            menu_seq,
            menu_name,
            menu_name_desc,
            parent_menu_id,
            menu_is_active,
            menuact_id,
            action_code,
            action_name,
        } = data;

        if (!menuMap.has(menu_id)) {
            menuMap.set(menu_id, {
                menu_id,
                menu_seq,
                menu_name,
                menu_name_desc,
                parent_menu_id,
                menu_is_active,
                menu_actions: [],
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

    return Array.from(menuMap.values());
}