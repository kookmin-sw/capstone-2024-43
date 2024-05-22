import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import TextEditor from './TextEditor';
import '../css/PostPage.css';


/*
editor 라이브러리를 위해 수정함. 
다음과 같이 설치해야 정상적으로 작동함.
npm install @ckeditor/ckeditor5-build-classic
npm install @ckeditor/ckeditor5-react
npm add file:./ckeditor5
*/

function PostPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { postId } = useParams();
  console.log(postId);

  const { isbn } = location.state || {};

  const UID = localStorage.getItem('UID');
  const [editorData, setEditorData] = useState('');
  const [title, setTitle] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null); //선택된 책 상태

  //편집하는 경우 
  console.log(postId);

  //편집하는 경우
  useEffect(() => {
    if (postId) {
      // postId를 사용하여 해당 글의 정보를 가져옴
      fetch(`/api/postpage/${postId}`)
        .then(res => res.json())
        .then(json => {
          // 데이터가 있을 경우 해당 데이터를 적절히 처리하여 state에 저장
          console.log('fetch ok');
          if (json && json[0]) {
            const { title, body, isbn } = json[0];
            setTitle(title);
            setEditorData(body);
            console.log(editorData);

            // 책 이름 가져오기
            fetch(`/api/books/search/${isbn}`)
            .then(res => res.json())
            .then(bookData => {
              // 가져온 책 정보가 있을 때만 책 검색 칸에 보이게 함
              if (bookData && bookData[0]) {
                setBookSearch(bookData[0].name);
                setSelectedBook(bookData[0]); // 선택된 책 설정
              }
            })
            .catch(error => {
              console.error('책 검색 오류:', error.message);
            });
          } else {
            // 데이터가 없을 경우 처리
            console.error('Failed to fetch post data');
          }
        })
        .catch(error => console.error('Error fetching post data:', error));
    } else if (isbn) { // isbn 정보가 전달된 경우 책 검색
      fetch(`/api/books/search/${isbn}`)
        .then(res => res.json())
        .then(bookData => {
          // 검색된 책 정보가 있을 때만 책 검색 칸에 보이게 함
          if (bookData && bookData[0]) {
            setBookSearch(bookData[0].name);
            setSelectedBook(bookData[0]); // 선택된 책 설정
          }
        })
        .catch(error => {
          console.error('책 검색 오류:', error.message);
        });
    }
  }, [postId, isbn]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handlePost = () => {
    // 제목, 내용, 책 정보가 모두 입력되었는지 확인.
    if (
      title.trim() !== '' &&
      editorData.trim() !== '' &&
      selectedBook.isbn.trim() !== ''
    ) {
      // 확인 후 포스팅.
      if (window.confirm('포스팅 하시겠습니까?')) {

        //수정하는 경우 기존 포스트를 삭제하고 새로 포스트 아이디를 발급함.
        //아이디를 현재 시간을 기준으로 하기 때문. 
        if (postId) {
          fetch(`/api/post/${postId}`, {
            method: 'DELETE'
          })
            .then(res => res.json())
            .then(data => {
              if (data.status === 'success') {
                console.log('성공적으로 삭제함');
              } else {
                console.error('삭제 실패함');
              }
            })
            .catch(error => {
              console.error('삭제하는데 오류가 발생함:', error);
            });
        }  

        // 현재 날짜와 시간을 가져옴
        const currentDate = new Date();

        // 연도, 월, 일, 시간, 분, 초를 추출
        const year = currentDate.getFullYear() % 100;
        const month = String(currentDate.getMonth() + 1);
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');

        // 연도, 월, 일, 시간, 분, 초를 조합하여 postId 생성
        const newpostId = `${UID}${year}${month}${day}${hours}${minutes}${seconds}`;
        //postId 시간을 받아서 ->... 

        const cr_at = year + '-' + month + '-' + day;

        //저장 구현 시작.
        const postData = {
          postId: newpostId,
          body: editorData,
          UID: UID, 
          status: 'posting', 
          create_at: cr_at, 
          isbn: selectedBook.isbn,
          title: title,
        };
  
        // 서버에 데이터 전송
        fetch('/api/postpage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
          title: JSON.stringify(postData),
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            alert('포스팅 되었습니다.');
            // 포스팅이 완료되면 페이지 이동 또는 다른 작업 수행
            navigate(`/post/${newpostId}`);
          } else {
            alert('포스팅에 실패했습니다.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('서버와의 통신 중 오류가 발생했습니다.');
        });
      }
    } else {
      // 입력이 누락된 경우 알림. 모두 입력해야 함.
      alert('제목과 내용, 책 정보를 모두 입력해주세요.');
    }
  };

  const handleBookSearchChange = event => {
    setBookSearch(event.target.value);
    setSelectedBook(null); //검색어가 바뀌면 선택된 책 초기화
  };

  const searchBookByName = () => {
    if (bookSearch.trim() !== '') {
      fetch(`/api/books/search/${bookSearch}`)
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('책을 찾을 수 없습니다.');
        })
        .then(bookData => {
          setSearchedBooks(bookData);
        })
        .catch(error => {
          console.error('책 검색 오류:', error.message);
          alert('책을 찾을 수 없습니다.');
          // 책을 찾지 못했을 때 빈 배열로 업데이트
          setSearchedBooks([]);
        });
    } else {
      alert('책 이름을 입력하세요.');
    }
  };

  const handleBookSelect = book => {
    setSelectedBook(book); 
    setBookSearch(book.name); //선택된 책으로 글자 업데이트
  };

  
  return (
    <div className="post-page-container">
      <div>
        <input
          type="text"
          placeholder="제목을 입력하세요..."
          value={title}
          onChange={handleTitleChange}
          className="title-input"
        />
        <button className="post-search-button" onClick={handlePost}>포스팅</button>
      </div>
      <div className="editor-container">
        <div className="ck ck-sticky-panel ck-editor__editable">
          <TextEditor initialData={editorData} setData={setEditorData} />
          {console.log(editorData)}
        </div>
      </div>
       <div className="book-search-container">
        <input
          type="text"
          placeholder="책 검색..."
          value={bookSearch}
          onChange={handleBookSearchChange}
          className="book-search-input"
        />
        <button className="post-search-button" onClick={searchBookByName}>검색</button>
      </div>
      <div className="searched-books">
        {searchedBooks.map(book => (
          <div key={book.isbn} className="book-info" onClick={() => handleBookSelect(book)}>
            <p>제목: {book.name}</p>
            <p>출판사: {book.publisher}</p>
            <p>저자: {book.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostPage;
