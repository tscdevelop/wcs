// common/ApiResponse.js
class ApiResponse {
  isCompleted = false; // สถานะการกระทำ
  message = "";        // ข้อความที่แจ้งกลับ
  data = null;        // ข้อมูลที่ส่งกลับ
  isError = false;    // สถานะการเกิดความผิดพลาด
  error = "";         // ข้อความ error

  constructor(init = {}) {
    Object.assign(this, init);
  }
}

module.exports = ApiResponse;
