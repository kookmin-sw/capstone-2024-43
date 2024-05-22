import React, { useEffect, useState } from "react";
import styles from "../css/MorePage.module.css";
import MoreButton from "./MoreButton";
import { useNavigate } from "react-router-dom";
function MorePage() {
    const navigate = useNavigate();
    const UID = localStorage.getItem('UID');
    const [posts, setPosts] = useState([]); 

    useEffect(() => {//화면이 렌더 될 때 글 목록을 가져온다.
        if (UID !== null) {//only UID exists at localstorage 
            fetch("/api/library", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({UID: UID})
            })
            .then(res => res.json())
            .then(data => {
                setPosts(data.result); 
            })
            .catch(error => {
                console.error("Error:", error);
            })
        }
    }, []);
    return (
        <>
            <div className={styles.box}>
                {/* Functional buttons */}
                <div className={styles.buttonBox}>
                    {/* 정보수정,공지사항,문의하기,로그아웃 */}
                    <MoreButton nav='modifyInfo'/>
                    <MoreButton nav='announcement'/>
                    <MoreButton nav='contactUs'/>
                    <MoreButton nav='signOut'/>                   
                </div>
                {/* Written Posts */}
                <div className={styles.libraryBox}>
                    <h2>내 서재</h2>
                    <div className={styles.postsContainer}>
                        {console.log(posts.length)}
                        {posts.length===0  &&  <span>작성된 후기가 없습니다. 후기를 작성해보세요</span>}
                        {posts.map(post => (
                            <div key={post.postID} 
                                className={styles.postBox} 
                                onClick={()=>{navigate(`/post/${post.postID}`);}}>
                                {post.title}  {/* Assuming posts have a title property */}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Drafts */}
                <div className={styles.libraryBox}>
                    {/* Other components for drafts could be similar */}
                </div>
            </div>
        </>
    );
}

export default MorePage;
