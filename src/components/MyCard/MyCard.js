import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import api from '../../api/axios'
import html2canvas from 'html2canvas';
import saveAs from "file-saver";
import styles from './MyCard.module.css';
import { useLocation } from 'react-router-dom';
import  useUserEmailStore from '../../store/userEmail'
import ProgressBar from '../ProgressBar/ProgressBar';
import "xp.css/dist/98.css"

function MyCard() {

  const {userEmail,setUserEmail} = useUserEmailStore();
  const [cards, setCards] = useState([]); //카드 저장용
  const [cardImage, setCardImage] = useState(null);//이미지 저장
  const [isLoading, setIsLoading] = useState(true);//로딩 상태 
  const [isSaving, setIsSaving] = useState(false);//사진 저장 상태 추적
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQR,setShowQR]=useState("false");
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true); // 컴포넌트가 마운트될 때 로딩 시작
    const loadData = async () => {
      try {
        // userEmail이 설정되어 있지 않으면 로드하지 않음
        if (!userEmail) return;
  
        // 카드와 이미지 데이터를 동시에 요청
        await Promise.all([
          fetchCards(userEmail), // 카드 데이터 로드 
          fetchImages(userEmail) // 이미지 데이터 로드 
        ]);
  
        // 모든 데이터 로드가 완료되고 2초 더 기다림 로딩 상태를 종료
        await new Promise((resolve) => setTimeout(resolve, 2500));
        setIsLoading(false);
      } catch (error) {
        console.error("Data fetching failed:", error);
        setIsLoading(false); // 에러 발생 시에도 로딩 상태 종료
      }
    };
  
    loadData();
  }, [userEmail]); // userEmail이 변경될 때마다 이 효과를 다시 실행


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get('userEmail');
    if (email) {
      console.log("url에서 뽑은 userEmail",email);
      setUserEmail(email);
    }
 }, []); //컴포넌트가 마운트될 때, userEmail 추출하고 이를 zustand에 저장 

  //userEmail 변경시 호출됨
  useEffect(() => {
    if (userEmail) {
      console.log("zustand에 저장된 userEmail",userEmail);
    }
  }, [userEmail]); //userEmail이 변경될떄 zustand네 저장된 userEmail 확인 


  // 실행 환경 확인
  function detectBrowser() {
    const userAgent = navigator.userAgent;
  
    // iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }
    // android 
    if (/android/.test(userAgent)) {
       return "Android";
    }
    // Samsung Internet
    if (/SamsungBrowser/.test(userAgent)) {
      return "Samsung Internet";
    }
    
    // If none of the above, return a generic result
    return "Unknown";
  }

  //인앱 브라우저로 접속시 
  useEffect(() => {
    const browserType = detectBrowser();
    // alert(`실행 환경 ${browserType}`);

    // 인앱 브라우저 리디렉션 로직
    const inappdenyExecVanillaJs = (callback) => {
      if (document.readyState !== 'loading') {
        callback();
      } else {
        document.addEventListener('DOMContentLoaded', callback);
      }
    };

    inappdenyExecVanillaJs(() => {
      const inappbrowserout=()=>{
        alert('\n인앱브라우저 호환문제로 인해 Safari로 접속해야합니다.\n\nSafari에서 실행하시면 정상적으로 이용하실 수 있습니다.');
      };

      const userAgent = navigator.userAgent.toLowerCase();
      const target_url = window.location.href;

      // 카카오톡 인앱 브라우저를 감지하고 리디렉션 처리
      if (userAgent.match(/kakaotalk/i)) {
        window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(target_url);
      }else if(userAgent.match(/line/i)){
			
			//라인 외부브라우저로 호출
			if(target_url.indexOf('?') !== -1){
				window.location.href = target_url+'&openExternalBrowser=1';
			}else{
				window.location.href = target_url+'?openExternalBrowser=1';
			}
			
		}else if(userAgent.match(/inapp|naver|snapchat|wirtschaftswoche|thunderbird|instagram|everytimeapp|whatsApp|electron|wadiz|aliapp|zumapp|iphone(.*)whale|android(.*)whale|kakaostory|band|twitter|DaumApps|DaumDevice\/mobile|FB_IAB|FB4A|FBAN|FBIOS|FBSS|trill|SamsungBrowser\/[^1]/i)){
			//그외 다른 인앱들
			if(userAgent.match(/iphone|ipad|ipod/i)){
        inappbrowserout();
			}else{
				//안드로이드는 Chrome이 설치되어있음으로 강제로 스킴실행
				location.href='intent://'+target_url.replace(/https?:\/\//i,'')+'#Intent;scheme=http;package=com.android.chrome;end';
			}
    }
  });
  }, []); //컴포넌트 마운트 시 1회만 실행



  //서버에서 데이터 가져오기, useEmail이 맞을때만
  const fetchCards = () => {
    api.get('/cards')
    .then((response) => {
      const data = response.data;
      // console.log("fetch cards에서 호출 response.data", response.data)
      // console.log("fetch cards에서 호출 userEmail", userEmail)
      if (data.status === 'ok'&& data.data.length > 0) {
        // userEmail에 해당하는 카드들을 필터링
        const userCards = data.data.filter(card => card.userEmail === userEmail);
        // 배열이 이미 생성 순으로 정렬되어 있어야 함!!!
        // 가장 마지막 요소가 가장 최신 카드
        // console.log("fetch cards에서 호출 userCards", userCards)
        const mostRecentCard = userCards[userCards.length - 1];
        // 카드가 존재하면 상태 업데이트
        setCards(mostRecentCard ? [mostRecentCard] : []);
      }
    })
    .catch((error) => {
      console.error("Fetching cards failed:", error);
    });  
  };

  //카드 추가후 cards 배열 확인 
  useEffect(() => {
    console.log("cards배열", cards);
  }, [cards]); // cards가 변경될 때마다 실행

  //서버에서 이미지 가져오기 
  const fetchImages = async () => {
    try {
      const response = await api.get('/images', {
        params: {
          tags: userEmail
        }
        });
      if (response.data && response.data.length > 0) {
        // 이미지 데이터 배열 중 마지막 이미지의 URL을 사용
        setCardImage(response.data[0].url);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
  }};

  //이미지로 저장
  const frontRef = useRef(null); 
  const backRef = useRef(null); //카드 부분 참조

  const saveCardAsImage = async () => {
    setIsSaving(true); // 사진 저장 상태 시작
    setShowQR(true); // QR 코드 보이기 시작_qr이 안찍히는 상황 방지
  };

  const captureCardImage = async (element, filename) => {
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor:null });
      const dataUrl = canvas.toDataURL();
      const rotatedImage = new Image();
      rotatedImage.onload = function() {
        const rotatedCanvas = document.createElement('canvas');
        rotatedCanvas.width = rotatedImage.height;
        rotatedCanvas.height = rotatedImage.width;

        const context = rotatedCanvas.getContext('2d');
        context.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
        context.rotate(-90 * Math.PI / 180);
        context.drawImage(rotatedImage, -rotatedImage.width / 2, -rotatedImage.height / 2);

        rotatedCanvas.toBlob(function(blob) {
          if (blob) {
            saveAs(blob, filename);
          }
        });
      };
      rotatedImage.src = dataUrl;
      alert("사진 저장 성공")
    } catch (error) {
      console.error("Error saving card image:", error);
      alert("사진 저장 중에 문제가 생겼습니다. 다시 시도해주세요")
    }
  };

  // const waitForRender = async () => {
  //         await new Promise((resolve) => setTimeout(resolve, 800));
  // };
  const waitForElement = async (selector, timeout = 3000) => {
    const startTime = new Date().getTime();
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (document.querySelector(selector)) {
          clearInterval(timer);
          resolve(true);
        } else if (new Date().getTime() - startTime > timeout) {
          clearInterval(timer);
          reject(new Error("Element not found"));
        }
      }, 100);
    });
  };

  useEffect(() => {
    // console.log("isSaving",isSaving);
    if (isSaving){
      console.log("사진 저장 실행");
      const timer = setTimeout(async () => {
        setIsFlipped(false); //앞면으로 돌리고
        // await waitForRender();
        await waitForElement('.cardFront'); // 앞면이 화면에 나타날 때까지 기다림
        if (frontRef.current) {
          await captureCardImage(frontRef.current, "card-front.png");
        }
  
        setIsFlipped(true); //뒷면으로 돌리고 
        // await waitForRender();
        await waitForElement('.cardBack'); // 뒷면이 화면에 나타날 때까지 기다림
        if (backRef.current&&showQR) {
          await captureCardImage(backRef.current, "card-back.png");
        }

        // Clean up and set states back to initial values
        setIsFlipped(false);
        await waitForElement('.cardFront'); // 다시 앞면이 화면에 나타날 때까지 기다림
        alert("사진 저장 성공__")
        setIsSaving(false); 
    },100); //0.1초 후 앞,뒤 확인 시작
    // 클린업 함수에서 타이머를 정리
    return () => clearTimeout(timer);
  }
}, [isSaving]); 

