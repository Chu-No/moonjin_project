// server/index.js
const express = require('express')
const cors = require('cors')
var router = express.Router();


const PORT = process.env.PORT || 8000
const app = express()

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
    res.redirect('/public/main.html');
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
  var query_txt = 'INSERT INTO youtube(video_id,video_title,channel) VALUES("'+req.body['videoId']+'","'+req.body['videoTitle']+'","'+req.body['channelTitle']+'")'
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
  var query_txt = 'SELECT video_id FROM YOUTUBE WHERE video_title LIKE "%'+req.body['keyword']+'%"'
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
  var query_txt = 'SELECT * FROM YOUTUBE'
  maria.query(query_txt, function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

router.get('/update', function(req, res) {
  maria.query('UPDATE DEPARTMENT SET NAME="UPD ENG" WHERE DEPART_CODE=5001', function(err, rows, fields) {
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
  var query_txt = 'DELETE FROM youtube WHERE video_id="'+req.body['videoId']+'"'
  maria.query(query_txt, function(err, rows, fields) {
    if(!err) {
      res.send(rows); // responses send rows
    } else {
      console.log("err : " + err);
      res.send(err);  // response send err
    }
  });
});

module.exports = router;