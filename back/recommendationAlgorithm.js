/*
컨텐츠 기반 유사도 계산을 한다. 
1. 최근에 사용자가 본 리뷰 작성날짜기준으로 10개를 데이터베이스에서 가져온다. (1번 리뷰)
2. 데이터베이스에 있는 모든 리뷰에서 카테고리, 작성날짜기준으로 필터링하고 20개 가져온다. (2번 리뷰)
3. 1번 리뷰들 기준으로 2번 리뷰들을 tf-idf계산 후 코사인 유사도 계산한다.
//term frequency 단어 반복수
//idf inverse document freqency 전체문서에서 몇번 나왔는지
//단어들을 벡터화해서 코사인 유사도 계산
4. 유사도 0.2 이상만 객체1(post_obj)에 저장하고 0.2 미만은 객체2(post_obj2)로 빼놓는다.
5. 추천된 리뷰들이 20개 미만이면 위의 과정을 반복한다.
6. 스크롤될 때마다 runQueries()를 실행하고 추천된 리뷰 0~39개가 객체1(post_obj)에 추가된다. 객체1(post_obj)에는 추천된 리뷰들이 정렬되어있다. 
7. 유사도 0.2 이상 리뷰들(객체1)을 모두 보여줬으면 따로 빼놓은 유사도 0.2 미만 리뷰들(객체2)을 보여준다.
8. 카테고리나 사용자가 본 리뷰가 없거나 비로그인 사용자에게는 리뷰 작성일자 기준으로만 추천한다.(비로그인 사용자는 카테고리 필터링도 X -> 로그인 유도)
*/
const spoilerFilter = require("./spoilerFilter");

var excludedPostIDs = [];
var post_obj = []; //유사도 0.2 이상 리뷰 객체
var post_obj2 = []; //유사도 0.2 이하 리뷰 객체
var historyNone = false;
var counter = 1;
var condition = true;
var filter = '';

function tokenizer(document){//모든 단어 추출
    let mecab = require('mecab-ya');
    let tokenized_document = [];
    for(let i in document){
        tokenized_document.push(mecab.morphsSync(document[i], function(err, result){
            if (err) {
                console.error(err);
                return;
            }
        }));
    }
    return tokenized_document;
}

function build_bag_of_words(tokenized_document){//문서 내 단어 등장횟수 세기
    let word_to_index = new Map();
    let total_bow = [];
    let total_document = [];
    let bow = [];
    
    // 하나의 문서로 통합
    for(let index in tokenized_document){
        for(let j in tokenized_document[index]){
            total_document.push(tokenized_document[index][j]);
        }
    }
    
    // 단어에 index 맵핑
    for(let word in total_document){
        if(word_to_index.get(total_document[word]) == null){
            // 처음 등장하는 단어 처리
            word_to_index.set(total_document[word], word_to_index.size);
            total_bow.splice(word_to_index.size - 1, 0, 1);
        }
        else{
            // 재등장하는 단어 처리
            let index = word_to_index.get(total_document[word]);
            total_bow[index] = total_bow[index] + 1;
        }
    }
    
    for(let index in tokenized_document){
        let bow_temp = [];
        bow_temp.length = word_to_index.size;
        bow_temp.fill(0);
        
        // 개별 문서의 BOW 구하기(tf 구하기)
        for(let word in bow_temp){
            let i = word_to_index.get(tokenized_document[index][word]);
            bow_temp[i] = bow_temp[i] + 1;
        }
        
        // NaN 제거
        bow_temp = bow_temp.filter(function(item){
          return item !== null && item !== undefined && item !== '';
        });
        
        bow.push(bow_temp);
    }
        
    return [word_to_index, bow];
}

function get_idf(bow){//단어별 중요도 구하기 - 많이 나온 단어는 안중요함
    let df = [];
    df.length = bow[0].length;
    df.fill(0);
    
    // df 구하기
    for(let i in df){
        for(let index in bow){
            if(bow[index][i] !== 0){
                df[i] += 1;
            }
        }
    }

    let idf = [];
    let N = bow.length; // 전체 문서의 수
    idf.length = bow[0].length;
    idf.fill(0);
    
    // idf 구하기
    for(let i in idf){
        idf[i] = 1 + Math.log(N / (1 + df[i])); // 자연로그
    }
    
    return idf;
}

function get_tfidf(bow, idf){//build_bag_of_words * get_idf 총 중요도 구하기
    // tfidf 구하기
    let tfidf = [];
    
    for(let i in bow){
        let tfidf_temp = [];
        tfidf_temp.length = bow[0].length;
        tfidf_temp.fill(0);
        
        for(let j in bow[0]){
            tfidf_temp[j] = bow[i][j] * idf[j];
        }
        
        tfidf.push(tfidf_temp);
    }
    
    return tfidf;
}

