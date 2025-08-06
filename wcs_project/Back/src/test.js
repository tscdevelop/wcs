const path = require('path');
const fs = require('fs').promises;
const libre = require('libreoffice-convert');
const util = require('util');

// Convert libreoffice-convert to async function
libre.convertAsync = util.promisify(libre.convert);

async function convertExcelToPDF() {
    try {
        // กำหนดนามสกุลไฟล์ปลายทาง
        const ext = '.pdf';

        // กำหนดเส้นทางไฟล์ต้นฉบับ (Excel) และไฟล์ปลายทาง (PDF)
        const inputPath = path.join(__dirname, 'example.xlsx');
        const outputPath = path.join(__dirname, `example${ext}`);

        // อ่านไฟล์ Excel ที่จะทำการแปลง
        const xlsxBuf = await fs.readFile(inputPath);

        // ทำการแปลงไฟล์ Excel เป็น PDF
        const pdfBuf = await libre.convertAsync(xlsxBuf, ext, undefined);

        // บันทึกไฟล์ PDF ที่แปลงแล้ว
        await fs.writeFile(outputPath, pdfBuf);

        console.log(`ไฟล์ถูกแปลงและบันทึกเรียบร้อยที่: ${outputPath}`);
    } catch (err) {
        console.error(`เกิดข้อผิดพลาดในการแปลงไฟล์: ${err.message}`);
    }
}

// เรียกใช้งานฟังก์ชัน
convertExcelToPDF();