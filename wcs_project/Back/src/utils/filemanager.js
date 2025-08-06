// 23/07/2024 : aek : ปรับเพิ่ม handleFileUploads รองรับการ Upload หลายไฟล์
const path = require('path');
const fs = require('fs');
const config = require('../config/GlobalConfig.json');

const UploadDirKey = {
  DIR_IMAGE: 'dirImage',
  DIR_UPLOAD_OUTBOUND_TOOLING_IMAGE: 'dirUploadOutboundToolingImage'
};

/**
 * Ensure the directory exists, create it if not
 * @param {string} dir - Directory path
 */
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directory created: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
};

/**
 * Upload file using express-fileupload
 * @param {object} file - Uploaded file object
 * @param {string} uploadDirKey - Key from UploadDirKey enum
 * @param {string} subfolder - Subfolder name for storing uploads
 * @param {boolean} useGenFilename - Whether to use the generate filename
 * @returns {Promise<string>} - The filename of the uploaded file
 */
const uploadFile = (file, uploadDirKey, subfolder = '', useGenFilename = false) => {
  return new Promise((resolve, reject) => {
    const uploadDir = config.PathFile[uploadDirKey];
    const fullBaseDir = subfolder ? path.join(uploadDir, subfolder) : uploadDir;
    ensureDirExists(fullBaseDir);

    let filename;
    const now = new Date();
    const dateSuffix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    const extension = path.extname(file.name);
    const basename = path.basename(Buffer.from(file.name, 'latin1').toString('utf8'), extension); // Convert the file name

    if (useGenFilename) {
      filename = `${basename}_${dateSuffix}${extension}`;
    } else {
      filename = Buffer.from(file.name, 'latin1').toString('utf8'); // Convert the file name
    }

    const uploadPath = path.join(fullBaseDir, filename);

    file.mv(uploadPath, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(filename);
    });
  });
};

/**
 * Get file URL
 * @param {string} uploadDirKey - Key from UploadDirKey enum
 * @param {string} filename - File name
 * @param {object} req - Express request object
 * @param {string} subfolder - Subfolder name for retrieving the file URL
 * @returns {string} - File URL
 */
const getFileUrl = (uploadDirKey, filename, req, subfolder = '') => {
  if (!filename) {
    throw new Error('Filename is required');
  }

  const folder = config.PathFile[uploadDirKey];
  let fileUrl;
  if (subfolder) {
    fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(folder)}/${subfolder}/${filename}`;
  } else {
    fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(folder)}/${filename}`;
  }
  console.log(`Generated file URL: ${fileUrl}`);
  return fileUrl;
};

/**
 * Download file
 * @param {string} uploadDirKey - Key from UploadDirKey enum
 * @param {string} filename - File name
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {string} subfolder - Subfolder name for retrieving the file
 */

// const downloadFile = (uploadDirKey, filename, req, res, subfolder = '') => {
//   if (!filename) {
//     return res.status(400).json({ error: 'Filename is required' });
//   }

//   const folder = config.PathFile[uploadDirKey];
//   const filePath = subfolder
//     ? path.join(__dirname, '..', 'public', 'uploads', path.basename(folder), subfolder, filename)
//     : path.join(__dirname, '..', 'public', 'uploads', path.basename(folder), filename);

//   fs.access(filePath, fs.constants.F_OK, (err) => {
//     if (err) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     // กำหนด Content-Type ตามประเภทของไฟล์
//     const fileExtension = path.extname(filename).toLowerCase();
//     let contentType;

//     switch (fileExtension) {
//         case '.pdf':
//             contentType = 'application/pdf';
//             break;
//         case '.jpg':
//         case '.jpeg':
//             contentType = 'image/jpeg';
//             break;
//         case '.png':
//             contentType = 'image/png';
//             break;
//         case '.txt':
//             contentType = 'text/plain';
//             break;
//         default:
//             contentType = 'application/octet-stream'; // สำหรับไฟล์ทั่วไปที่ไม่รู้ประเภท
//     }