function cosine_similarity(tfidf, docIndex, document_/**/){//1번 리뷰랑 2번 리뷰 유사도 비교,정렬
    // docIndex 문서와 다른 모든 문서를 비교해서 코사인 유사도를 구함
    let cos_sim = [];
    let normalized_doc = normalize(tfidf[docIndex]); // 비교 문서
    
    for(let i in tfidf){
        let scalar_product = 0;
        for(let j in tfidf[i]){
            // docIndex번 벡터와 i번 벡터의 스칼라곱
            scalar_product += tfidf[docIndex][j] * tfidf[i][j];
        }
        
        let cos_sim_temp = 0;
        if(scalar_product === 0){
            // 분자가 0이면 코사인 유사도 = 0
            cos_sim_temp = 0;
        }
        else{
            // 분자가 0이 아니면 코사인 유사도 공식 사용
            cos_sim_temp = scalar_product / (normalized_doc * normalize(tfidf[i]));
            cos_sim_temp = Number(cos_sim_temp.toFixed(5));
        }
        
        let cos_sim_obj = {
            /**/
            similarity: cos_sim_temp,
            body: document_[i]
        };
        cos_sim.push(cos_sim_obj);
    }

    // 유사도 오름차순 정렬    
    cos_sim.sort(function(a, b) {
        return b.similarity - a.similarity;
    });
    
    return cos_sim;
}

function similarity_test(document, Index){//다른 함수들 실행시켜줌
    // 문서 토큰화
    let tokenized_document = tokenizer(document);
    
    // 모든 단어에 index 맵핑
    let result = build_bag_of_words(tokenized_document);
    let vocab = result[0];
    let bow = result[1];

    // 모든 단어의 idf 구하기
    let idf = get_idf(bow);
    
    // 모든 문서의 tfidf 구하기
    let tfidf = get_tfidf(bow, idf);
    
    // 0번 문서와 나머지 문서의 유사도 검사
    let cos_sim = cosine_similarity(tfidf, Index, document/**/);
    let cos_sim_not = [];

    // 유사도 0.2이하는 삭제(절대적 추천 수치)
    for (let i = cos_sim.length - 1; i >= 0; i--) {
        if (cos_sim[i].similarity < 0.2) {
            cos_sim_not.push(cos_sim[i]);
            cos_sim.splice(i, 1);
        }
    }    

    return [cos_sim, cos_sim_not];
}

function normalize(vector){//벡터 정규화 기능
    // 벡터 정규화 공식
    let sum_square = 0;
    for(let i in vector){
        sum_square += vector[i] * vector[i];
    }
    
    return Math.sqrt(sum_square);
}

module.exports = {
    tokenizer,
    build_bag_of_words,
    get_idf,
    get_tfidf,
    cosine_similarity,
    similarity_test,
    runQueries,
}

