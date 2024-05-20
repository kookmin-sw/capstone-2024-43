//
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());//post요청 body parser
const recommendAlgo = require("./recommendationAlgorithm");
const reviewListAlgo = require("./bookReviewList");
const spoilerFilter = require("./spoilerFilter");

//클라이언트에서 서버로의 HTTP 요청이 서로 다른 출처에서 오더라도 정상적으로 처리
const cors = require('cors');
app.use(cors()) // cors() middleware 사용
// URL-encoded 형식의 요청 본문을 파싱하기 위한 미들웨어 form 제출 파싱
app.use(express.urlencoded({ extended: true }));
//MYSQL 연결
const mysql = require('mysql2');
var db_config  = require('./db-config.json');
const connection = mysql.createConnection({
  host:db_config.host,
  user:db_config.user,
  password:db_config.password,
  database:db_config.database,
});
connection.connect();

//8080 번 포트에서 시작하기
app.listen(8080, function () {
    console.log('Listening to port 8080')
  });
  
//react build dir 연결
app.use(express.static(path.join(__dirname, '/../front/build')));

//모든 요청의 URL과 메소드를 출력
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//저장 구현
app.post('/api/postpage', (req, res) => {
  const postData = req.body;

  // SQL 쿼리 실행
  connection.query(
    "INSERT INTO posts (postID, body, UID, status, create_at, isbn, title) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [postData.postId, postData.body, postData.UID, postData.status, new Date(), postData.isbn, postData.title],
    (error, results) => {
      if (error) {
        console.error('Error inserting post:', error);
        res.status(500).json({ status: 'error', message: '포스트를 저장하는 중 오류가 발생했습니다.' });
      } else {
        console.log('Post inserted successfully');
        res.json({ status: 'success', message: '포스트가 성공적으로 저장되었습니다.' });
      }
    }
  );
}); 


// DELETE 요청을 받아 포스트를 삭제.
app.delete('/api/post/:postId', (req, res) => {
  const postId = req.params.postId;
  connection.query('DELETE FROM posts WHERE postID = ?', [postId], (error, result) => {
    if (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ status: 'error', message: '포스트를 삭제하는 중 오류가 발생했습니다.' });
    } else {
      console.log('Post deleted successfully');
      res.json({ status: 'success', message: '포스트가 성공적으로 삭제되었습니다.' });
    }
  });
});


//
app.post('/api/ScrollView', async(req, res) => {
  const {pathname,postID,UID,isFirst} = req.body; 
  console.log("***@@@ scrollview log @@@***\npathname: ",pathname,"\npostID: ",postID,"\nUID: ",UID,"\nisFirst: ",isFirst); 
  if(pathname==='/'){//main page
    const data =await recommendAlgo.runQueries(UID,isFirst);
    res.json(data);
  }else if(pathname==='/announcement'){//announcement page
    connection.query('select * from announcements order by create_at DESC',(error,result)=>{
      if(error){
        res.status(500).json({ error: '데이터베이스에서 데이터를 가져오는 중 오류가 발생했습니다.' });
      }else{
        res.json([result,true]);
      }
    })
  }
  else{//post page
    const data = await reviewListAlgo.bookList(UID,postID,isFirst);
    res.json(data);
  }
});

app.post('/api/ScrollViewIsFirst', async(req, res) => {
  const {pathname,postID,UID,isFirst} = req.body; 
  if(pathname==='/'){//main page
    const data =await recommendAlgo.runQueries(UID,isFirst);
  }else if(pathname==='/announcement'){//announcement page
  }
  else{//post page
    const data = await reviewListAlgo.bookList(UID,postID,isFirst);
  }
});


// /api/postpage/{postid} 로 post 정보 보내기
app.get('/api/postpage/:postId',(req,res)=>{
  const postId = req.params.postId;
  const query ="SELECT * FROM (SELECT * FROM posts WHERE postID=?) AS filtered_posts LEFT JOIN books ON filtered_posts.isbn = books.isbn UNION DISTINCT SELECT * FROM (SELECT * FROM posts WHERE postID=?) AS filtered_posts RIGHT JOIN books ON filtered_posts.isbn = books.isbn";
  connection.query(query,[postId,postId],(error,result)=>{
    if(error){
      console.log(error);
      res.status(500).json({ error: '데이터베이스에서 데이터를 가져오는 중 오류가 발생했습니다.' });
    }else{      
      console.log(result);
      res.json(result);
    }
  });
});

