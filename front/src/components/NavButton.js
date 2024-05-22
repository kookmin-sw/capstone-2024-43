import React,{useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/NavButton.module.css';
import moreImg from '../imgs/more.svg';
import postImg from '../imgs/post.svg';
import libraryImg from '../imgs/library.svg'; 
import filterImg from '../imgs/filter.svg';
import logoImg from '../imgs/logo.svg';
import Modal from 'react-modal';// 설치 필요 'npm install react-modal'

const customStyles = {//modal css 임시적용
   content: {
     top: '50%',
     left: '50%',
     right: 'auto',
     bottom: 'auto',
     marginRight: '-50%',
     transform: 'translate(-50%, -50%)',
   },
 };

function NavButton(props) {
  const UID = localStorage.getItem('UID');
  const nav = props.nav; //{filter , post , library , more , logo}
  const navigate = useNavigate();
   
  // NavButton click handler
  function onclickHandler() {
    if (nav === "filter" && UID!==null) {
      openModal();
      return;
    } else if (nav === "logo"){
       navigate(`/`);
      window.location.reload();
    } else {//비회원 post 기능 허용할지 의논필요 
       if(UID===null)openModal2();
       else navigate(`/${nav}`);
    }
  } 
  function openModal(){
    console.log("open modal ")
    setIsOpen(true);
  }
  function openModal2() {
    console.log("signIn please..")
    setIsOpen2(true);
  }

  function selectImage(){//nav 에 따라 이미지 변경 require로 동적 처리 하려했는데 실패해서 정적처리한 후 일일히 지정
    if(nav==='filter') return filterImg;
    else if (nav==='more') return moreImg;
    else if (nav==='library') return libraryImg;
    else if (nav=== 'post') return postImg;
    else if (nav=== 'logo') return logoImg;
  }
  //const image = selectImage();
  const image = {
    filter : <svg width="52" height="52" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.46154 6H14.5385M1 1H17M7.15385 11H10.8462" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    ,
    more:<svg width="52" height="52" viewBox="0 0 22 7" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.8 3.4C5.8 4.72548 4.72548 5.8 3.4 5.8C2.07452 5.8 1 4.72548 1 3.4C1 2.07452 2.07452 1 3.4 1C4.72548 1 5.8 2.07452 5.8 3.4Z" stroke="black" stroke-width="2"/><path d="M13 3.4C13 4.72548 11.9255 5.8 10.6 5.8C9.27452 5.8 8.2 4.72548 8.2 3.4C8.2 2.07452 9.27452 1 10.6 1C11.9255 1 13 2.07452 13 3.4Z" stroke="black" stroke-width="2"/><path d="M20.2 3.4C20.2 4.72548 19.1255 5.8 17.8 5.8C16.4745 5.8 15.4 4.72548 15.4 3.4C15.4 2.07452 16.4745 1 17.8 1C19.1255 1 20.2 2.07452 20.2 3.4Z" stroke="black" stroke-width="2"/></svg>
    ,
    library:<svg width="52" height="52" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.7999 1.3999H3.53324C2.35503 1.3999 1.3999 2.35503 1.3999 3.53324V14.1999V18.4666C1.3999 19.6448 2.35503 20.5999 3.53324 20.5999H14.1999H18.4666C19.6448 20.5999 20.5999 19.6448 20.5999 18.4666V7.7999V3.53324C20.5999 2.35503 19.6448 1.3999 18.4666 1.3999H7.9999M6.7999 8.16513V6.99514M15.1999 8.16513V6.99514M7.65256 14.6001C9.02072 15.6602 12.0888 15.6602 14.0006 14.6001M10.3999 11.6751L10.6484 11.4328C10.8735 11.2134 10.9999 10.9158 10.9999 10.6055V7.58014" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>
    ,
    post:<svg width="52" height="52" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.2 5.2H5.22812M8.8 5.2H8.82812M15.9719 5.2H16M12.4 5.2H12.4281M7 8.8H7.02812M10.6 8.8H10.6281M14.2 8.8H14.2281M3.4 13H17.8C19.1255 13 20.2 11.9255 20.2 10.6V3.4C20.2 2.07452 19.1255 1 17.8 1H3.4C2.07452 1 1 2.07452 1 3.4V10.6C1 11.9255 2.07452 13 3.4 13Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    ,
    logo:<svg width="52" height="52" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.3999 19.2058L2.72011 17.794C4.61414 19.7116 7.24477 20.4587 10.1529 20.4587C15.9226 20.4587 20.5999 15.7815 20.5999 10.0118C20.5999 7.15025 19.4494 4.55744 17.5858 2.67066L18.9056 1.54126M16.3468 9.69412C16.3468 13.4464 13.305 16.4882 9.55276 16.4882C5.80051 16.4882 2.75871 13.4464 2.75871 9.69412C2.75871 5.94187 5.80051 2.90007 9.55276 2.90007C13.305 2.90007 16.3468 5.94187 16.3468 9.69412Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    ,

  }
  const imageName = {
    filter : "필터",
    more:  "더보기",
    library: "서재",
    post: "글쓰기",
    logo: "\"문향\"",

  }
  //여기서 부터 모달 관리
  let subtitle="modal";
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);

  useEffect(() => {
    const appElement = document.getElementById('modalContainer');
    const appElement2 = document.getElementById('modalContainer2');
    Modal.setAppElement(appElement);
    Modal.setAppElement(appElement2);

  }, []);
   
  
  function afterOpenModal() {
       //modal 이 열리고 난 이후 적용시킬 것을 적으면 된다~
       //subtitle.style.color = '#f00';
  }
  function closeModal(num) {
    if(num===1){
      setIsOpen(false);window.location.reload();
      return;
    }else{
      setIsOpen2(false);
      return ;
    }
  }
  // 체크박스 상태
  const [checkboxStates, setCheckboxStates] = useState({
      literature: false,
      nonFiction:false,
      // history: false,
      // science: false,
      // art: false,
      // language: false,
      // philosophy: false,
      UID:UID
 });
  
  // 체크박스 상태 변경 핸들러
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxStates(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };
  // 폼 제출 핸들러
  const handleSubmit = (event) => {
      event.preventDefault(); // 페이지 리로드 방지
      fetch('/api/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkboxStates)
      })
      .then(response => response.json())
      .then(data => {
        console.log('modal submit success:', data);
        closeModal(1);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };



  const toSignIn = ()=>{
    navigate('/signIn');
  }
  return (
    <>
    <span id={styles.buttonBody} onClick={onclickHandler}>
      {/* {image[`${nav}`]} */}
       {/* <img id={styles.img}src={image} alt={nav}/> */}
       <span id={styles.buttonName} name={nav}>{imageName[nav]}</span>
    </span>
      
    <div id="modalContainer">
      <Modal
        isOpen={isOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={()=>{closeModal(1)}}
        style={customStyles}
        contentLabel="Filter Modal"
      >
        <h2 ref={(_subtitle) => (subtitle = _subtitle)}>추천받고 싶지 않는 항목을 선택해주세요</h2>
        <form name="filter" onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',justifyContent:'space-around'}}>
        {/* 총류 / 철학,심리학,윤리학 / 종교 / 사회과학 / 자연과학 / 기술과학 / 예술 / 언어 / 역사 / 문학 */}
          <label><input name="literature" type="checkbox" checked={checkboxStates.literature} onChange={handleCheckboxChange} />문학</label>
          <label><input name="nonFiction" type="checkbox" checked={checkboxStates.nonFiction} onChange={handleCheckboxChange} />비문학</label>
          {/* <label><input name="history" type="checkbox" checked={checkboxStates.history} onChange={handleCheckboxChange} />역사, 사회과학</label>
          <label><input name="science" type="checkbox" checked={checkboxStates.science} onChange={handleCheckboxChange} />기술, 자연과학</label>
          <label><input name="art" type="checkbox" checked={checkboxStates.art} onChange={handleCheckboxChange} />예술</label>
          <label><input name="language" type="checkbox" checked={checkboxStates.language} onChange={handleCheckboxChange} />언어</label>
          <label><input name="philosophy" type="checkbox" checked={checkboxStates.philosophy} onChange={handleCheckboxChange} />철학,심리,윤리</label> */}
         </div>
          <div style={{display:'flex',justifyContent:'space-around',marginTop:'10px'}}>
          <input type="submit" value="확인"/>
          <button className={styles.xButton}onClick={()=>{closeModal(1)}}>닫기</button>
          </div>
        </form>
      </Modal>
    </div>
    <div id="modalContainer2">
      <Modal
        isOpen={isOpen2}
        onRequestClose={()=>{closeModal(2)}}
        style={customStyles}
        contentLabel="SignIn Modal"
      >
        
        <h3>로그인을 하여 기능을 사용해보세요</h3>
        <div style={{display:'flex',justifyContent:'space-around'}}>
        <button onClick={toSignIn}>로그인하기</button>
        <button onClick={()=>{closeModal(2)}}>닫기</button>
        </div>
      </Modal>
    </div>
    </>
  );
}

export default NavButton;