async function runQueries(UID, isFirst) {
    if (isFirst == true) {
        excludedPostIDs = [];
        post_obj = []; //유사도 0.2 이상 리뷰 객체
        post_obj2 = []; //유사도 0.2 이하 리뷰 객체
        historyNone = false;
        counter = 1;
        condition = true;
        filter = '';

        return
    }

    if (condition === false) {
        return [[],condition];
    }
    
    let result1 = [];
    let total_document = [];
    
    //MYSQL 연결
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

    //데이터베이스에서 유저가 본 리뷰를 시간 순으로 10개를 가져옴
    if (UID != null) {
        const user_history = `SELECT * FROM history JOIN posts ON history.postID = posts.postID WHERE history.UID = "${UID}" ORDER BY watch_at DESC LIMIT 10`;
        const modal_filter = `SELECT filter FROM users WHERE UID = "${UID}"`;
        const results = await query(user_history);
        let filter_obj = await query(modal_filter);
        filter = filter_obj[0].filter;
        result1 = results;
        
        //const result1_modal = await modal_filter(UID);
        //filter = result1_modal[0].filter.toString().split("");
    } else if (UID == null) {
        historyNone = true;
    }

    //리뷰가 없다면
    if (result1.length == 0) {
        historyNone = true;
    } else if (result1.length != 0) {
        let document = [];
        for (let i = 0; i < result1.length; i++) {
            document.push(result1[i].body);
        }

        //1번 리뷰들 하나의 문서로 퉁합
        for(let i in document){
            total_document += document[i];
        }
    }

    if (historyNone == true) {
        try {
            const placeholders = excludedPostIDs.map(() => '?').join(',');
            const sqlQuery = placeholders ?
                //데이터베이스에서 최근 작성된 리뷰들을 20개씩 가져옴
                `SELECT posts.*, books.author, books.name, books.filter FROM posts JOIN books ON posts.isbn = books.isbn WHERE postID NOT IN (${placeholders}) ORDER BY create_at DESC LIMIT 20` :
                `SELECT posts.*, books.author, books.name, books.filter FROM posts JOIN books ON posts.isbn = books.isbn ORDER BY create_at DESC LIMIT 20`;
            let result2 = await query(sqlQuery, excludedPostIDs);

            if (result2.length != 0) {
                for (let i = 0; i < result2.length; i++) {
                    let a = result2[i].name;
                    let b = result2[i].author;
                    let c = a + ' ' + b;
                    let spoilerWord = c.split(/[^\p{L}\p{N}]+/u);
                    let body = [];
                    body.push(result2[i].body);
                    result2[i].body = spoilerFilter.spoilerFilter(body, spoilerWord)[0];
                    post_obj.push(result2[i]);
                }
            } else if (result2.length == 0) {
                condition = false;
            }
                
            // 다음 쿼리에서 제외할 postID 목록 업데이트
            const newPostIDs = result2.map(post => post.postID);
            excludedPostIDs = [...excludedPostIDs, ...newPostIDs];
        } catch (error) {
            throw error;
        } finally {
            connection.end();
            if(condition == false){
                return [post_obj2, condition];
            }
        }
    } else if (historyNone == false) {
        try {
            while (post_obj.length < counter * 20 && condition) {
                const placeholders = excludedPostIDs.map(() => '?').join(',');
                
                //데이터베이스에서 모달 카테고리로 필터링한 후 최근 작성된 리뷰들을 20개씩 가져옴
                const sqlQuery = placeholders ?
                    `SELECT posts.*, books.author, books.name, books.filter FROM posts JOIN books ON posts.isbn = books.isbn WHERE postID NOT IN (${placeholders}) ORDER BY create_at DESC LIMIT 20` :
                    `SELECT posts.*, books.author, books.name, books.filter FROM posts JOIN books ON posts.isbn = books.isbn ORDER BY create_at DESC LIMIT 20`;
                let result2 = await query(sqlQuery, excludedPostIDs);
                
                if (result2.length == 0) {
                    condition = false;
                    
                    break;
                }
                
                // 다음 쿼리에서 제외할 postID 목록 업데이트
                const newPostIDs = result2.map(post => post.postID);
                excludedPostIDs = [...excludedPostIDs, ...newPostIDs];
                
                let data = [];
                data.push(total_document);

                for (let i = 0; i < result2.length; i++) {
                    data.push(result2[i].body);
                }

                //1번 리뷰들(인덱스 0번) 기준으로 2번 리뷰들(인덱스 1 ~ N) 유사도 계산
                let [obj, obj_sim_not] = similarity_test(data, 0);
                let obj2 = [];
                let obj_sim_not2 = [];
                obj.splice(0, 1);

                for (let i = 0; i < obj.length; i++) {
                    for (let j = 0; j < result2.length; j++) {
                        if (result2[j].body == obj[i].body) {
                            obj2[i] = result2[j];
                            let a = obj2[i].name;
                            let b = obj2[i].author;
                            let c = a + ' ' + b;
                            let spoilerWord = c.split(/[^\p{L}\p{N}]+/u);
                            let body = [];
                            body.push(obj2[i].body);
                            obj2[i].body = spoilerFilter.spoilerFilter(body, spoilerWord)[0];
                        }
                    }
                }

                for (let i = 0; i < obj_sim_not.length; i++) {
                    for (let j = 0; j < result2.length; j++) {
                        if (result2[j].body == obj_sim_not[i].body) {
                            obj_sim_not2[i] = result2[j];
                            let a = obj_sim_not2[i].name;
                            let b = obj_sim_not2[i].author;
                            let c = a + ' ' + b;
                            let spoilerWord = c.split(/[^\p{L}\p{N}]+/u);
                            let body = [];
                            body.push(obj_sim_not2[i].body);
                            obj_sim_not2[i].body = spoilerFilter.spoilerFilter(body, spoilerWord)[0];
                        }
                    }
                }
                
                for (let i = 0; i < obj2.length; i++) {
                    if (filter == '01') {//비문학 필터링
                        if (obj2[i] &&obj2[i].filter == '문학') post_obj.push(obj2[i]);
                    } else if (filter == '10') {//문학 필터링
                        if (obj2[i] &&obj2[i].filter == '비문학') post_obj.push(obj2[i]);
                    } else {
                        post_obj.push(obj2[i]);
                    }
                }
                
                for (let i = 0; i < obj_sim_not2.length; i++) {
                    if (filter == '01') {//비문학 필터링
                        if (obj_sim_not2[i].filter == '문학') post_obj2.push(obj_sim_not2[i]);
                    } else if (filter == '10') {//문학 필터링
                        if (obj_sim_not2[i].filter == '비문학') post_obj2.push(obj_sim_not2[i]);
                    } else {
                        post_obj2.push(obj_sim_not2[i]);
                    }
                }
            }
            counter++;
        } catch (error) {
            throw error;
        } finally {
            connection.end();
            if(condition == false){
                return [post_obj2, condition];
            }
        }
    }
    return [post_obj,condition];
}
