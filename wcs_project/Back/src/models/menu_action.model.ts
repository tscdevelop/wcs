export class MenuActionModel {
    role_code: string;
    menu_id: number;
    permission_actions: Record<string, boolean>;  // สิทธิ์การทำงานของเมนู (action_code: true/false)

    constructor(role_code: string, menu_id: number, permission_actions: Record<string, boolean>) {
        this.role_code = role_code;
        this.menu_id = menu_id;
        this.permission_actions = permission_actions;
    }
}



// export class MenuActionModel {
//     role_code: string;
//     menu_id: number;          // รหัสเมนู
//     permission_actions: string[];  // สิทธิ์การทำงานของเมนู (เช่น ACT_CREATE, LAB_CREATE)

//     constructor(role_code: string, menu_id: number, permission_actions: string[]) {
//         this.role_code = role_code;
//         this.menu_id = menu_id;
//         this.permission_actions = permission_actions;
//     }
// }