//     res.setHeader('Content-Type', contentType);
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

//     res.download(filePath, filename, (err) => {
//       if (err) {
//         console.error("Error sending file:", err);
//         return res.status(500).json({ error: 'Internal server error' });
//       }
//     });
//   });
// };


const downloadFile = (uploadDirKey, filename, req, res, subfolder = '') => {
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  const folder = config.PathFile[uploadDirKey];
  const filePath = subfolder
    ? path.join(__dirname, '..', 'public', 'uploads', path.basename(folder), subfolder, filename)
    : path.join(__dirname, '..', 'public', 'uploads', path.basename(folder), filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    // กำหนด Content-Type ตามประเภทของไฟล์
    const fileExtension = path.extname(filename).toLowerCase();
    let contentType;

    switch (fileExtension) {
        case '.pdf':
            contentType = 'application/pdf';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'application/octet-stream'; // สำหรับไฟล์ทั่วไป
    }

    // เข้ารหัส filename ด้วย UTF-8
    const encodedFilename = encodeURIComponent(filename);

    // เพิ่ม Header และแนบชื่อไฟล์ที่ปลอดภัย
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);

    // ส่งไฟล์ให้ผู้ใช้งาน
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  });
};

/**
 * Handle file uploads for multiple files
 * @param {object} files - File upload array
 * @param {string} subfolder - Subfolder name
 * @param {string} uploadDirKey - Upload directory key
 * @param {object} fileMapping - File mapping object
 * @returns {Promise<object>} - Updated data with file names and URLs
 */

const handleFileUploads = async (files, subfolder, uploadDirKey, by, fileMapping) => {
  if (!Array.isArray(files) || files.length === 0) {
    console.warn('No files provided or invalid files structure.');
    return {};
  }

  console.log('Files received:', files);
  console.log('File mapping:', fileMapping);

  const uploadDir = config.PathFile[uploadDirKey];
  const fullUploadDir = path.join(__dirname, uploadDir, subfolder);
  ensureDirExists(fullUploadDir);

  const updateData = {}; // เก็บผลลัพธ์การอัปโหลด

  for (const file of files) {
    try {
      const filename = await uploadFile(file, uploadDirKey, subfolder);
      const relativePath = path
        .join('/uploads', path.basename(uploadDir), subfolder, filename)
        .replace(/\\/g, '/');

      updateData[fileMapping.files.filename] = filename;
      updateData[fileMapping.files.url] = relativePath;
      updateData[fileMapping.files.by] = by;

      console.log(`Uploaded file: ${filename}, Path: ${relativePath}`);
    } catch (error) {
      console.error(`Error uploading file: ${file.name}`, error);
    }
  }

  return updateData;
};

//ของเดิม
// const handleFileUploads = async (files, subfolder, uploadDirKey, by, fileMapping) => {
//   if (!files) return {};

//   const uploadDir = config.PathFile[uploadDirKey];
//   console.log("uploadDir : ",uploadDir);
//   const fullUploadDir = path.join(__dirname, uploadDir, subfolder);
//   console.log("fullUploadDir : ",fullUploadDir);
//   ensureDirExists(fullUploadDir);

//   const updateData = {};
//   console.log("fileMapping : ",fileMapping);
//   for (const [key, value] of Object.entries(fileMapping)) {
//     console.log("files[key] : ",files[key]);
//     if (files[key]) {
//       const file = files[key];
//       const filename = await uploadFile(file, uploadDirKey, subfolder);
//       //const relativePath = path.join(uploadDirKey.toLowerCase(), subfolder, filename);
//       const relativePath = path.join('/uploads', path.basename(uploadDir), subfolder, filename).replace(/\\/g, '/');
//       updateData[value.filename] = filename;
//       updateData[value.url] = relativePath;
//       updateData[value.by] = by;
//     }
//   }

//   return updateData;
// };

module.exports = {
  UploadDirKey,
  ensureDirExists,
  uploadFile,
  getFileUrl,
  downloadFile,
  handleFileUploads
};
