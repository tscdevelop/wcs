import React from "react";
import { Box } from "@mui/material";

//เต็มจอแทน ไม่เอา sidebar menu
export default function DisplayLayout({ children }) {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: "#f5f5f5",
        overflow: "hidden", // ❗ กัน sidebar โผล่
      }}
    >
      {children}
    </Box>
  );
}
