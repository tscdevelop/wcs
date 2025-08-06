// /**
// =========================================================
// * Material Dashboard 2 PRO React - v2.2.0
// =========================================================

// * Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
// * Copyright 2023 Creative Tim (https://www.creative-tim.com)

// Coded by www.creative-tim.com

//  =========================================================

// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// */

// // prop-types is a library for typechecking of props
// import PropTypes from "prop-types";

// // @mui material components
// import Grid from "@mui/material/Grid";

// // Material Dashboard 2 PRO React components
// import MDBox from "components/MDBox";
// import MDTypography from "components/MDTypography";

// // Material Dashboard 2 PRO React examples
// import DefaultNavbar from "examples/Navbars/DefaultNavbar";
// import PageLayout from "examples/LayoutContainers/PageLayout";

// // Material Dashboard 2 PRO React page layout routes
// //import pageRoutes from "page.routes";

// // Material Dashboard 2 PRO React context
// import { useMaterialUIController } from "context";

// function IllustrationLayout({ header, title, description, illustration, children }) {
//   const [controller] = useMaterialUIController();
//   const { darkMode } = controller;

//   return (
//     <PageLayout background="white">
//       <Grid
//         container
//         sx={{
//           height: "100vh",
//           backgroundColor: ({ palette: { background, white } }) =>
//             darkMode ? background.default : white.main,
//         }}
//       >
//         {/* Full Background Image */}
//         <Grid
//           item
//           xs={12}
//           sx={{
//             position: "relative",
//             width: "100%",
//             height: "100%",
//             backgroundImage: `url(${illustration})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//           }}
//         >
//           {/* Login Card */}
//           <MDBox
//             display="flex"
//             justifyContent="center"
//             alignItems="center"
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               width: { xs: "80%", sm: "40%", md: "25%" }, // ลดความกว้างของกรอบ
//               minHeight: "450px", // เพิ่มความสูงขั้นต่ำ
//               backgroundColor: "#FFFFFF", // กำหนดพื้นหลังให้สีขาว
//               borderRadius: "25px", // มุมโค้งของกรอบ
//               boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", // เงาของกรอบ
//               p: 4,
//               zIndex: 2,
//             }}
//           >
//             <MDBox width="100%">
//               {/* Header */}
//               {header || (
//                 <>
//                   <MDBox mb={3} textAlign="center">
//                   <img 
//                     src={title} // ใส่ URL ของรูปโลโก้ที่นี่
//                     alt="Logo" 
//                     style={{ maxWidth: "300px", height: "150px" }} // ปรับขนาดรูปโลโก้
//                   />
//                   </MDBox>
                  
//                   <MDBox mb={2} textAlign="center">
//                     <MDTypography variant="body2" color="text">
//                       {description}
//                     </MDTypography>
//                   </MDBox>
//                 </>
//               )}
//               {/* Children (form content) */}
//               {children}
//             </MDBox>
//           </MDBox>
//         </Grid>
//       </Grid>
//     </PageLayout>
//   );
// }

// // Setting default values for the props of IllustrationLayout
// IllustrationLayout.defaultProps = {
//   header: "",
//   title: "",
//   description: "",
//   illustration: "",
// };

// // Typechecking props for the IllustrationLayout
// IllustrationLayout.propTypes = {
//   header: PropTypes.node,
//   title: PropTypes.string,
//   description: PropTypes.string,
//   children: PropTypes.node.isRequired,
//   illustration: PropTypes.string,
// };

// export default IllustrationLayout;




/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import PageLayout from "examples/LayoutContainers/PageLayout";

// Material Dashboard 2 PRO React context
import { useMaterialUIController } from "context";

function IllustrationLayout({ header, title, description, illustration, children }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <PageLayout background="white">
      <Grid
        container
        sx={{
          height: "100vh",
          backgroundColor: ({ palette: { background, white } }) =>
            darkMode ? background.default : white.main,
        }}
      >
        {/* Full Background Image */}
        <Grid
          item
          xs={12}
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundImage: `url(${illustration})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Login Card */}
          <MDBox
             display="flex"
             justifyContent="center"
             alignItems="center"
             sx={{
               position: "absolute",
               top: "50%",
               left: "50%",
               transform: "translate(-50%, -50%)",
               width: { xs: "80%", sm: "40%", md: "25%" },
               // เพิ่ม media query สำหรับ tablet
               "@media (min-width:768px) and (max-width:1024px)": {
                 width: "50%", // ปรับให้ Login Card มีความกว้างมากขึ้นในช่วง tablet
               },
               minHeight: "450px",
               backgroundColor: "#FFFFFF",
               borderRadius: "25px",
               boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
               p: 4,
               zIndex: 2,
             }}
          >
            <MDBox width="100%">
              {/* Header */}
              {header || (
                <>
                  <MDBox mb={3} textAlign="center">
                    <img
                      src={title}  // URL ของรูปโลโก้
                      alt="Logo"
                      style={{
                        width: "100%",
                        maxWidth: "300px",
                        height: "auto",
                      }}
                    />
                  </MDBox>

                  <MDBox mb={2} textAlign="center">
                    <MDTypography variant="body2" color="text">
                      {description}
                    </MDTypography>
                  </MDBox>
                </>
              )}

              {/* Children (form content) */}
              {children}
            </MDBox>
          </MDBox>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

// Setting default values for the props of IllustrationLayout
IllustrationLayout.defaultProps = {
  header: "",
  title: "",
  description: "",
  illustration: "",
};

// Typechecking props for the IllustrationLayout
IllustrationLayout.propTypes = {
  header: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  illustration: PropTypes.string,
};

export default IllustrationLayout;
