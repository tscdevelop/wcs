const configPath = '../config/GlobalConfig.json'; // ระบุพาธไฟล์โดยตรง
const config = require(configPath);

//const { uploadRegisterImage } = require('../services/filemanager_service'); // เรียกใช้ upload service

var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var multer = require('multer');
var path = require('path');
var fs = require('fs');

// Set up MySQL connection
/* var con = mysql.createConnection({
  host: "tw-server",
  user: "sa",
  password: "sysdba",
  database: "db_lab"
}); */
var con = mysql.createConnection(config.DatabaseConnections.ConnStr);


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

// 03/07/2024 : AEK : comment code ปรับไปเรียก Service แทน
/* // Ensure the base uploads directory exists
var baseUploadDir = 'C:/Register_Image';
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
  console.log("Base uploads directory created");
} else {
  console.log("Base uploads directory already exists");
}

// Set up multer for file uploads with dynamic storage path
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const customerCode = req.body.customerCode || 'unknown';
    const uploadDir = path.join(baseUploadDir, customerCode);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Directory created for customer code: ${customerCode}`);
    } else {
      console.log(`Directory already exists for customer code: ${customerCode}`);
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    let filename;
    if (file.fieldname === 'idCardImage') {
      filename = 'IDcard' + path.extname(file.originalname);
    } else if (file.fieldname === 'lineQrImage') {
      filename = 'QRLineID' + path.extname(file.originalname);
    } else if (file.fieldname === 'petImage') {
      filename = 'PetImage' + path.extname(file.originalname);  
    } else {
      filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    }
    cb(null, filename);
  }
});

var upload = multer({ storage: storage }); */

// Middleware to parse JSON and URL-encoded data
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const moment = require('moment');

const parseDate = (date) => {
  if (date) {
    const parsedDate = moment(date);
    return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : null;
  }
  return null;
};

