import { MenuItem, Select, FormControl, Typography, Button , Box} from "@mui/material";
import { styled } from "@mui/material/styles";
import MDBadge from "components/MDBadge";
//import * as lang from "utils/langHelper";


export const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,  // ใช้สี primary จาก theme ที่ประกาศใน color.js
  textAlign: "left",
}));

export const StyledFormControl = styled(FormControl)({
  "& .MuiInputLabel-root": {
    top: "8px",
    lineHeight: "1.5",
    transform: "translate(14px, 0) scale(1)",
    zIndex: 1,
    position: "absolute",
    backgroundColor: "white",
    padding: "0 4px",
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(14px, -17px) scale(0.75)",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiOutlinedInput-root": {
    height: "50px",
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
});

export const StyledMenuItem = styled(MenuItem)({
  height: "50px",
});

export const StyledSelect = styled(Select)({
  height: "50px",
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiSelect-icon": {
    display: "block",
    right: "15px",
  },
});

export const StyledButtons = styled(Button)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}`,  // ใช้สี primary จาก theme
  "&:hover": {
    backgroundColor: "#1C86EE",
  },
  "& .MuiButton-label": {
    color: "#000000",
  },
}));

export const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[300],
  borderRadius: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%", // ขยายเต็มกรอบ
  height: "140px",
  minWidth: "100px",
  maxWidth: "300px",
  flexGrow: 1, // ให้ยืดหยุ่นได้
}));

// ปุ่ม Edit
export const StyledEditButton = styled(Button)(() => ({
  backgroundColor: "#FFB534", // สีเหลือง
  "&:hover": {
    backgroundColor: "#FB8C00", // สีเหลืองเมื่อ Hover
  },
  minWidth: "40px",
  minHeight: "40px",
  // borderRadius: "5%", // ทำให้เป็นวงกลม
  padding: 0,
  color: "#fff", // สีไอคอน
}));

// ปุ่ม Delete
export const StyledDeleteButton = styled(Button)(() => ({
  backgroundColor: "#FF0000", // สีแดง
  "&:hover": {
    backgroundColor: "#D32F2F", // สีแดงเข้มเมื่อ Hover
  },
  minWidth: "40px",
  minHeight: "40px",
  // borderRadius: "5%", // ทำให้เป็นวงกลม
  padding: 0,
  color: "#fff", // สีไอคอน
}));

// ปุ่ม กำหนด role
export const StyledGreenOutlineButton = styled(Button)(() => ({
  backgroundColor: "#008000", // สีเขียว
  "&:hover": {
    backgroundColor: "#006400", // สีเขียวเข้มเมื่อ Hover
  },
  minWidth: "40px",
  minHeight: "40px",
  // borderRadius: "5%", // ทำให้เป็นวงกลม
  padding: 0,
  color: "#fff", // สีไอคอน
}));

// Badge
export const getBadge = (condition, badgeContent, isActive = true) => {
  if (!condition) {
    return null; // ไม่แสดงอะไรเลยหากไม่ตรงเงื่อนไข
  }

  const badgeColorMap = {
    success: "#28a745",
    error: "#dc3545",
  };

  const badgeColor = isActive ? "success" : "error";

  return (
    <Box mr={1} display="flex" alignItems="center" gap={1}>
      <MDBadge
        variant="contained"
        size="xs"
        color={badgeColor}
        container
        badgeContent={
          <>
            <span
              className="status-circle"
              style={{ backgroundColor: badgeColorMap[badgeColor] }}
            ></span>
            {badgeContent}
          </>
        }
      />
    </Box>
  );
};

