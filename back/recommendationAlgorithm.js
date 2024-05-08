/*
컨텐츠 기반 유사도 계산을 한다. 
1. 최근에 사용자가 본 리뷰 10개를 데이터베이스에서 가져온다.
2. 카테고리, 최근 작성된 리뷰 20개 가져온다.
3. 1번 리뷰들 기준으로 2번 리뷰들을 tf-idf계산 후 코사인 유사도 계산한다.
4. 유사도 0.2 미만은 추천하지 않게 필터링한다.
5. 추천된 리뷰들이 20개 미만이면 위의 과정을 반복한다.
6. 스크롤될 때마다 runQueries()를 실행하고 추천된 리뷰 20~39개가 post_obj에 추가된다. post_obj에는 추천된 리뷰들이 정렬되어있다.
7. 웹사이트에 post_obj를 인덱스 0부터 순서대로 20개씩 보여주면 된다. 스크롤 될 때마다 0~19, 20~39, 40~ 59 ... 이런식으로

@@@@@@@@@
문제점 : 
1. 추천된 리뷰가 20~39개이다.
2. 결과값 고려X         결과값 -> body(리뷰) UID(작성자 아이디) create_at(작성날짜)
*/

function tokenizer(document){//모든 단어 추출
    let mecab = require('mecab-ya');
    let tokenized_document = [];
    for(let i in document){
        tokenized_document.push(mecab.morphsSync(document[i], function(err, result){
            if (err) {
                console.error(err);
                return;
            }
            //console.log(result);
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
    //console.log('total document : ', total_document);
    
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
    
    //console.log('vocabulary : ', word_to_index);
    //console.log('bag of words vectors(term frequency) : ', bow);
    
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
    //console.log('document frequency : ', df);

    let idf = [];
    let N = bow.length; // 전체 문서의 수
    idf.length = bow[0].length;
    idf.fill(0);
    
    // idf 구하기
    for(let i in idf){
        idf[i] = 1 + Math.log(N / (1 + df[i])); // 자연로그
    }
    //console.log('inverse document frequency : ',idf);
    
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
    //console.log('TF-IDF : ', tfidf);
    
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
    //console.log('tokenized_document : ', tokenized_document);
    
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
    
    // 유사도 0.2이하는 삭제(절대적 추천 수치)
    for (let i = cos_sim.length - 1; i >= 0; i--) {
        if (cos_sim[i].similarity < 0.2) {
            cos_sim.splice(i, 1);
        }
    }    

    return cos_sim
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
};

let excludedPostIDs = [];
let post_obj = [];

async function runQueries() {
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
    /*
    //데이터베이스에서 유저가 본 리뷰를 시간 순으로 10개를 가져옴
    const result1 = await query('SELECT * FROM 유저 기록 테이블 WHERE user_id = '해당 사용자의 ID' ORDER BY 리뷰를 본 날짜 DESC LIMIT 10');

    let document = [];
    for (let i = 0; i < result1.length; i++) {
        document.push(result1[i].body);
    }

    //1번 리뷰들 하나의 문서로 퉁합
    let total_document = [];
    for(let i in document){
        total_document += document[i];
    }
    */

    //1번 리뷰 데이터
    let document = [];
    document.push('출간소식 전해지자마자 샀네요 ~~^^ 읽는 내내 힘이되고 술술 잘읽혀 너무 신기했습니다. 지혜의 보물창고입니다. 책을 읽는 것과 운동하는 것을 특히 강조하셨는데 자극이됩니다. 손웅정님 너무 존경하고 사랑합니다. 앞으로도 함께하겠습니다. 항상 건강하시고 복많이 받으십시오. ^^ 감사합니다'); 
    document.push('제목처럼 읽었고 쓰는 대신 밑줄치고 버렸습니다. 인터뷰 내용이 너무 산만하게 느껴져서 차라리 노트와 생각을 정리해서 출간했으면 어땠을까 아쉬웠습니다. ');
    document.push('독서와 사색의 시간으로 다져진 손웅정 감독님의 삶을 읽는 통찰이 다양한 시각에서 공감을 불러 일으키는 내용으로 묻어났습니다. 인터뷰 형식으로 작성되어 읽기에도 편했구요. 친한 동생에게 조언보다 이 책을 선물하고 싶은 그런 마음입니다.');
    document.push('첫 번째 책이랑 비슷하겠지? 하고 두번째 책을 샀는데인터뷰형식이라 느낌이 완전 달라 또 다르네요.바로 앞에서 손웅정님이 말해주는 것 처럼 그 분의 어법이 바로 느껴져 쉽게 전달이 됐어요. 손웅정님의 인생ㆍ가정교육ㆍ축구에 대한 철학을 이 책 한권으로 또 배워나갑니다.');
    document.push('책장을 한장 넘겼을 뿐인데 2시간이 훌쩍 흘렀습니다. 인터뷰 형식으로 되어 있어 호불호가 갈릴 수 있겠으나 저의 경우에는 오히려 더 좋았습니다. 여러 주제에 대한 감독님의 생각을 두루두루 들을 수 있어 간만에 뜻깊은 독서시간이었습니다.');

    //1번 리뷰들 하나의 문서로 퉁합
    let total_document = [];
    for(let i in document){
        total_document += document[i];
    }

    let condition = true;
    let counter = 1;

    try {
        while (post_obj.length < counter * 20 && condition) {
            const placeholders = excludedPostIDs.map(() => '?').join(',');
            const sqlQuery = placeholders ?
                //데이터베이스에서 최근 작성된 리뷰들을 20개씩 가져옴
                `SELECT * FROM posts WHERE postID NOT IN (${placeholders}) ORDER BY create_at DESC LIMIT 20` :
                `SELECT * FROM posts ORDER BY create_at DESC LIMIT 20`;
            let result2 = await query(sqlQuery, excludedPostIDs);

            if (result2.length == 0) {
                condition = false;
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
            let obj = similarity_test(data, 0, result2);
            obj.splice(0, 1);
            
            for (let i = 0; i < obj.length; i++) {
                post_obj.push(obj[i]);
            }

            counter++;
        }

        console.log('post_obj : ', post_obj);
    } catch (error) {
        throw error;
    } finally {
        connection.end();
    }
}

runQueries();
/*
//1번 리뷰 데이터
let document = [];
document.push('출간소식 전해지자마자 샀네요 ~~^^ 읽는 내내 힘이되고 술술 잘읽혀 너무 신기했습니다. 지혜의 보물창고입니다. 책을 읽는 것과 운동하는 것을 특히 강조하셨는데 자극이됩니다. 손웅정님 너무 존경하고 사랑합니다. 앞으로도 함께하겠습니다. 항상 건강하시고 복많이 받으십시오. ^^ 감사합니다'); 
document.push('제목처럼 읽었고 쓰는 대신 밑줄치고 버렸습니다. 인터뷰 내용이 너무 산만하게 느껴져서 차라리 노트와 생각을 정리해서 출간했으면 어땠을까 아쉬웠습니다. ');
document.push('독서와 사색의 시간으로 다져진 손웅정 감독님의 삶을 읽는 통찰이 다양한 시각에서 공감을 불러 일으키는 내용으로 묻어났습니다. 인터뷰 형식으로 작성되어 읽기에도 편했구요. 친한 동생에게 조언보다 이 책을 선물하고 싶은 그런 마음입니다.');
document.push('첫 번째 책이랑 비슷하겠지? 하고 두번째 책을 샀는데인터뷰형식이라 느낌이 완전 달라 또 다르네요.바로 앞에서 손웅정님이 말해주는 것 처럼 그 분의 어법이 바로 느껴져 쉽게 전달이 됐어요. 손웅정님의 인생ㆍ가정교육ㆍ축구에 대한 철학을 이 책 한권으로 또 배워나갑니다.');
document.push('책장을 한장 넘겼을 뿐인데 2시간이 훌쩍 흘렀습니다. 인터뷰 형식으로 되어 있어 호불호가 갈릴 수 있겠으나 저의 경우에는 오히려 더 좋았습니다. 여러 주제에 대한 감독님의 생각을 두루두루 들을 수 있어 간만에 뜻깊은 독서시간이었습니다.');

//1번 리뷰들 하나의 문서로 퉁합
let total_document = [];
for(let i in document){
    total_document += document[i];
}

let data = [];
data.push(total_document);

// 2번 리뷰 데이터
data.push('읽고 쓰고 버린 후에 남은 문장들. 그 문장들이 핑과 퐁으로 만나 핑퐁 같은 대화가 죽 이어진다. 대화가 거듭될수록 펑펑 터지는 앎, 푹푹 빠지는 삶. 유쾌하고도 깊고, 날렵하면서도 묵직한 책이다.');
data.push('인터뷰집을 좋아하는데 손웅정님 인터뷰라 더 말할 나위 없이 좋았다. 에너지를 듬뿍 받아가는 느낌. 전작의 손웅정이 튀어나와 나에게 말을 건네는, 나와 대화하는 느낌이었다. 대가들은 다 다르지만 또 다 비슷하다. 육십대의 육체와 정신이 이렇게 파릇파릇할 수 있다니 놀라울 뿐이다. 간만에 나를 반성하고 의미있는 삶을 살려고 노력해본다.');
data.push('보자마자 망설임없이 구매합니다. 이렇게라도 쌤께 감사한 마음을 전할수 있어 기쁘네요.^^');
data.push('친필 싸인본이어서 더 바로 사야하는 이유가 생겼어요. 편히 보려고 분철까지 했어요. ');
data.push('교보랑 예스랑 싸인본 마감되서 알라딘 들어왔는데 알라딘은 아직있네요 다행 휴');
data.push('하루종일 책 때문에 온 인터넷 서점을 돌아댕기고 여기저기 눌러보며 서로 의견 교환하며 기다렸던책!!?!! 드디어 구매하니 한결 마음이 편합니다. 정말 축하드리고 쇄를 거듭하는 베스트셀러로 등극 하시길 기원합니다.');
data.push('하이큐!! 매거진 2024 MAY 최고입니다. !!');
data.push('극장판 개봉특집인가 매거진과 잡지 같이 나왔네용~!! ');
data.push('스마트폰중독자 스마트폰과 멀어지는 방법 필사 짧은 집중력을 긴 여운으로 바꿔줍니다.');
data.push('사랑에 빠졌을 때를 떠 올리며 온 세상이 가득했을 그 때를 생각하면서 이 그림책을 기대해 봅니다. 의욕이 넘치고 분홍빛깔일 때의 세상.');
data.push('읽고 쓰고 버린 후에 남은 문장들. 그 문장들이 핑과 퐁으로 만나 핑퐁 같은 대화가 죽 이어진다. 대화가 거듭될수록 펑펑 터지는 앎, 푹푹 빠지는 삶. 유쾌하고도 깊고, 날렵하면서도 묵직한 책이다.');
data.push('인터뷰집을 좋아하는데 손웅정님 인터뷰라 더 말할 나위 없이 좋았다. 에너지를 듬뿍 받아가는 느낌. 전작의 손웅정이 튀어나와 나에게 말을 건네는, 나와 대화하는 느낌이었다. 대가들은 다 다르지만 또 다 비슷하다. 육십대의 육체와 정신이 이렇게 파릇파릇할 수 있다니 놀라울 뿐이다. 간만에 나를 반성하고 의미있는 삶을 살려고 노력해본다.');
data.push('보자마자 망설임없이 구매합니다. 이렇게라도 쌤께 감사한 마음을 전할수 있어 기쁘네요.^^');
data.push('친필 싸인본이어서 더 바로 사야하는 이유가 생겼어요. 편히 보려고 분철까지 했어요. ');
data.push('교보랑 예스랑 싸인본 마감되서 알라딘 들어왔는데 알라딘은 아직있네요 다행 휴');
data.push('하루종일 책 때문에 온 인터넷 서점을 돌아댕기고 여기저기 눌러보며 서로 의견 교환하며 기다렸던책!!?!! 드디어 구매하니 한결 마음이 편합니다. 정말 축하드리고 쇄를 거듭하는 베스트셀러로 등극 하시길 기원합니다.');
data.push('하이큐!! 매거진 2024 MAY 최고입니다. !!');
data.push('극장판 개봉특집인가 매거진과 잡지 같이 나왔네용~!! ');
data.push('스마트폰중독자 스마트폰과 멀어지는 방법 필사 짧은 집중력을 긴 여운으로 바꿔줍니다.');
data.push('사랑에 빠졌을 때를 떠 올리며 온 세상이 가득했을 그 때를 생각하면서 이 그림책을 기대해 봅니다. 의욕이 넘치고 분홍빛깔일 때의 세상.');

let post_obj = [];
post_obj = similarity_test(data, 0); //1번 리뷰들(인덱스 0번) 기준으로 2번 리뷰들(인덱스 1 ~ N) 유사도 계산
console.log(post_obj.length);
*/