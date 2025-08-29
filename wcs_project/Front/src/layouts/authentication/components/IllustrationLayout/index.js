
import PropTypes from "prop-types";

import { Box } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PageLayout from "examples/LayoutContainers/PageLayout";
import { useMaterialUIController } from "context";

// โลโก้ตัวอย่าง (SVG กล่อง)

function CubeLogo({ size = 128, color = "#2b2b6a", strokeWidth = 3.2, ...props }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <path
        d="M12 20v24l20 10 20-10V20L32 10 12 20z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"  // 👈 กันสโตรกหนาขึ้นเวลา scale
      />
      <path
        d="M32 10v40"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M12 20l20 10 20-10"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </Box>
  );
}



function IllustrationLayout({ header, title, description, illustration, children }) {
  const [controller] = useMaterialUIController();
  // eslint-disable-next-line no-unused-vars
  const { darkMode } = controller;

  return (
    <PageLayout background="white">
      {/* พื้นหลังรูป เต็มจอจริงๆ */}
      <MDBox
        sx={{
          position: "relative",
          minHeight: "100vh",
          height: "100vh",
          backgroundImage: `url(${illustration})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
        }}
      >
        {/* แผงซ้าย: ปีกขาวปลายแหลม */}
        <MDBox
          component="section"
          sx={{
            position: "absolute",
            inset: 0,
            width: { xs: "100%", md: "65vw" },      // ความกว้างปีก
            backgroundColor: "#ffffff",
            clipPath: {
              xs: "none",
              md: "polygon(0 0, 62% 0, 72% 50%, 62% 100%, 0 100%)",
            },

            // ✅ จัดตำแหน่งบล็อกฟอร์มให้ “ชิดปลายมุมและสูงขึ้น”
            display: "flex",
            justifyContent: { xs: "center", md: "flex-start" }, // ชิดขวา (ใกล้ปลายมุม)
            alignItems: { xs: "center", md: "flex-start" },   // เริ่มจากบนแทนที่จะกึ่งกลาง
            pt: { xs: 0, md: "20vh" },                        // ดันลงจากขอบบน ~14vh
            pr: { xs: 0, md: "6vw" },                         // ระยะห่างจากปลายมุม
            pl: { xs: 0, md: "10vw" },
          }}
        >
          {/* กล่องคอนเทนต์ฟอร์ม */}
          <MDBox sx={{ width: "100%", maxWidth: 460, px: { xs: 4, md: 0 } }}>
            {header || (
              <MDBox textAlign="center" mb={4} sx={{ ml: { xs: 0, md: 0 } }}>
                <CubeLogo />
                <MDTypography
                  variant="h3"
                  sx={{ mt: 2, fontWeight: 700, color: "#151a2d" }}
                >
                  {title || "Sign In"}
                </MDTypography>
                {description ? (
                  <MDTypography variant="button" color="text" sx={{ opacity: 0.7 }}>
                    {description}
                  </MDTypography>
                ) : null}
              </MDBox>
            )}

            {/* ฟอร์มที่ส่งมาจาก children */}
            {children}
          </MDBox>
        </MDBox>
      </MDBox>
    </PageLayout>
  );
}

IllustrationLayout.defaultProps = {
  header: "",
  title: "",
  description: "",
  illustration: "",
};

IllustrationLayout.propTypes = {
  header: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  illustration: PropTypes.string,
};

export default IllustrationLayout;
