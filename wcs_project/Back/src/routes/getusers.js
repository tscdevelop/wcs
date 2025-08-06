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

con.connect((err) => {
    if (err) console.log(err);
});

/* GET users listing. */
router.get('/getuser', function (req, res, next) {
    if (con == null) {
        con.connect((err) => {
            if (err) console.log(err);
        });
    }

    con.query("SELECT * FROM users", (err, result) => {
        console.log(result);
        res.send(result);
    });
});

router.get('/checkuser', function (req, res, next) {
    const email = req.query.email;
    const password = req.query.password;
    // console.log(req.body)
  
    con.query(('select *')
    + ' from users where email = ' + '"' +email+'"'
    + ' and password = ' + '"' +password+'"'
    , (err, result) => {
  console.log(result)
      if (err){
        res.send(err);
        }else{
          if (result.length>0){
            res.send(result[0]);
          }else{
            res.send('Login-Fail');
          }
        }
    });
  });

module.exports = router;