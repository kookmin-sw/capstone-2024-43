/*
리뷰를 클릭하면 해당 리뷰 책의 다른 리뷰를 보여준다.
클릭한 객체(리뷰)의 isbn을 DB에서 조회해 같은 isbn을 가진 리뷰들을 작성일자 기준으로 정렬해서 보여준다.
*/
const spoilerFilter = require("./spoilerFilter");

var excludedPostIDs = [];
var post_obj = [];
var post_obj2 = [];
var condition = true;

async function bookList(UID, post_id, isFirst) {
    if (isFirst == true) {
        excludedPostIDs = [];
        post_obj = [];
        post_obj2 = [];
        lastcount = false;
        condition = true;

        return
    }

    if (condition === false) {
        return [[], condition];
    }

    //MYSQL 연결
    console.log(post_id);
    const mysql = require('mysql2');
    const util = require('util');
    var db_config  = require('./db-config.json');
    const connection = mysql.createConnection({
    host:db_config.host,
    user:db_config.user,
    password:db_config.password,
    database:db_config.database,
    });

    const query = util.promisify(connection.query).bind(connection);

    try {
        const placeholders = excludedPostIDs.map(() => '?').join(',');
        const sqlQuery = placeholders ?
            //데이터베이스에서 최근 작성된 리뷰들을 20개씩 가져옴
            `SELECT test.*, books.author, books.name, books.filter FROM test JOIN books ON test.isbn = books.isbn WHERE test.isbn IN (SELECT isbn FROM test WHERE postID = '${post_id}') AND postID NOT IN (${placeholders}) ORDER BY create_at DESC LIMIT 20`:
            `SELECT test.*, books.author, books.name, books.filter FROM test JOIN books ON test.isbn = books.isbn WHERE test.isbn IN (SELECT isbn FROM test WHERE postID = '${post_id}') ORDER BY create_at DESC LIMIT 20`;
        let results = await query(sqlQuery, excludedPostIDs);

        const newPostIDs = results.map(post => post.postID);
        excludedPostIDs = [...excludedPostIDs, ...newPostIDs];
        
        if (results.length != 0) {
            for (let i = 0; i < results.length; i++) {
                let a = results[i].name;
                let b = results[i].author;
                let c = a + ' ' + b;
                let spoilerWord = c.split(/[^\p{L}\p{N}]+/u);
                let body = [];
                body.push(results[i].body);
                results[i].body = spoilerFilter.spoilerFilter(body, spoilerWord)[0];
                post_obj.push(results[i]);
            }
        } else if (results.length == 0) {
            condition = false;
        }
    
    } catch (error) {
        throw error;
    } finally {
        connection.end();
        if(condition == false){
            return [post_obj2, condition];
        }
    }
    return [post_obj, condition];
}

module.exports = {
    bookList,
}

