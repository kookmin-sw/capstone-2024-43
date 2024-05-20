import React, { useState } from "react";
import styles from "../css/SignIn.module.css";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function SignIn(){
    const googleLogo = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_109_83)">
    <path d="M19.7613 10.2302C19.7613 9.55044 19.7061 8.86699 19.5886 8.19824H10.1562V12.0491H15.5577C15.3335 13.291 14.6134 14.3897 13.5588 15.0878V17.5864H16.7813C18.6736 15.8448 19.7613 13.2726 19.7613 10.2302Z" fill="#4285F4"/>
    <path d="M10.1565 20.0008C12.8535 20.0008 15.128 19.1152 16.7852 17.5867L13.5627 15.088C12.6661 15.698 11.5087 16.0434 10.1601 16.0434C7.55128 16.0434 5.33927 14.2833 4.54559 11.917H1.22021V14.4928C2.91781 17.8696 6.37546 20.0008 10.1565 20.0008V20.0008Z" fill="#34A853"/>
    <path d="M4.5417 11.917C4.12281 10.675 4.12281 9.3302 4.5417 8.08824V5.51245H1.22C-0.198334 8.3381 -0.198334 11.6671 1.22 14.4928L4.5417 11.917V11.917Z" fill="#FBBC04"/>
    <path d="M10.1565 3.95805C11.5821 3.936 12.9601 4.47247 13.9926 5.45722L16.8476 2.60218C15.0398 0.904587 12.6404 -0.0287217 10.1565 0.000673888C6.37546 0.000673888 2.91781 2.13185 1.22021 5.51234L4.54191 8.08812C5.33192 5.71811 7.54761 3.95805 10.1565 3.95805V3.95805Z" fill="#EA4335"/>
    </g>
    <defs>
    <clipPath id="clip0_109_83">
    <rect width="20" height="20" fill="white"/>
    </clipPath>
    </defs>
    </svg>
    ;
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    const auth_google = () => signInWithPopup(auth, provider)
        .then( result => {
            // const credential = GoogleAuthProvider.credentialFromResult(result);
            // const token = credential.accessToken;
            setUser(result.user);
            
            fetch('/api/signIn',{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({userData:result.user})
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                localStorage.setItem('UID',result.user.uid);
                navigate('/');//홈으로 이동
            })
            .catch(error=>console.error('Error:', error));
        }).catch( error => {
            // const credential = GoogleAuthProvider.credentialFromError(err);
            // const errorCode = err.code;
            // const errorMessage = err.message;
            // const email = err.customData.email;
            console.log("error: ",error);
        });
        
    return (<>
    <div className={styles.signInBody}>
        <div className={styles.logoNameBox}>
        <span className={styles.signInLogoName}>"문향"</span>
        <span className={styles.subLogoName}>문자의 향기를 찾아보세요</span>
        </div>
        {/* <div className={styles.logo}></div> */}
        <div className={styles.buttonBox}>
            {/* 메인화면으로 이동 버튼 */}
        <button className={styles.toMainButton}onClick={()=>{navigate('/')}}>메인화면으로 이동하기</button>
            {/* 구글 로그인 버튼 */}
        <button className={styles.googleButton} onClick={auth_google}>
    {googleLogo}
    <span>구글로 시작하기</span>
</button>

        </div>
        {/* <ul>
            { // Auth 테스트
            ["displayName", "email", "uid"].map( e => 
                <li>{e}: {JSON.stringify(user[e])}</li>
            )} 
        </ul> */}
    </div>
    </>);
}
export default SignIn;