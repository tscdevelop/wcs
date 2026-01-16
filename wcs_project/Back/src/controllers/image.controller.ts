import path from 'path';
import { Request, Response, NextFunction } from 'express';
import config from '../config/GlobalConfig.json';
import fs from 'fs';
import { Directories } from '../common/global.enum';

export const getImageUpload = (req: Request, res: Response, next: NextFunction) => {
    const { directory, subfolder, imageName } = req.params;

    const mappedDirectory = Directories[directory as keyof typeof Directories];
    if (!mappedDirectory) {
        return res.status(400).json({ error: "Invalid directory specified" });
    }

    const dirPath = config.PathFile[mappedDirectory as keyof typeof config.PathFile];
    if (!dirPath) {
        return res.status(400).json({ error: "Directory path not found in config" });
    }

    const imagePath = path.join(process.cwd(), dirPath, subfolder, imageName);

    if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    // 🔹 เพิ่ม cache (optional แต่แนะนำ)
    res.setHeader("Cache-Control", "public, max-age=3600");

    res.sendFile(imagePath, err => {
        if (err) next(err);
    });
};