router.post('/register', function (req, res, next) {
  console.log("Request received");

  // Retrieve the last customer code
  con.query('SELECT customerCode FROM register ORDER BY customerCode DESC LIMIT 1', function (err, result) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send('Error retrieving customer code');
    }

    const lastCustomerCode = result.length ? result[0].customerCode : "6700000";
    const lastCustomerNumber = parseInt(lastCustomerCode.slice(2), 10);
    const newCustomerNumber = lastCustomerNumber + 1;
    const newCustomerCode = `67${String(newCustomerNumber).padStart(5, '0')}`;
    const newPetCode = `${newCustomerCode}-01`;

    // Set the customer code and pet code in the request body

    // req.body.customerCode = newCustomerCode;
    // req.body.petCode = newPetCode;

    // Proceed with file upload and data processing
    upload.fields([{ name: 'idCardImage', maxCount: 1 }, { name: 'lineQrImage', maxCount: 1 }, { name: 'petImage', maxCount: 1 }])(req, res, function (err) {
    // 03/07/2024 : AEK : เรียกฟังก์ชั่น upload รูปลงทะเบียน
    //uploadRegisterImage.fields([{ name: 'idCardImage', maxCount: 1 }, { name: 'lineQrImage', maxCount: 1 }, { name: 'petImage', maxCount: 1 }])(req, res, function (err) {
      if (err) {
        console.error("Error during file upload:", err);
        return res.status(500).send('Error during file upload');
      }
 
      try {
        console.log("Request body:", req.body);
        console.log("Request files:", req.files);

        const {
          customerCode,
          prefix,
          firstName,
          lastName,
          birthDate,
          contactNumber1,
          contactNumber2,
          lineID,
          email,
          idCardNumber,
          cardIssueDate,
          cardExpiryDate,
          religion,
          nationality,
          ethnicity,
          petName,
          petType,
          petCode,
          oldPetCode,
          gender,
          color,
          breed,
          neutered,
          redChecked,
          greenChecked,
          petBirthDate,
          ageYear,
          ageMonth,
          ageDay,
          microchipNumber,
          healthConditions,
          drugAllergy,
          vaccineAllergy,
          foodAllergy,
          precautions,
          otherInfo,
          selectedProvince,
          selectedDistrict,
          selectedSubdistrict,
          postalCode,
          road,
          alley,
          address,
          additionalInfo,
          currentAddressSame,
          currentProvince,
          currentDistrict,
          currentSubdistrict,
          currentPostalCode,
          currentRoad,
          currentAlley,
          currentAddress,
          currentAdditionalInfo,
          hospital,
          treatmentRights // New field
        } = req.body;

        const idCardImage = req.files['idCardImage'] ? req.files['idCardImage'][0].path : null;
        const lineQrImage = req.files['lineQrImage'] ? req.files['lineQrImage'][0].path : null;
        const petImage = req.files['petImage'] ? req.files['petImage'][0].path : null;

        // Convert strings to appropriate types
        const convertedData = {
          customerCode,
          prefix,
          firstName,
          lastName,
          birthDate: parseDate(birthDate),
          contactNumber1,
          contactNumber2,
          lineID,
          email,
          idCardNumber,
          cardIssueDate: parseDate(cardIssueDate),
          cardExpiryDate: parseDate(cardExpiryDate),
          religion,
          nationality,
          ethnicity,
          petName,
          petType,
          petCode,
          oldPetCode,
          gender,
          color,
          breed,
          neutered: neutered === 'true' ? 1 : 0,
          redChecked: redChecked === 'true' ? 1 : 0,
          greenChecked: greenChecked === 'true' ? 1 : 0,
          petBirthDate: parseDate(petBirthDate),
          ageYear: ageYear && !isNaN(parseInt(ageYear)) ? parseInt(ageYear) : null,
          ageMonth: ageMonth && !isNaN(parseInt(ageMonth)) ? parseInt(ageMonth) : null,
          ageDay: ageDay && !isNaN(parseInt(ageDay)) ? parseInt(ageDay) : null,
          microchipNumber,
          healthConditions,
          drugAllergy,
          vaccineAllergy,
          foodAllergy,
          precautions,
          otherInfo,
          selectedProvince,
          selectedDistrict,
          selectedSubdistrict,
          postalCode,
          road,
          alley,
          address,
          additionalInfo,
          currentAddressSame: currentAddressSame === 'true' ? 1 : 0,
          currentProvince,
          currentDistrict,
          currentSubdistrict,
          currentPostalCode,
          currentRoad,
          currentAlley,
          currentAddress,
          currentAdditionalInfo,
          hospital,
          idCardImage,
          lineQrImage,
          petImage,
          createdAt: new Date(),
          updatedAt: new Date(),
          detail: 'Some detail',
          treatmentRights // New field
        };

        // Debugging output to check converted data
        console.log(convertedData);

        // SQL query to insert data into the 'register' table
        const sql = `INSERT INTO register (
          customerCode, prefix, firstName, lastName, birthDate, contactNumber1, contactNumber2, lineID, email, idCardNumber, cardIssueDate,
          cardExpiryDate, religion, nationality, ethnicity, petName, petType, petCode, oldPetCode, gender, color, breed, neutered, redChecked,
          greenChecked, petBirthDate, ageYear, ageMonth, ageDay, microchipNumber, healthConditions, drugAllergy, vaccineAllergy, foodAllergy,
          precautions, otherInfo, selectedProvince, selectedDistrict, selectedSubdistrict, postalCode, road, alley, address, additionalInfo,
          currentAddressSame, currentProvince, currentDistrict, currentSubdistrict, currentPostalCode, currentRoad, currentAlley, currentAddress,
          currentAdditionalInfo, hospital, idCardImage, lineQrImage, petImage, createdAt, updatedAt, detail, treatmentRights
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
          convertedData.customerCode, convertedData.prefix, convertedData.firstName, convertedData.lastName, convertedData.birthDate,
          convertedData.contactNumber1, convertedData.contactNumber2, convertedData.lineID, convertedData.email, convertedData.idCardNumber,
          convertedData.cardIssueDate, convertedData.cardExpiryDate, convertedData.religion, convertedData.nationality, convertedData.ethnicity,
          convertedData.petName, convertedData.petType, convertedData.petCode, convertedData.oldPetCode, convertedData.gender, convertedData.color,
          convertedData.breed, convertedData.neutered, convertedData.redChecked, convertedData.greenChecked, convertedData.petBirthDate,
          convertedData.ageYear, convertedData.ageMonth, convertedData.ageDay, convertedData.microchipNumber, convertedData.healthConditions,
          convertedData.drugAllergy, convertedData.vaccineAllergy, convertedData.foodAllergy, convertedData.precautions, convertedData.otherInfo,
          convertedData.selectedProvince, convertedData.selectedDistrict, convertedData.selectedSubdistrict, convertedData.postalCode,
          convertedData.road, convertedData.alley, convertedData.address, convertedData.additionalInfo, convertedData.currentAddressSame,
          convertedData.currentProvince, convertedData.currentDistrict, convertedData.currentSubdistrict, convertedData.currentPostalCode,
          convertedData.currentRoad, convertedData.currentAlley, convertedData.currentAddress, convertedData.currentAdditionalInfo,
          convertedData.hospital, convertedData.idCardImage, convertedData.lineQrImage, convertedData.petImage, convertedData.createdAt, convertedData.updatedAt,
          convertedData.detail, convertedData.treatmentRights
        ];

        // Execute the SQL query
        con.query(sql, values, function (err, result) {
          if (err) {
            console.error("Error inserting data into database:", err);
            return res.status(500).send('Error inserting data into database');
          }
          console.log("Data inserted successfully:", result);
          res.status(200).send('Data inserted successfully');
        });
      } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send('Error processing request');
      }
    });
  });
});

module.exports = router;


router.get('/register', function (req, res, next) {
  res.send('JOKE 8888');
  console.log("JOKE 8888");
});

router.get('/hospitals', function (req, res, next) {
  con.query('SELECT name, code FROM hospital_name', function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

router.get('/last-customer-code', function (req, res) {
  // Get the current year in the Thai Buddhist calendar
  const currentYear = new Date().getFullYear() + 543;
  const yearPrefix = currentYear.toString().slice(-2); // Get the last two digits of the year

  con.query('SELECT customerCode FROM register ORDER BY id DESC LIMIT 1', function (err, result) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send('Error retrieving customer code');
    }

    console.log('Database result:', result);

    const lastCustomerCode = result.length ? result[0].customerCode : `${yearPrefix}00000`;
    console.log('Last customer code from database:', lastCustomerCode);

    const lastCustomerNumber = parseInt(lastCustomerCode.slice(2), 10);
    console.log('Parsed last customer number:', lastCustomerNumber);

    if (isNaN(lastCustomerNumber)) {
      console.error("Parsed customer number is NaN");
      return res.status(500).send('Error parsing customer code');
    }

    const newCustomerNumber = lastCustomerNumber + 1;
    const newCustomerCode = `${yearPrefix}${String(newCustomerNumber).padStart(5, '0')}`;
    const newPetCode = `${newCustomerCode}-01`;

    res.json({
      customerCode: newCustomerCode,
      petCode: newPetCode
    });
  });
});


router.get('/all-customers', function (req, res) {
  con.query('SELECT * FROM register order by id desc', function (err, result) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send('Error retrieving customers');
    }
    // console.log('Result = ', result)
    res.json(result);
  });
});


router.get('/by-pet-code/:petCode', function (req, res) {
  const petCode = req.params.petCode;
  console.log(`Received request for petCode: ${petCode}`);
  con.query('SELECT * FROM register WHERE petCode = ? ORDER BY id DESC LIMIT 1', [petCode], function (err, result) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send('Error retrieving customer details');
    }
    if (result.length === 0) {
      console.log('No customer found');
      return res.status(404).send('Customer not found');
    }
    console.log('Customer found:', result[0]);
    res.json(result[0]);
  });
});

router.get('/customer/by-customer-code/:customerCode', function (req, res) {
  const customerCode = req.params.customerCode;
  con.query('SELECT * FROM register WHERE customerCode = ? ORDER BY id DESC LIMIT 1', [customerCode], function (err, result) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send('Error retrieving customer details');
    }
    if (result.length === 0) {
      return res.status(404).send('Customer not found');
    }
    res.json(result[0]);
  });
});

router.get('/last-pet-code/:customerCode', function (req, res) {
  const customerCode = req.params.customerCode;
  con.query('SELECT petCode FROM register WHERE customerCode = ? ORDER BY petCode DESC LIMIT 1', [customerCode], function (err, result) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send('Error retrieving pet code');
    }
    if (result.length === 0) {
      return res.status(404).send('Pet code not found');
    }
    res.json({ lastPetCode: result[0].petCode });
  });
});


module.exports = router;

