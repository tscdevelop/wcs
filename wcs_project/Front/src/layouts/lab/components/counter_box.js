import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const CounterBox = ({ counter }) => {
  const isWaiting = counter.status === "WAITING";
  const isIdle = counter.status === "IDLE";

  return (
    <MDBox textAlign="center">
      {/* Counter number */}
      {/*IDLE=ดำ , สถานะเปลี่ยนสีค่อยเปลี่ยน*/}
      <MDTypography
        variant="h3"
        sx={{ 
            color: isIdle ? "#000" : counter.color,
            mb: 1.5 
        }}
      >
        {counter.id}
      </MDTypography>

      {/* Square box */}
      <MDBox
        sx={{
          width: 135,
          height: 165,
          border: "2px solid #000",
          backgroundColor: isIdle ? "#FFF" : counter.color,
          position: "relative",
          mx: "auto",
        }}
      >
        {isWaiting && (
          <MDTypography
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "2.3rem",
            }}
          >
            WAITING
          </MDTypography>
        )}
      </MDBox>

      {/* Quantity */}
      <MDTypography variant="h5" sx={{ color: counter.color, mt: 4.5 }}>
        {counter.actual}/{counter.plan}
      </MDTypography>
    </MDBox>
  );
};

export default CounterBox;
