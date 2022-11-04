// server/index.js
const express = require('express')
const cors = require('cors')
var router = express.Router();


const PORT = process.env.PORT || 8000
const app = express()

const session = {}; //server.js 전역변수 선언

// DB 연결
const maria = require('./maria');
maria.connect();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());
// 1. 아래의 부분을 추가해준다.
app.use('/public', express.static('public'));

// 2. index.html로 리다이렉션
app.get('/',(req,res)=>{
  if (req.headers.cookie) {
    console.log(req.headers.cookie);
    const [, privateKey] = req.headers.cookie.split('=');
    const userInfo = session[privateKey];
    console.log(userInfo)
    res.redirect('/public/main.html');
    // res.render('index.html', {
    //   isLogin: true,
    //   userInfo,
    // });
  } else {
    res.redirect('/public/main.html');
    // res.render('index.html', { isLogin: false });
  }
    
});

app.listen(PORT, () => {
	console.log(`server is listening on ${PORT}`)
})

router.post('/api/post/demo', function(req, res) {
  res.status(200).json({
      "message" : "call post api demo"
  });
});

app.get('/create', function(req, res) {
  maria.query('CREATE TABLE DEPARTMENT ('
	+'DEPART_CODE INT(11) NOT NULL,'
	+'NAME VARCHAR(200) NULL DEFAULT NULL COLLATE utf8mb3_general_ci,'
	+'PRIMARY KEY (DEPART_CODE) USING BTREE)', function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

app.get('/drop', function(req, res) {
  maria.query('DROP TABLE DEPARTMENT', function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

app.post('/insert', function(req, res) {
  console.log(req.body)
  var query_txt = 'INSERT INTO youtube(video_id,video_title,channel,id) VALUES("'+req.body['videoId']+'","'+req.body['videoTitle']+'","'+req.body['channelTitle']+'","'+session[req.body['cookie']].Id+'")'
  maria.query(query_txt, function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

app.post('/select/video_title', function(req, res) {
  var query_txt = 'SELECT video_id FROM YOUTUBE WHERE video_title LIKE "%'+req.body['keyword']+'%" AND id ="' + session[req.body['cookie']].Id+'"'
  maria.query(query_txt, function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

app.post('/select/all', function(req, res) {
  console.log(session[req.body['cookie']]);
  var query_txt = 'SELECT * FROM YOUTUBE WHERE id ="' + session[req.body['cookie']].Id+'"';
  maria.query(query_txt, function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

//유튜브 즐겨찾기 삭제
app.post('/delete', function(req, res) {
  var query_txt = 'DELETE FROM youtube WHERE video_id="'+req.body['videoId']+'" AND id ="' + session[req.body['cookie']].Id+'"'
  maria.query(query_txt, function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

app.post('/user/register', function(req, res) {
  var query = "SELECT id FROM user where id='" + req.body['Id'] +"';"
  maria.query(query, function(err, rows, fields) {
    if (rows.length == 0){
      var query_txt = 'INSERT INTO user(id,password) VALUES("'+req.body['Id']+'","'+req.body['Password']+'")'
      maria.query(query_txt, function(err, rows, fields) {
        if(!err) {
          res.send("성공"); // responses send rows
        } else {
          console.log("err : " + err);
          res.send(err);  // response send err
        }
      });
    }
    else{
      res.send("중복ID")
    }
  });
});

app.post('/user/login', function(req, res) {
  var id = req.body['email']
  var pw = req.body['psw']

  var query = "SELECT * FROM user where id='" + id +"';"
  maria.query(query, function(err, rows) {
    if (err) throw err;
    else{
      if(rows.length == 0){
        console.log(rows)
        console.log("아이디 틀림")
        res.redirect("/")
      }
      else{
        var salt = rows[0].id;
        var password = rows[0].password;
        console.log(salt)
        if(pw === password){
          console.log('로그인 성공')
          const privateKey = Math.floor(Math.random() * 1000000000);
          const user = {
            Id : id,
            Pwd : password
          };
          session[privateKey] = user;
          res.setHeader('Set-Cookie', `connect.id=${privateKey}; path=/`);
          res.redirect("/")
        }
        else{
          console.log("로그인 실패")
          res.redirect("/")
        }
      }
    }
  });
});

app.get('/user/logout', (req, res) => {
  if (req.headers.cookie) {
    const [, privateKey] = req.headers.cookie.split('=');
    delete session[privateKey];
    res.setHeader('Set-Cookie', 'connect.id=delete; Max-age=0; path=/');
    res.redirect('/');
  } 
});

app.post('/user/id', function(req, res) {
  console.log(req.headers.cookie.split('='))
  console.log(session)
  console.log(session[req.headers.cookie.split('=')[1]].Id);
  res.send(session[req.headers.cookie.split('=')[1]].Id);
});

module.exports = router;