// /api/post/{postid} 로 post 정보 보내기
app.post('/api/post/:postId',(req,res)=>{
  const postId = req.params.postId;
  const {UID} = req.body;
  //fetch posts table 
  const query ="SELECT * FROM (SELECT * FROM posts WHERE postID=?) AS filtered_posts JOIN books ON filtered_posts.isbn = books.isbn UNION DISTINCT SELECT * FROM (SELECT * FROM posts WHERE postID=?) AS filtered_posts JOIN books ON filtered_posts.isbn = books.isbn";
  connection.query(query,[postId,postId],(error,result)=>{
    if(error){
      console.log("error: ",error);
      res.status(500).json({ error: '데이터베이스에서 데이터를 가져오는 중 오류가 발생했습니다.' });
    }else if(UID!=='null'){
      // store history in history table
      const saveQuery ="insert into history(UID,postID,watch_at) VALUE (?,?,now());"
      connection.query(saveQuery,[UID,postId],(error,result)=>{
        if(error){
          console.log("error: ",error);
          res.status(500).json({ error: '데이터베이스에서 store at history table 중 오류가 발생했습니다.' });
        }else{
          // store success~~!
        }
      }) 
    }

    //스포일러 필터링X 리뷰 result[0], 스포일러 필터링된 리뷰 result[1]
    result.push({...result[0]});
    let a = result[0].name;
    let b = result[0].author;
    let c = a + ' ' + b;
    let spoilerWord = c.split(/[^\p{L}\p{N}]+/u);
    let body = [];
    body.push(result[0].body);
    result[1].body = spoilerFilter.spoilerFilter(body, spoilerWord)[0];

    res.json(result);
  });
});

// /api/books/search/:identifier 로 책 검색 결과 보내기
app.get('/api/books/search/:identifier', (req, res) => {
  const identifier = req.params.identifier;
  const searchQuery = `%${identifier}%`; // 입력된 이름 또는 isbn을 포함하는 책 검색
  connection.query('SELECT * FROM books WHERE name LIKE ? OR isbn LIKE ?', [searchQuery, searchQuery], (error, result) => {
    if (error) {
      res.status(500).json({ error: '데이터베이스에서 책 정보를 가져오는 중 오류가 발생했습니다.' });
    } else {
      if (result.length > 0) {
        res.json(result); // 검색된 책 정보 반환
      } else {
        res.status(404).json({ error: '해당 이름 또는 ISBN을 포함하는 책을 찾을 수 없습니다.' });
      }
    }
  });
});


//filter정보 받아오기
app.post('/api/filter', (req, res) => {
  const {literature,nonFiction} = req.body;
  //const {literature,history,science,art,language,philosophy}= req.body;
  const UID = req.body.UID;
  const filter = [literature,nonFiction];
  //const filter = [literature,history,science,art,language,philosophy];
  const filter_db = filter.map(value=>value?1:0).join("");
  console.log('Received filter:', req.body);
  console.log('filter_db: ',filter_db);

  connection.query('update users set filter=? where UID=?',[filter_db,UID],(error,result)=>{
    if(error){
      res.status(500).json({ error: '데이터베이스에 필터를 저장하는 중 오류가 발생했습니다.' });
    }else{
      res.json({result});
    }
  })
});

//signIn 기능
app.post('/api/signIn', (req, res) => {
  const {uid,email,displayName} = req.body.userData;
  //console.log('Received data:', req.body.userData);
  connection.query('SELECT * FROM users WHERE UID=? ',[uid],(error,result)=>{
    if(error){
      res.status(500).json({ error: '데이터베이스에서 데이터를 가져오는 중 오류가 발생했습니다.' });
    }
    if(result.length==0){// userdata not found
      connection.query('insert into users(UID,name,mail,filter,create_at) VALUE (?,?,?,"000000",now());',[uid,displayName,email],(error,result)=>{
        if(error){
          res.status(500).json({ error: '데이터베이스에 데이터 store 중 오류가 발생했습니다.' });
        }else{//success store new users data into DB
          res.json({isUserExist:true,UID:uid});
        }
      })
    }
    else{//SignIn성공    
      res.json({isUserExist:true,UID:result[0].UID});
    }
  });
});

app.post('/api/library',(req,res)=>{
  const {UID} = req.body;
  connection.query('SELECT * FROM posts WHERE UID=? ORDER BY create_at DESC',[UID],(error,result)=>{
    if(error){
      res.status(500).json({ error: '데이터베이스에서 데이터를 가져오는 중 오류가 발생했습니다.' });
    }
    else{
      console.log(result);
      res.json({result});
    }
  })
})
app.post('/api/like',(req,res)=>{
  console.log("like: ",req.body.checked);
})

  //react에서 route 사용하기 - 맨 밑에 둘 것
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/../front/build/index.html'));
});
