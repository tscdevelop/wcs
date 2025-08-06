
// คำนำหน้าชื่อ
export const prefixes = [
    { value: "นาย", text: "นาย" },
    { value: "นาง", text: "นาง" },
    { value: "นางสาว", text: "นางสาว" },
    { value: "LGBTQ", text: "LGBTQ" },
    { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  ];
  
  // ศาสนา
  export const religions = [
    { value: "พุทธ", text: "พุทธ" },
    { value: "คริสต์", text: "คริสต์" },
    { value: "อิสลาม", text: "อิสลาม" },
    { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  ];
  
  // สัญชาติ
  export const nationalities = [
    { value: "ไทย", text: "ไทย" },
    { value: "จีน", text: "จีน" },
    { value: "อื่นๆ", text: "อื่นๆ" },
    { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  ];

  // เชื้อชาติ
  export const ethnicity = [
    { value: "ไทย", text: "ไทย" },
    { value: "จีน", text: "จีน" },
    { value: "เอเชีย", text: "เอเชีย" },
    { value: "อื่นๆ", text: "อื่นๆ" },
    { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  ];

  // กรุ๊ปเลือด
  export const bloodGroups = [
    { value: "O", text: "O" },
    { value: "A", text: "A" },
    { value: "B", text: "B" },
    { value: "AB", text: "AB" },
    { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  ];

  // ประเภทสัตว์เลี้ยง
  export const petTypes = [
    { value: "สุนัข", text: "สุนัข" },
    { value: "แมว", text: "แมว" },
    { value: "หนู", text: "หนู" },
    { value: "งู", text: "งู" },
    { value: "อื่นๆ", text: "อื่นๆ" },
    { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  ];

  // ผู้
  export const petGenders = [
    { value: "ผู้", text: "ผู้" },
    { value: "เมีย", text: "เมีย" },
    { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  ];

  
  // export const department = [
  //   { value: "HOSP0002-D001", text: "ฝ่ายไอที" },
  //   { value: "HOSP0002-D002", text: "ฝ่ายการตลาด" },
  //   { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  // ];
  export const sex = [
    { value: "ชาย", text: "ชาย" },
    { value: "หญิง", text: "หญิง" },
    { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  ];
  // export const position = [
  //   { value: "HOSP0002-P001", text: "นักพัฒนา" },
  //   { value: "ไม่ระบุ", text: "ไม่ระบุ" }
  // ];

  export const role = [
    { value: "ADMIN", text: "ADMIN" },
    { value: "LAB_HEAD", text: "LAB_HEAD" },
    { value: "TESTTYY", text: "TESTTYY" },
    { value: "LAB_STAFF", text: "LAB_STAFF" },
    { value: "VETERINARY", text: "VETERINARY" },
    { value: "ADDROLE", text: "ADDROLE" }

  ];


// เดือน
export const months = [
  { value: 1, text: "1" },
  { value: 2, text: "2" },
  { value: 3, text: "3" },
  { value: 4, text: "4" },
  { value: 5, text: "5" },
  { value: 6, text: "6" },
  { value: 7, text: "7" },
  { value: 8, text: "8" },
  { value: 9, text: "9" },
  { value: 10, text: "10" },
  { value: 11, text: "11" },
  { value: 12, text: "12" }
];

export const statusData =[
  { value: "WAIT_INSP", text: "รอรับสิ่งส่งตรวจ" },
  { value: "WAIT_LAB", text: "รอส่งตรวจlab" },
  { value: "SOME_LAB", text: "สถานะ 2" },
  { value: "REJECT_INSP", text: "ปฎิเสธการส่งตรวจ" }
 
];
export const labType =[
  { value: "LAB_IN ", text: "LAB ใน" },
  { value: "LAB_EXT", text: "LAB นอก" }

];

export const labSaleType =[
  { value: "MANUAL", text: "MANUAL" },
  { value: "PERCENT", text: "PERCENT" },
  { value: "AMOUNT", text: "AMOUNT" }

];

export const empStatus =[
  { value: "WORK", text: "ทำงาน" },
  { value: "RESIGN", text: "ลาออก" },
  { value: "TRIAL", text: "ทดลองงาน" },
  { value: "SUSPEND", text: "พักงาน" },
  { value: "FIRED", text: "ไล่ออก" },
];


export const Zone =[
  { value: 1, text: "1"},
  { value: 2, text: "2"},
  { value: 3, text: "3"},
];

export const Document =[
  { value: 1, text: "ทั้งหมด"},
  { value: 2, text: "พิมพ์ใบนำส่ง"},
  { value: 3, text: "พิมพ์ใบเบิก"},
];