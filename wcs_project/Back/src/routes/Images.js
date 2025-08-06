var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
//const multer = require('multer');
const imageService = require('../utils/ImageHelper');
const config = require('../config/GlobalConfig.json');
/* 
// กำหนด storage สำหรับ multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'uploads';
    const uploadPath = path.join(__dirname, '..', 'uploads', folder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }); 

// ให้บริการไฟล์จากโฟลเดอร์ uploads
router.use('/uploads', express.static(path.join(__dirname, '..','public', 'uploads')));

// เส้นทางสำหรับการอัปโหลดไฟล์
router.post('/upload', upload.single('file'), (req, res) => {
  const folder = req.body.folder || 'uploads';
  res.send(`File uploaded successfully to ${folder}. <a href="/uploads/${folder}/${req.file.filename}">Download ${req.file.filename}</a>`);
});

*/

// เส้นทางสำหรับดึงรูปภาพและส่ง URL กลับไป
router.get('/labform-image-url', async (req, res) => {
  const { name } = req.query;
  const targetFolder = 'labform_image';
  try {
    const imagePath = await imageService.getImage(targetFolder, name);
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${targetFolder}/${name}`;
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
});

// เส้นทางสำหรับดึงรูปภาพและส่ง URL กลับไป
router.get('/labform-image', async (req, res) => {
  const { name } = req.query;
  const targetFolder = 'labform_image';
  try {
    const imagePath = await imageService.getImage(targetFolder, name);
    res.sendFile(imagePath);
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
});

// เส้นทางสำหรับดึงรูปภาพ register และส่ง URL กลับไป
router.get('/register-image-url', async (req, res) => {
  const { name } = req.query;
  const targetFolder = 'labform_image';
  try {
    const imagePath = await imageService.getImage(targetFolder, name);
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${targetFolder}/${name}`;
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
});

// เส้นทางสำหรับดึงรูปภาพ register และส่งรูปกลับไป
router.get('/register-image', async (req, res) => {
  const { name, customerCode } = req.query;
  const targetFolder = customerCode != '' ? 'register_image'+"/"+customerCode : 'register_image';
  try {
    const imagePath = await imageService.getImage(targetFolder, name);
    res.sendFile(imagePath);
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
});

router.get('/getimage', function (req, res, next) {
  const imagename = req.query.imagename;
  let imagePath = path.join(process.cwd(), config.PathFile.dirImage, imagename);

  res.sendFile(imagePath, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', imagePath);
    }
  });
});
/* 
router.get('/getimagewithjson', function (req, res, next) {
  let imagePath = path.join('D:', 'SuperVETS', 'Lab-BackEng', 'Image', 'test1.jpg');
  fs.readFile(imagePath, function (err, data) {
    if (err) {
      next(err);
    } else {
      let base64Image = Buffer.from(data).toString('base64');
      let imageUri = 'data:image/jpeg;base64,' + base64Image;
      res.json({
        message: "Here is your image",
        image: imageUri
      });
      console.log('Sent:', imagePath);
    }
  });
});
 */


/* router.get('/getimageurl', function (req, res, next) {
  let imageUrl = 'http://tw-engineer.thddns.net:4740/images/test1.jpg';
  res.json({
    message: "Here is your image",
    imageUrl: imageUrl
  });
  console.log('Sent URL for:', imageUrl);
}); */

module.exports = router;
