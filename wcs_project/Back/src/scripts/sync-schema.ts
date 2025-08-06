import "reflect-metadata";
import { exec } from "child_process";
import { AppDataSource } from "../config/app-data-source"; // อ้างอิง data-source ที่คุณสร้างไว้

 import * as path from "path";
import * as fs from "fs";
/*
// ระบุพาธไฟล์ config โดยตรง
const configPath = path.join(__dirname, "../config/GlobalConfig.json");

// อ่านไฟล์การตั้งค่า
const configFile = fs.readFileSync(configPath, "utf-8");
const config = JSON.parse(configFile);
 */
const isDevelopment = process.env.NODE_ENV !== "production";

const configPath = '../config/GlobalConfig.json'; // ระบุพาธไฟล์โดยตรง
const config = require(configPath);
// เลือกการตั้งค่าฐานข้อมูลตามสภาพแวดล้อม
const dbConfig = config.Database; //isDevelopment ? config.Database : config.DatabaseServer;

// อ่านพาธจากไฟล์ config
const mysqldumpPath = config.BackupConfig.mysqldumpPath;
const mysqlPath = config.BackupConfig.mysqlPath;
const backupDir = config.BackupConfig.backupPath;

function getBackupFileName() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    return `backup-${timestamp}.sql`;
}

function backupDatabase() {
    const backupFileName = getBackupFileName();
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupFilePath = path.join(backupDir, backupFileName);

    return new Promise((resolve, reject) => {
        exec(`"${mysqldumpPath}" --databases ${dbConfig.database} -u ${dbConfig.username} -p${dbConfig.password} > ${backupFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup error: ${error}`);
                console.error(stderr);
                return reject(error);
            }
            console.log("Database backup completed");
            resolve(backupFilePath);
        });
    });
}

async function synchronizeDatabase() {
    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        await AppDataSource.initialize();
        await AppDataSource.synchronize();
        console.log("Database schema updated");
    } catch (error) {
        console.error("Error during database synchronization:", error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

async function restoreDatabase(backupFilePath: string) {
    return new Promise((resolve, reject) => {
        exec(`"${mysqlPath}" -u ${dbConfig.username} -p${dbConfig.password} ${dbConfig.database} < ${backupFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Restore error: ${error}`);
                console.error(stderr);
                return reject(error);
            }
            console.log("Database restore completed");
            resolve(stdout);
        });
    });
}

async function main() {
    try {
        const backupFilePath = await backupDatabase();
        await synchronizeDatabase();
    } catch (error) {
        console.error("Error occurred during synchronization, restoring database...");
        const latestBackupFile = getLatestBackupFile();
        if (latestBackupFile) {
            await restoreDatabase(latestBackupFile);
        } else {
            console.error("No backup file found to restore");
        }
    }
}

function getLatestBackupFile(): string | null {
    const files = fs.readdirSync(backupDir).filter(file => file.startsWith('backup-') && file.endsWith('.sql'));
    if (files.length === 0) {
        return null;
    }
    files.sort((a, b) => fs.statSync(path.join(backupDir, b)).mtime.getTime() - fs.statSync(path.join(backupDir, a)).mtime.getTime());
    return path.join(backupDir, files[0]);
}

main().catch(error => console.error(error));
