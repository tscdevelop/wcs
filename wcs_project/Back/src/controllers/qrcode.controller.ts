import { Request, Response } from 'express';
import QRCode from 'qrcode';
import bwipJs from 'bwip-js'; // ไลบรารีสำหรับสร้าง Barcode

// export const generateQRCode = async (req: Request, res: Response) => {
//     const code = req.query.code;

//     // ตรวจสอบว่า code เป็น string
//     if (typeof code !== 'string') {
//         return res.status(400).json({ message: 'Code must be a string' });
//     }

//     try {
//         const qrCodeDataUrl = await QRCode.toDataURL(code);
//         res.status(200).json({ qrCode: qrCodeDataUrl });
//     } catch (error) {
//         console.error('Error generating QR Code:', error);
//         res.status(500).json({ message: 'Error generating QR Code' });
//     }
// };



export const generateQRCode = async (req: Request, res: Response) => {
    const code = req.query.code;

    // ตรวจสอบว่า code เป็น string
    if (typeof code !== 'string') {
        return res.status(400).json({ message: 'Code must be a string' });
    }

    try {
        // สร้าง QR Code เป็น Buffer
        const qrCodeBuffer = await QRCode.toBuffer(code);
        // ส่ง QR Code เป็นไฟล์ภาพ (image/png)
        res.setHeader('Content-Type', 'image/png');
        res.send(qrCodeBuffer);
    } catch (error) {
        console.error('Error generating QR Code:', error);
        res.status(500).json({ message: 'Error generating QR Code' });
    }
};

export const generateBarcode = async (req: Request, res: Response) => {
    const code = req.query.code as string;

    // ตรวจสอบว่า code เป็น string
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: 'Code must be a string' });
    }

    try {
        // สร้าง Barcode โดยใช้ bwip-js
        const barcodeBuffer = await bwipJs.toBuffer({
            bcid: 'code128', // ประเภทของ Barcode (ตัวอย่าง: Code 128)
            text: code, // ข้อความที่ต้องการแปลงเป็น Barcode
            scale: 3, // ขนาดของ Barcode
            height: 10, // ความสูงของ Barcode (หน่วย: mm)
            includetext: true, // แสดงข้อความใต้ Barcode
            textxalign: 'center', // จัดข้อความให้อยู่กึ่งกลาง
        });

        // ส่ง Barcode เป็นไฟล์ภาพ (image/png)
        res.setHeader('Content-Type', 'image/png');
        res.send(barcodeBuffer);
    } catch (error) {
        console.error('Error generating Barcode:', error);
        res.status(500).json({ message: 'Error generating Barcode' });
    }
};