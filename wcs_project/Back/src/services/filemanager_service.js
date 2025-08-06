const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// ปรับเส้นทางตามที่อยู่ของไฟล์ GlobalConfig.json
const configPath = path.join(__dirname, '../config/GlobalConfig.json');
const config = require(configPath);

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directory created: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
};

const createMulterStorage = (baseDir, subFolderName = '') => {
  const fullBaseDir = path.resolve(baseDir);
  ensureDirExists(fullBaseDir);

  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = subFolderName === '' ? fullBaseDir : path.join(fullBaseDir, subFolderName);
      ensureDirExists(uploadDir);
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + uuidv4();
      const extension = path.extname(file.originalname);
      const filename = file.fieldname + '-' + uniqueSuffix + extension;
      cb(null, filename);
    }
  });
};

const uploadRegisterImage = multer({ storage: createMulterStorage(config.PathFile.dirUploadRigisterImage) });
const uploadLabFormImage = multer({ storage: createMulterStorage(config.PathFile.dirUploadLabFormImage) });
const uploadLabFormFile = multer({ storage: createMulterStorage(config.PathFile.dirUploadLabFormFile) });
const uploadHospitalImage = multer({ storage: createMulterStorage(config.PathFile.dirUploadHospitalImage) });

const downloadFileUrl = (folder, filename, req) => {
  if (!filename) {
    throw new Error('Filename is required');
  }

  let fileUrl;
  if (folder) {
    fileUrl = `${req.protocol}://${req.get('host')}/uploads/${folder}/${filename}`;
  } else {
    fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
  }
  return fileUrl;
};

const downloadFile = (folder, filename, req, res) => {
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  const filePath = folder
    ? path.join(__dirname, '..', 'public', 'uploads', folder, filename)
    : path.join(__dirname, '..', 'public', 'uploads', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  });
};

// สำหรับบันทึกไฟล์
const saveFile = (baseDir, file) => {
  const fullBaseDir = path.resolve(baseDir);
  ensureDirExists(fullBaseDir);
  const uniqueSuffix = Date.now() + '-' + uuidv4();
  const extension = path.extname(file.name);
  const filename = file.fieldname + '-' + uniqueSuffix + extension;
  const filePath = path.join(fullBaseDir, filename);
  fs.writeFileSync(filePath, file.data);
  return filename;
};

// สำหรับดึงไฟล์จาก URL
const getFileUrl = (folder, filename, req) => {
  if (!filename) {
    throw new Error('Filename is required');
  }
  return `${req.protocol}://${req.get('host')}/uploads/${folder}/${filename}`;
};

module.exports = {
  uploadRegisterImage,
  uploadLabFormImage,
  uploadLabFormFile,
  uploadHospitalImage,
  downloadFileUrl,
  downloadFile,
  saveFile,
  getFileUrl
};
