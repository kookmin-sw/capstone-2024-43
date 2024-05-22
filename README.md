# 캡스톤 디자인 43팀 : 문향
## 👋프로젝트 소개
2024년 국민대학교 소프트웨어융합대학에서 진행한 캡스톤디자인 수업에 참여한 프로젝트입니다. ( 2024-03-08 ~ 2024-05-27 )
프로젝트 '문향'은 후기를 통해 책을 추천해주는 웹서비스입니다.

This project participated in the Capstone Design course conducted by the College of Software Convergence at Kookmin University in 2024. (March 8, 2024 - May 27, 2024)
The project 'Moonhyang' is a web service that recommends books through reviews.
![포스터](https://github.com/kookmin-sw/capstone-2024-43/assets/85778340/a41b83c4-87e4-40e2-85f5-90e1bd853077)
## 👯팀소개
<table>
  <tr>
    <th>이름</th>
    <th>역할</th>
    <th>깃허브 주소</th>
  </tr>
  <tr>
    <td>박정빈(팀장)</td>
    <td>DB스키마 구성 , 컴포넌트 구성(post 페이지 제외)</td>
    <td><a href="https://github.com/obb8923">@obb8923</a></td>
  </tr>
  <tr>
    <td>이기서</td>
    <td>추천 알고리즘 , 스포일러 필터링 알고리즘</td>
    <td><a href="https://github.com/leegiseo00">@leegiseo00</a></td>
  </tr>
  <tr>
    <td>남혜영</td>
    <td>post 페이지 구성, 에디터 라이브러리를 통해 글 작성,수정,삭제 구현</td>
    <td><a href="https://github.com/hyeyeong-nam">@hyeyeong-nam</a></td>
  </tr>
  <tr>
    <td>유현석</td>
    <td>크롤링을 통해 초기 데이터 수집 , AWS연결-배포 , firebase auth 연결 </td>
    <td><a href="https://github.com/mongwan">@mongwan</a></td>
  </tr>
</table>

## 📋사용법 
### 사용자 매뉴얼
1. `main page` 메인 화면의 무한 스크롤을 탐색하며 마음에 드는 후기를 찾습니다.
2. `main page` 로그인 시 filter 기능을 사용하여 문학/비문학을 선택할 수 있고, 글 작성과 본인이 작성한 글들을 확인할 수 있습니다.
3. `post view page` 후기의 본문을 읽으며 책을 확인하고 싶어지면, '책 정보 확인하기' 버튼을 눌러 책에 대한 정보를 확인할 수 있습니다.
4. `post view page` 책을 구매하고 싶다면, '책 정보 검색하기' 버튼을 눌러 서점의 홈페이지로 이동합니다.
5. `post view page` 같은 책에 대한 후기를 보고 싶다면 무한 스크롤을 탐색하며 같은 책에 대한 다른 후기들을 볼 수 있습니다.
6. `post page` 본인이 읽었던 책에 대한 후기를 작성할 수 있습니다. 
7. `more page` 작성한 후기들을 확인할 수 있습니다.
### 운영자 매뉴얼
#### 요구사항
`react`,`mySQL`,`node`,`express`,`ckeditor5`,`mecab-ya`
####  환경설정
  1. `git clone`을 통해 repository 내용을 복제합니다.
  2. `/front` 와 `/back`  에서 `npm install` 을 하여 종속성을 설치합니다.
  3. `/back` 에서 `db-config.json` 파일을 생성하여 데이터베이스 커넥션 주소를 설정합니다.
```js
//db-config.js
{
    "host": (여기에 호스트 이름 작성),
    "user": (여기에 유저 이름 작성) ,
    "password": (여기에 비밀번호 작성) ,
    "database": (여기에 데이터 베이스 이름 작성),
}
``` 
  5. `/front` 에서 `npm run build`를 하여 빌드파일을 생성합니다.
  6. `/back` 에서 `node index.js` 를 사용하여 서버를 엽니다.

## 📢주요 기능 , 시스템 구조 소개
### 사진
(사진 첨부 예정)
### 영상
(영상 첨부 예정)
### 시스템 구조도
![구조도](https://github.com/kookmin-sw/capstone-2024-43/assets/59199893/e4180832-a12b-4060-873c-8f731a828626)

### ERD
<table>
<tr>
  <th>데이터 베이스 스키마의 변천사</th>
  <th>데이터 베이스 최종</th>
</tr>
<tr>
  <td>
    <img src="https://github.com/kookmin-sw/capstone-2024-43/assets/59199893/368b2b4a-eb1e-4059-b1c5-f35d0df64e87" width=500></img>
  </td>
  <td>
    <img src="https://github.com/kookmin-sw/capstone-2024-43/assets/59199893/12435914-8d28-4112-9d73-a613c3d5ef14" width=500></img>
  </td>
</tr>
</table>

## 📂자료 모음
+ [중간 발표 ppt 링크](https://docs.google.com/presentation/d/1ic5l_8z1M0HQEwmwFP-ypbiUW4xSqV5K/edit?usp=sharing&ouid=105885965673341678510&rtpof=true&sd=true)
+ [중간 보고서 링크](https://drive.google.com/file/d/1l0D16GhmAhauXRc-k0WA7jpPQSjQLIb-/view?usp=sharing)
+ [기말 발표 ppt 링크]()
+ [기말 보고서 링크]()
+ [포스터 링크](https://drive.google.com/file/d/1H5UpHAELGMGlb4UcnMhP-kMgnYlS9RY3/view?usp=drivesdk)


## 🪡사용한 기술

* ### IDE
  <img src="https://img.shields.io/badge/vscode-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white">

* ### LANGUAGE
    <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white">

* ### Tech
  <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white">
    <img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=node.js&logoColor=white">
    <img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/mySQL-4479A1?style=for-the-badge&logo=mySQL&logoColor=white">
* ### COMMUNICATION
  <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">
  <img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white">
