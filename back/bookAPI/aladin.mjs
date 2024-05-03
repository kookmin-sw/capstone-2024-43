/* global fetch*/

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

import { keys } from "./key.mjs";
import { parseStringPromise } from "xml2js";

Object.prototype.prettier = function() {
    for (const key in this) {
        if (Object.hasOwnProperty.call(this, key) && Array.isArray(this[key])) {
            if (this[key].length == 1) {
                this[key] = this[key][0];
            } else if (this[key].length > 1) {
                for (const e of this[key])
                    e.prettier();
            }
        }
    }
};

export async function requestAladin(type, query, options) {
    const params = {
        TTBKey: keys.aladin,
        Cover: "Big",
    };

    if (type === "search") {
        Object.assign(params, {Query: query});
    } else {
        Object.assign(params, {
            ItemId: query,
            ItemIdType: "ISBN13",
        });
    }
    
    Object.assign(params, options);

    let url = `http://www.aladin.co.kr/ttb/api/${
        type === "search" ? "ItemSearch" : "ItemLookUp"
    }.aspx?`;
    for (const param in params) {
        if (Object.hasOwnProperty.call(params, param))
            url += `${param}=${params[param]}&`;
    }

    const res = await fetch(url);
    const data = (await parseStringPromise(await res.text())).object;
    data.prettier();
    return data;
}