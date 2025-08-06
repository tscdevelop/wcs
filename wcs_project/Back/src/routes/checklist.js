const configPath = '../config/GlobalConfig.json'; // ระบุพาธไฟล์โดยตรง
const config = require(configPath);

var express = require('express');
var router = express.Router();
var mysql = require('mysql');

/* var con = mysql.createConnection({
  host: "tw-server",
  user: "sa",
  password: "sysdba",
  database: "db_lab"
});
 */
var con = mysql.createConnection(config.DatabaseConnections.ConnStr);

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

router.get('/getlabdatatable', function (req, res, next) {
  let { startDate, endDate, status } = req.query;
  let query = "SELECT * FROM lab_records WHERE 1=1";

  if (startDate) {
    query += ` AND datetime >= '${startDate}'`;
  }
  if (endDate) {
    query += ` AND datetime <= '${endDate} 23:59:59'`;
  }
  if (status && status !== 'ทั้งหมด') {
    query += ` AND status = '${status}'`;
  }

  con.query(query, function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

module.exports = router;
