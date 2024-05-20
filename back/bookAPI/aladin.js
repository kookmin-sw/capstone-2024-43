// 하루 호출 5000건 제한

/* 알라딘 API

상품검색
    link:
        http://www.aladin.co.kr/ttb/api/ItemSearch.aspx

    parameters:
        *TTBKey
        *Query
        // 이하 options
        QueryType = *Keyword | Title | Author | Publisher
        SearchTarget = *Book | Foreign | Music | DVD | Used | eBook | All
        Start (int) = *1
        MaxResults (int) = *10
        Sort = *Accuracy | PublishTime | Title | SalsePoint | CustomerRating | MyReviewCount
        Cover = Big | MidBig | *Mid | Small | Mini | None
        CategoryId (int)
        Output = *XML | JS
        InputEncoding = *utf-8
        ResentPublishFilter (int) = *0

상품 조회
    link:
        http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx

    parameters:
        *TTBKey
        *ItemId
        // 이하 options
        ItemIdType = *ISBN | ISBN13 | ItemId
        Cover = Big | MidBig | *Mid | Small | Mini | None
        Output = *XML | JS

outputs:
    version
    title
    link
    pubDate
    totalResults
    startIndex
    itemsPerPage
    query
    searchCategoryId
    searchCategoryName
    item
        title
        link
        author
        pubdate
        description
        isbn
        isbn13
        pricesales
        pricestandard
        customerReviewRank
        subInfo
            ...
*/

import { keys } from "./key.js";
import { parseStringPromise } from "xml2js";

export function prettifyObject(obj) {
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key) && Array.isArray(obj[key])) {
            if (obj[key].length == 1)
                obj[key] = obj[key][0];
        
            prettifyObject(obj[key]);
        }
    }
}

export async function requestAladin(type, query_or_ISBN, options) {
    const params = {
        TTBKey: keys.aladin,
        Cover: "Big",
    };

    if (type === "search") {
        Object.assign(params, {Query: query_or_ISBN});
    } else {
        Object.assign(params, {
            ItemId: query_or_ISBN,
            ItemIdType: "ISBN13",
        });
    }
    
    Object.assign(params, options)

    let url = `http://www.aladin.co.kr/ttb/api/${
        type === "search" ? "ItemSearch" : "ItemLookUp"
    }.aspx?`;
    for (const param in params) {
        if (Object.hasOwnProperty.call(params, param))
            url += `${param}=${params[param]}&`;
    }

    const res = await fetch(url);
    const data = (await parseStringPromise(await res.text())).object;
    prettifyObject(data);
    return data;
}

// requestAladin('lookUp', '9788954442718').then(res => {
//     console.log(res.item);
// });