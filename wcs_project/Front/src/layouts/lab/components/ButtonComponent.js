    import React from "react";
    import MDButton from "components/MDButton";
    import { StyledEditButton, StyledDeleteButton, StyledGreenOutlineButton } from "common/Global.style";
    import * as lang from "utils/langHelper";
    
    // ไอคอนที่ใช้ในปุ่มต่าง ๆ
    import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
    import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
    import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
    import BorderColorIcon from "@mui/icons-material/BorderColor";
    import DeleteIcon from "@mui/icons-material/Delete";
    import SearchIcon from "@mui/icons-material/Search";
    import CheckIcon from "@mui/icons-material/Check";
    import CalculateIcon from "@mui/icons-material/Calculate";
    import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
    import ChatIcon from "@mui/icons-material/Chat";
    import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
    import PostAddIcon from "@mui/icons-material/PostAdd";
    import PrintIcon from "@mui/icons-material/Print";
    
    // ตัวเลือกประเภทปุ่ม
    const BUTTON_TYPES = {
    // ชื่อปุ่มและไอคอน
    saveIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "primary",
        label: () => lang.btnSave(),
        icon: <SaveOutlinedIcon />,
        variant: "contained",
    },
    // ชื่อปุ่ม
    save: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "primary",
        label: () => lang.btnSave(),
        icon: "",
        variant: "contained",
    },
    // ไอคอน
    iconSave: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "primary",
        label: "",
        icon: <SaveOutlinedIcon />,
        variant: "contained",
    },
    cancelIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "error",
        label: () => lang.btnCancel(), 
        icon: <ClearOutlinedIcon />,
        variant: "outlined",
    },
    cancel: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "error",
        label: () => lang.btnCancel(), 
        icon: "",
        variant: "contained",
    },
    cancelcolor: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "error",
        label: () => lang.btnCancel(), 
        icon: "",
        variant: "contained",
    },
    iconCancel: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "error",
        label: "",
        icon: <ClearOutlinedIcon />,
        variant: "outlined",
    },
    addIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "info",
        label: () => lang.btnAdd(),
        icon: <AddCircleOutlineOutlinedIcon />,
        variant: "contained",
    },
    add: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "info",
        label: () => lang.btnAdd(),
        icon: "",
        variant: "contained",
    },
    iconAdd: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "info",
        label: "",
        icon: <AddCircleOutlineOutlinedIcon />,
        variant: "contained",
    },
    editIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "warning",
        label: () => lang.btnEdit(),
        icon: <BorderColorIcon />,
        variant: "contained",
    },
    edit: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "warning",
        label: () => lang.btnEdit(),
        icon: "",
        variant: "contained",
    },
    iconEdit: {
        Button: StyledEditButton, // ใช้ปุ่มสไตล์เฉพาะ
        color: "warning",
        label: "",
        icon: <BorderColorIcon />,
        variant: "outlined",
    },
    deleteIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "error",
        label: () => lang.btnDelete(),
        icon: <DeleteIcon />,
        variant: "contained",
    },
    delete: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        color: "error",
        label: () => lang.btnDelete(),
        icon: "",
        variant: "contained",
    },
    iconDelete: {
        Button: StyledDeleteButton, // ใช้ปุ่มสไตล์เฉพาะ
        color: "error",
        label: "",
        icon: <DeleteIcon />,
        variant: "outlined",
    },
    searchIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnSearch(),
        icon: <SearchIcon />,
        color: "info",
        variant: "contained",
    },
    search: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnSearch(),
        icon: "",
        color: "info",
        variant: "contained",
    },
    iconSearch: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: "",
        icon: <SearchIcon />,
        color: "primary",
        variant: "contained",
    },
    okIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnOK(),
        icon: <CheckIcon />,
        color: "primary",
        variant: "contained",
    },
    ok: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnOK(),
        icon: "",
        color: "primary",
        variant: "contained",
    },
    iconOk: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: "",
        icon: <CheckIcon />,
        color: "primary",
        variant: "contained",
    },
    calculateIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnAutoCal(),
        icon: <CalculateIcon />,
        color: "dark",
        variant: "contained",
    }, 
    calculate: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnAutoCal(),
        icon: "",
        color: "dark",
        variant: "contained",
    }, 
    iconCalculate: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: "",
        icon: <CalculateIcon />,
        color: "dark",
        variant: "contained",
    }, 
    permissionIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnPermission(),
        icon: <VerifiedUserIcon />,
        color: "success",
        variant: "contained",
    },
    permission: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnPermission(),
        icon: "",
        color: "success",
        variant: "contained",
    },
    iconPermission: {
        Button: StyledGreenOutlineButton, // ใช้ปุ่มสไตล์เฉพาะ
        label: "",
        icon: <VerifiedUserIcon />,
        color: "success",
        variant: "contained",
    },
    addInfoIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnAddInfo(),
        icon: <ChatIcon />,
        color: "info",
        variant: "outlined",
    },
    addInfo: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnAddInfo(),
        icon: "",
        color: "info",
        variant: "outlined",
    },
    iconAddInfo: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: "",
        icon: <ChatIcon />,
        color: "info",
        variant: "outlined",
    },
    submenuIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnSubmenu(),
        icon: <FormatListBulletedIcon />,
        color: "primary",
        variant: "outlined",
    },
    submenu: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnSubmenu(),
        icon: "",
        color: "primary",
        variant: "outlined",
    },
    iconSubmenu: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: "",
        icon: <FormatListBulletedIcon />,
        color: "primary",
        variant: "outlined",
    },
    registerIcon: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnRegistCustPet(),
        icon: <PostAddIcon />,
        color: "info",
        variant: "contained",
    },
    register: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnRegistCustPet(),
        icon: "",
        color: "info",
        variant: "contained",
    },
    iconRegister: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: "",
        icon: <PostAddIcon />,
        color: "info",
        variant: "contained",
    },
    login: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnLogin(),
        icon: "",
        color: "warning",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    export: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnExport(),
        icon: "",
        color: "error",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    report: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnReport(),
        icon: "",
        color: "error",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    import: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnImport(),
        icon: "",
        color: "error",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },

    bill: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnCreateBill(),
        icon: "",
        color: "info",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    confirmedit: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnComfirmEdit(),
        icon: "",
        color: "primary",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    waybill: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnCreateWayBill(),
        icon: "",
        color: "info",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    Document: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnPrintDoc(),
        icon: "",
        color: "info",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    Approve: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnApprove(),
        icon: "",
        color: "primary",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    ConfirmUse: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnConfirmUse(),
        icon: "",
        color: "primary",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    ConfirmMenu: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnConfirmMenu(),
        icon: "",
        color: "primary",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    Confirm: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnConfirm(),
        icon: "",
        color: "primary",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    return: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnReturn(),
        icon: "",
        color: "warning",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    master: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnMaster(),
        icon: "",
        color: "warning",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    finish: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnFinish(),
        icon: "",
        color: "primary",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    ConfirmWithdraw: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnConfirmWD(),
        icon: "",
        color: "primary",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    Iconprint: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnPrint(),
        icon: <PrintIcon/>,
        color: "info",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    print: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnPrint(),
        icon: <PrintIcon/>,
        color: "primary",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    rejected: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnRejected(),
        icon: "",
        color: "error",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    BomAdd: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnBom(),
        icon: "",
        color: "info",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },
    ConfirmReturn: {
        Button: MDButton, // ใช้ปุ่มเริ่มต้น
        label: () => lang.btnConfirmReturn(),
        icon: "",
        color: "primary",
        variant: "contained",
        sx: {
            width: "200px", // กำหนดความกว้างที่ต้องการ
        },
    },



    };

    const ButtonComponent = ({ type, onClick }) => {
        const buttonConfig = BUTTON_TYPES[type] || BUTTON_TYPES.default; // ใช้ default หากไม่เจอ type ที่กำหนด

    if (!buttonConfig) {
        console.error(`Button type "${type}" is not defined.`);
        return null;
    }

    const StyledButton = buttonConfig.Button;

    return (
        <StyledButton
        variant={buttonConfig.variant}
        color={buttonConfig.color}
        // startIcon={buttonConfig.icon}
        onClick={onClick}
        sx={{
            display: "flex", // ใช้ Flexbox สำหรับการจัดตำแหน่ง
            justifyContent: "center", // จัดให้อยู่ตรงกลางในแนวนอน
            alignItems: "center", // จัดให้อยู่ตรงกลางในแนวแกน Y
            textAlign: "center", // จัดข้อความให้อยู่ตรงกลาง
            gap: buttonConfig.icon && buttonConfig.label ? "8px" : "0", // ระยะห่างระหว่างไอคอนกับข้อความ
            padding: "6px 16px", // Padding มาตรฐานของ Material-UI
        }}
        >
        {buttonConfig.icon}
        {/* {buttonConfig.label} */}
        {typeof buttonConfig.label === "function" ? buttonConfig.label() : buttonConfig.label}
        </StyledButton>
    );
    };

    export default ButtonComponent;
