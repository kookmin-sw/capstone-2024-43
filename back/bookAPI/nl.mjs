/* 국립중앙도서관 openAPI

link:
    https://www.nl.go.kr/NL/search/openAPI/search.do
    
parameters:
    *key
    srchTarget = *total | title | author | publisher | cheonggu
    kwd
    pageNum (int)
    pageSize (int)
    systemType = 오프라인자료 | 온라인자료
    sort = ititle | iauthor | ipublisher | ipub_year | cheonggu
    order = asc | desc
    apiType = xml | json

    detailSearch = true | false <- If true, n = [1, 4]:
        fn = total | title | keyword | author | publisher
        vn
        andn = AND | OR | NOT

outputs:
    kwd
    category
    pageNum
    pageSize
    sort
    total <- 검색건수
    title_info
    type_name
    place_info
    author_info
    pub_info
    isbn
*/