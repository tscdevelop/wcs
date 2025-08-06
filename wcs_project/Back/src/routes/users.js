const configPath = '../config/GlobalConfig.json'; // ระบุพาธไฟล์โดยตรง
const config = require(configPath);

var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var axios = require('axios');
/* var con = mysql.createConnection({
  host: "tw-server",
  user: "sa",
  password: "sysdba",
  database: "db_lab"
}); */
var con = mysql.createConnection(config.DatabaseConnections.ConnStr);

var tzoffset = (new Date()).getTimezoneOffset() * 60000; 


// const datasend = {
//   id:'78910',
//   exam: 'B10',
//   ip: '192.168.10.21'
// }
// axios.post('http://tw-server:3002/camera/saveexam',datasend)
// .catch(function (error) {
// // Handle error
// console.log(error);
// });

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('JOKE 8888');
  console.log("JOKE 8888")
});

router.get('/getalluser', function (req, res, next) {
  // console.log('getalluser')
  con.query("SELECT * FROM users", (err, result) => {
  console.log(result);
  if (result.length > 0){
    let datasend = [];
    for (let i = 0; i < result.length; i++) {
      datasend.push({
        id:result[i].idusers,
        user:result[i].user,
        password: '*******',
        firstName:result[i].name,
        lastName:result[i].last_name,
        position:result[i].position,
        phoneNumber:result[i].tell,
        privilege:result[i].level
        })
    }
    res.send(datasend);
  }else{
    res.send([]);
  }
  });
});

router.post('/add', function (req, res, next) {
  console.log('add user')
  let date_time = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)
  let sqlinsert = ('INSERT into users')
  + ('(date_time,user,name,last_name,level')
  + ( ',tell,position,password)')
  + (' VALUE (?)');
  let valueinsert = [
  date_time,
  req.body.user,
  req.body.name,
  req.body.last_name,
  req.body.level,
  req.body.tell,
  req.body.position,
  req.body.password
  ];

        con.query(sqlinsert, [valueinsert],(err,result) => {
            if (err){
            console.log(err)
            res.send(err);
            }else{
                console.log(result);
            res.send(result);
            }
        });
        // res.send('insert user')

});

router.post('/delete', function (req, res, next) {
  const user = req.body.user;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  con.query(('Delete')
  + ' from users where user = ' + '"' +user+'"'
  + ' and name = ' + '"' +firstName+'"'
  + ' and last_name = ' + '"' +lastName+'"'
  , (err, result) => {

    if (err){
      // console.log(err)
      res.send(err);
      }else{
          // console.log(result);
      res.send(result);
      }
  });
});

router.post('/checkuser', function (req, res, next) {
  const userName = req.body.userName;
  const password = req.body.password;
  // console.log(req.body)

  con.query(('select *')
  + ' from users where user = ' + '"' +userName+'"'
  + ' and password = ' + '"' +password+'"'
  , (err, result) => {
console.log(result)
    if (err){
      res.send(err);
      }else{
        if (result.length>0){
          res.send(result[0]);
        }else{
          res.send('login-no-ok');
        }
      }
  });
});

module.exports = router;
