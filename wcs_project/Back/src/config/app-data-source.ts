import "reflect-metadata";
import { DataSource } from "typeorm";

const isDevelopment = process.env.NODE_ENV !== "production";

const configPath = '../config/GlobalConfig.json'; // ระบุพาธไฟล์โดยตรง
const config = require(configPath);

// เลือกการตั้งค่าฐานข้อมูลตามสภาพแวดล้อม
const dbConfig = config.Database; //isDevelopment ? config.Database : config.DatabaseServer;
// const dbConfig = config.DatabaseServer; 

export const AppDataSource = new DataSource({
    type: dbConfig.type,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: false, // ควรตั้งค่าเป็น false ใน production
    logging: true,
    entities: isDevelopment ? ["src/entities/*.ts"] : ["dist/entities/*.js"],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: [],
    cache: false, // ✅ เปิด Query Cache ที่ระดับ Database
});

// ✅ ตรวจสอบก่อน `initialize`
// if (!AppDataSource.isInitialized) {
//   AppDataSource.initialize()
//     .then(() => {
//       console.log("✅ Data Source has been initialized!");
//     })
//     .catch((err: any) => {
//       console.error("❌ Error during Data Source initialization:", err);
//     });
// } else {
//   console.log("⚠️ Data Source is already initialized. Skipping initialization.");
// }

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err : any) => {
    console.error("Error during Data Source initialization:", err);
  });