const handleEmailClick = () => {
  console.log("이메일 클릭");
  if (cards[0].email) {
    const emailUrl = `mailto:${cards[0].email}`;
    window.open(emailUrl, '_self'); 
  }
};
const handleIgClick = () => {
  console.log("인스타 클릭");
  if (cards[0].ig) {
    console.log('cards[0].ig',cards[0].ig)
    const instagramUrl = `https://www.instagram.com/${cards[0].ig}/`; //비공개 계정도 열러기 해야함
    // const instagramUrl = `https://www.instagram.com/k_nijy/`;
    window.open(instagramUrl, '_blank');
  }
};

  //공유하기 누르면 
  const isShareSupported = () => !!navigator.share; //share api 지원 확인 

  // 텍스트를 클립보드에 복사하는 함수
  const copyToClipboard = async() => {
    try {
      const shareUrl = `https://kimsofficebc.netlify.app/card-info?userEmail=${userEmail}`;
      // const shareUrl = `http://localhost:3000/card-info?userEmail=${userEmail}`;
      console.log("공유 주소",shareUrl);
      // 공유주소를 클립보드에 복사
      await navigator.clipboard.writeText(shareUrl);
      alert("링크가 복사되었어요");
    } catch (err) {
      console.log(err);
    }
  };

  const shareCard = async () => {
    if (isShareSupported()) {
      try {
        console.log("공유 주소",`https://kimsofficebc.netlify.app/card-info?userEmail=${userEmail}`);
        await navigator.share({
          title: `${cards[0].name} 님의 명함`,
          url: `https://kimsofficebc.netlify.app/card-info?userEmail=${userEmail}`,
        });
      } catch (error) {
        console.error("share api 링크 공유 실패:", error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };


  useEffect(()=>{
    console.log("isFlipped 변함", isFlipped);
  },[isFlipped]);

  //카드 뒤집기 애니메이션 
  const handleCardClick = () => {
    // 카드의 뒤집힌 상태를 토글
    setIsFlipped(!isFlipped);
    console.log("card flipped!")

    //앞면->뒷면 (f->t)
    if (isFlipped) {
      setShowQR(true);
      // 애니메이션이 조금 진행된 후 QR 코드를 보여줌
      // 애니메이션 지속 시간이 0.5초일 때
      setTimeout(() => {
        setShowQR(false);
      }, 150); 
    }

    //뒷면->앞면 (t->f)
    if (!isFlipped) {
      setShowQR(false);
      // 애니메이션이 조금 진행된 후 QR 코드를 보여줌
      // 애니메이션 지속 시간이 0.5초일 때
      setTimeout(() => {
        setShowQR(true);
      }, 150); 
    }
  };

  // //backgroundOption에 따라 카드 색 변경
  const cardBackStyle = {
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: isFlipped ? 'rotateX(0deg)' : 'rotateX(180deg)',
  };
  const cardFrontStyle = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform : isFlipped ? 'rotateX(-180deg)' : 'rotateX(0deg)',
  };

  //폰트 번호에 따라 명함 폰트 변경
  const infoItemStyle = {
    position: 'absolute',
  }
  if (cards.length > 0) {
    switch (cards[0].fontOption) {
      case 1:
        infoItemStyle.fontFamily = "DOSSaemmul";
        break;
      case 2:
        infoItemStyle.fontFamily = "WAGURITTF";
        break;
      case 3:
        infoItemStyle.fontFamily = "Ownglyph_meetme-Rg";
        break;
      case 4:
        infoItemStyle.fontFamily = "SUITE-Regular";
        break;
      case 5:
        infoItemStyle.fontFamily = "ChosunCentennial";
        break;
      default: //디폴트는 Arial
        infoItemStyle.fontFamily = "sans-serif";
    }
  }

  let patternUrl;

  if (cards.length > 0) {
    const card = cards[0];
    const backgroundUrlB = `/images/back${card.backgroundOption}.png`; // 배경 이미지 경로 
    console.log(`card.patternOption,${card.patternOption}`);
    patternUrl = card.patternOption ? `/images/${card.patternOption}.png` : undefined;
    const backgroundUrlF = `/images/front${card.backgroundOption}.png`; // 배경 이미지 경로 
    cardBackStyle.backgroundImage = `url('${backgroundUrlB}')`;
    cardFrontStyle.backgroundImage = `url('${backgroundUrlF}')`;
  }

  //처음에 로딩 화면 띄우려고
  if (isLoading) {
    return (
      <div className={styles.popUp}>
        <div className={styles.popUpContent}>
          <div>카드 로드 중...</div>
          <ProgressBar progressDuration={2000} totalBlocks={16} /> {/* 여기서 넘기는 초가 더 적어야 progressBar가 먼저 사라지지 않음 */}
        </div>
      </div>
    );
  }


  return (
     <>
          <div className={styles.container}>
              <div className="title-bar">
              <span className={styles.addressText}>https://www.kimsoffice.com :: 김씨네 <span className={styles.addressTextColor}> 명함제작 </span> 사무소</span>
              <div style={{paddingTop:5, paddingBottom:5}}className="title-bar-controls">
                <button aria-label="Minimize" />
                <button aria-label="Maximize" />
                <button aria-label="Close" />
              </div>
            </div>
            <div className={styles.contentArea}>
                {isSaving&&<div className={styles.popUp}>
                  <div className={styles.popUpContent}>
                    <div>사진 저장 중...</div>
                    <div><ProgressBar progressDuration={3000} totalBlocks={16}/></div>
                  </div>
                </div>}
                {/* {userEmail}에 해당하는 카드 출력 */}
                {cards.length > 0 ? (
                  <>
                    <div className={styles.ownerText}><span className={styles.ownerTextStrong}>{cards[0].name}</span> 님의 명함</div>
                    <div className={styles.card}>
                        <div className={`${styles.cardFront} cardFront`} style={cardFrontStyle} ref={frontRef}>
                          <div className={styles.infoContainer}>
                            <div className={styles.date} style={infoItemStyle}>
                              {cards[0].updatedAt ? new Date(cards[0].updatedAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className={styles.name} style={infoItemStyle}>이름</div>
                            <div className={styles.nameValue} style={infoItemStyle}>{cards[0].name || 'N/A'}</div>
                            <div className={styles.engNameValue} style={infoItemStyle}>{cards[0].engName || 'N/A'}</div>
                            <div className={styles.school} style={infoItemStyle}>학교</div>
                            <div className={styles.schoolValue} style={infoItemStyle}>{cards[0].school || 'N/A'}</div>
                            <div className={styles.studentNumValue} style={infoItemStyle}>{cards[0].studentNum || 'N/A'}</div>
                            <div className={styles.major} style={infoItemStyle}>전공</div>
                            <div className={styles.majorValue} style={infoItemStyle}>{cards[0].major || 'N/A'}</div>
                            <div className={styles.email} style={infoItemStyle}>이메일</div>
                            <div className={styles.emailValue} style={infoItemStyle} onClick={handleEmailClick}>{cards[0].email || 'N/A'}</div>
                            <div className={styles.session} style={infoItemStyle}>진로</div>
                            <div className={styles.sessionValue} style={infoItemStyle}>{cards[0].session || 'N/A'}</div>
                            <div className={styles.MBTI} style={infoItemStyle}>MBTI</div>
                            <div className={styles.MBTIValue} style={infoItemStyle}>{cards[0].MBTI || 'N/A'}</div>
                            <div className={styles.IG} style={infoItemStyle}>IG</div>
                            <div className={styles.IGValue} style={infoItemStyle} onClick={handleIgClick}>@{cards[0].ig || 'N/A'}</div>
                            {cardImage && <img src={cardImage} alt="Profile" className={styles.cardImage} style={infoItemStyle} />}
                          </div>
                        </div>
                        <div className={`${styles.cardBack} cardBack`} style={cardBackStyle} ref={backRef}>
                          {showQR && (
                           <>
                              <div className={styles.moto} style={infoItemStyle}>{cards[0].moto || 'N/A'}</div>
                              <div className={styles.QR} >
                                <QRCode value={`https://kimsofficebc.netlify.app/card-info?userEmail=${userEmail}`} size={50} />
                              </div>
                           </>
                          )}
                           <div style={{
                            position: 'absolute',
                            top: 33,
                            left: 25,
                            width: '85%',
                            height: '85%',
                            backgroundImage: `url('${patternUrl}')`, // 패턴 이미지
                            backgroundSize: 'cover',
                            pointerEvents: 'none', // 오버레이가 사용자 인터랙션 방해 방지
                          }}></div>
                        </div>
                      </div>
                  </>
                ) : (
                  <div>{userEmail}에 해당하는 카드 없음</div>
                )}
                <div className="field-row" style={{ justifyContent: "center"}}>
                  <button type="button" onClick={handleCardClick}>카드뒤집기</button>
                  <button type="button" onClick={saveCardAsImage}>저장하기(이미지)</button>
                  <button type="button" onClick={shareCard}>공유하기</button>
                </div>
              </div>
          </div>
     </>
  );
}

export default MyCard;
