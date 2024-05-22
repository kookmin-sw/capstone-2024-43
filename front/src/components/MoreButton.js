import React from "react";
import styles from "../css/MoreButton.module.css";
import { useNavigate } from "react-router-dom";

function MoreButton({nav}){// 'modifyInfo''announcement''contactUs''signOut'
    const navigate = useNavigate();

    const svg = {
        announcement:<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4.375V7.75M10 11.125V11.0404M12.4457 14.3043L10 19L7.75 14.3043H3.25C2.00736 14.3043 1 13.297 1 12.0543V3.25C1 2.00736 2.00736 1 3.25 1H16.75C17.9926 1 19 2.00736 19 3.25V12.0543C19 13.297 17.9926 14.3043 16.75 14.3043H12.4457Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>,
        signOut:<svg width="19" height="23" viewBox="0 0 19 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 16.6L2.16591 15.3532C3.83857 17.0467 6.16175 17.7065 8.73004 17.7065C13.8254 17.7065 17.956 13.5759 17.956 8.48052C17.956 5.95344 16.94 3.66367 15.2942 1.9974L16.4597 1M9.22857 17.7065V21.4M9.22857 21.4H3.74286M9.22857 21.4H14.4649M14.2 8.2C14.2 11.5137 11.5137 14.2 8.2 14.2C4.88629 14.2 2.2 11.5137 2.2 8.2C2.2 4.88629 4.88629 2.2 8.2 2.2C11.5137 2.2 14.2 4.88629 14.2 8.2Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>,
        contactUs:<svg width="13" height="24" viewBox="0 0 13 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4811 6.07196L11.4811 17.2812C11.4811 20.3321 9.37344 22.8 6.26282 22.8C3.2119 22.8 1.2002 20.3918 1.2002 17.2812L1.20019 4.68084C1.20019 2.75238 2.75252 1.20005 4.68099 1.20005C6.60945 1.20005 8.16178 2.75238 8.16178 4.68084L8.16178 17.5025C8.16178 18.4636 7.38258 19.2428 6.42139 19.2428C5.46019 19.2428 4.68099 18.4636 4.68099 17.5025L4.68099 6.07196" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>,
        modifyInfo:<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.3999 19.5124C1.3999 15.7369 4.55419 12.6762 10.9999 12.6762C17.4456 12.6762 20.5999 15.7369 20.5999 19.5124C20.5999 20.1131 20.1617 20.6 19.6211 20.6H2.37873C1.83814 20.6 1.3999 20.1131 1.3999 19.5124Z" stroke="black" stroke-width="2"/><path d="M14.5999 5.00002C14.5999 6.98825 12.9881 8.60002 10.9999 8.60002C9.01168 8.60002 7.3999 6.98825 7.3999 5.00002C7.3999 3.0118 9.01168 1.40002 10.9999 1.40002C12.9881 1.40002 14.5999 3.0118 14.5999 5.00002Z" stroke="black" stroke-width="2"/></svg>,
    }
    const svgName={
        modifyInfo:"내 정보 수정",
        announcement:"공지사항",
        contactUs:"개발 팀",
        signOut:"로그아웃",
    }
    const handleClickFunction={
        modifyInfo:()=>{},
        announcement:()=>{navigate('/announcement')},
        contactUs:()=>{window.open('https://github.com/kookmin-sw/capstone-2024-43','_blank');},
        signOut:()=>signOutSequence(),
    }
    const signOutSequence=()=>{
        localStorage.clear();
        navigate('/signIn');
    }
    return (<>
    <div className={styles.MoreButton} onClick={handleClickFunction[nav]}>
        <span>{svgName[nav]}</span>
        {/* {svg[nav]} */}
    </div>
    </>);
}

export default MoreButton;