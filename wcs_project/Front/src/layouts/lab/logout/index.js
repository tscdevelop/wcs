import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { GlobalVar } from "common/GlobalVar";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // ลบ Token จาก Local Storage เมื่อเข้าเพจนี้
    GlobalVar.removeForLogout();
    
    // Redirect ไปที่หน้า Login
    navigate("/login");
  }, [navigate]);

  return (
    <div>
      <h2>Logging out...</h2>
    </div>
  );
}

export default Logout;
