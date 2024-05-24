import React, { useEffect, useState, useRef } from 'react';
import PostFragment from './PostFragment';
import styles from "../css/ScrollView.module.css";
import { useParams, useLocation } from 'react-router-dom';

function ScrollView() {
  const { pathname } = useLocation();
  const { postId } = useParams();
  const UID = localStorage.getItem('UID');
  const [isFirst, setIsFirst] = useState(true);
  const [listEndVisibility, setListEndVisibility] = useState("visible");
  const count = 10;
  const indexRef = useRef(0); // index를 useRef로 관리
  const [fragments, setFragments] = useState([]);
  useEffect(()=>{
    if (pathname === '/announcement') setListEndVisibility("hidden");
  },[pathname])
  

  useEffect(() => {
    fetch("/api/ScrollViewIsFirst", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pathname: pathname, isFirst: isFirst })
    }).then(() => setIsFirst(false)); // 초기 요청 후 isFirst 업데이트
  }, []);

  useEffect(() => {
    
    const options = {
      root: null,
      threshold: 0.1
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log("entry.isIntersecting");
          const reqObject = {
            pathname: pathname,
            postID: postId,
            UID: UID,
          };
          fetch("/api/ScrollView", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(reqObject)
          })
          .then(res => res.json())
          .then(json => {
            console.log(json);
            const newFragments = [];
            const jsonLength = json[0].length;
            if(json[1]===false){
              indexRef.current=0;
            }
            if (jsonLength === 0) {
              setListEndVisibility("hidden");
              console.log("No more data");
              return;
            }
            console.log("<",indexRef.current," , ",jsonLength,">");
            for (let i = indexRef.current; i < jsonLength; i++) {
              newFragments.push(<PostFragment key={i} postId={json[0][i].postID || json[0][i].id} post={json[0][i].body} />);
            }
            
            setFragments(prevFragments => [...prevFragments, ...newFragments]);
            indexRef.current = jsonLength;
          })
          .catch((error) => {
            console.log("error: " + error);
          });
        }
      });
    }

    const observer = new IntersectionObserver(callback, options);
    const target = document.querySelector(`.${styles.listEnd}`);
    if (target) {
      observer.observe(target);
    }
    return () => observer.disconnect();
  }, [pathname, postId, UID]);

  useEffect(() => {
    document.documentElement.style.setProperty('--listEndVisibility', listEndVisibility);
  }, [listEndVisibility]);

  return (
    <div className={styles.mainBox}>
      <div className="list">
        {fragments}
      </div>
      <div className={styles.listEnd}></div>
    </div>
  );
}

export default ScrollView;
