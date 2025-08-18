import React, { useState } from "react";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import IllustrationLayout from "layouts/authentication/components/IllustrationLayout";
import bgImage from "assets/images/bg-profile.jpeg";
// import lgImage from "assets/images/logo.png";
import UserApi from "../../../api/UserAPI";
import { GlobalVar } from "../../../common/GlobalVar";
import MDTypography from "components/MDTypography";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";


function LabLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [errorMessage, setErrorMessage] = useState(""); // state สำหรับข้อความ error
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage(""); // เคลียร์ error ก่อนเริ่มทำการ login
    try {
      const response = await UserApi.login(username, password);
      if (response.isCompleted && !response.isError) {
        const data = response.data;
        const token = data.token;
        const userID = data.user_id;
        const userName = data.username;
        const role = data.role_code;

        if (token && userID && userName) {
          GlobalVar.setToken(token);
          GlobalVar.setUserId(userID);
          GlobalVar.setRole(role);
          GlobalVar.setUsername(userName);



          navigate("/home");
        } else {
          setErrorMessage("ล็อกอินไม่สำเร็จ: ข้อมูลไม่ครบถ้วน");
          console.error("ล็อกอินไม่สำเร็จ: ข้อมูลไม่ครบถ้วน", data);
        }
      } else {
        setErrorMessage("ล็อกอินไม่สำเร็จ");
      }
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดระหว่างการล็อกอิน");
      console.error("เกิดข้อผิดพลาดระหว่างการล็อกอิน", error);
    }
  };



  return (
    <IllustrationLayout description="WCS" illustration={bgImage}>
      <MDBox pt={6} component="form" role="form" onSubmit={handleLogin} >
        <Grid
          container
          direction="column"
          alignItems="center"
          spacing={2}
          justifyContent="center"
        >
          {/* Username Field */}
          <Grid
            item
            sx={{
              width: { xs: "100%", sm: "100%" },
              maxWidth: {
                xs: "none",
                sm: "none",
                md: 450,
                lg: 500,
                xl: 600,
              },
              mx: "auto",
              p: { xs: 2, sm: 0 },
            }}
          >

            <MDInput
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              placeholder="Username"
            />
          </Grid>

          {/* Password Field */}
          <Grid
            item
            sx={{
              width: { xs: "100%", sm: "100%" },
              maxWidth: {
                xs: "none",
                sm: "none",
                md: 450,
                lg: 500,
                xl: 600,
              },
              mx: "auto",
              p: { xs: 2, sm: 0 },
            }}
          >
            <MDBox>
              <MDInput
                label="Password"
                type={showPassword ? "text" : "password"} // 👈 Toggle type
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                placeholder="Password"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </MDBox>

          </Grid>

          {/* Language Selection
          <Grid item>
            <Box display="flex" justifyContent="center" gap={2}>
              <MDButton
                onClick={() => handleLanguageChange("th")}
                variant={language === "th" ? "contained" : "outlined"}
                color="warning"
                sx={{ minWidth: 70, height: 30, padding: "0 8px" }}
                startIcon={
                  <Box
                    component="img"
                    src={thaiflag}
                    alt="TH"
                    sx={{
                      width: 25,
                      height: 25,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                }
              >
                TH
              </MDButton>

              <MDButton
                onClick={() => handleLanguageChange("en")}
                variant={language === "en" ? "contained" : "outlined"}
                color="warning"
                sx={{ minWidth: 70, height: 30, padding: "0 8px" }}
                startIcon={
                  <Box
                    component="img"
                    src={ukflag}
                    alt="EN"
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                }
              >
                EN
              </MDButton>
            </Box>
          </Grid> */}

          {/* Login Button */}
          <Grid
            item
            sx={{
              width: { xs: "100%", sm: "100%" },
              maxWidth: {
                xs: "none",
                sm: "none",
                md: 450,
                lg: 500,
                xl: 600,
              },
              mx: "auto",
              p: { xs: 2, sm: 0 },
            }}
          >
            <MDBox mt={2} >
              <MDButton
                variant="gradient"
                size="large"
                fullWidth
                type="submit"
                sx={{
                  background: "linear-gradient(180deg, #2c2c2c, #1a1a1a)",
                  color: "#fff", // ตัวหนังสือสีขาว
                }}
              >
                Login
              </MDButton>
            </MDBox>

          </Grid>

          {/* แสดงข้อความ Error */}
          {errorMessage && (
            <Grid
              item
              container
              justifyContent="flex-end"
              sx={{
                width: { xs: "100%", sm: "100%" },
                maxWidth: {
                  xs: "none",
                  sm: "none",
                  md: 450,
                  lg: 500,
                  xl: 600,
                },
                mx: "auto",
                p: { xs: 2, sm: 0 },
              }}
            >
              <MDTypography variant="caption" color="error" align="center">
                {errorMessage}
              </MDTypography>
            </Grid>
          )}
        </Grid>
      </MDBox>
    </IllustrationLayout>
  );
}

export default LabLogin;
