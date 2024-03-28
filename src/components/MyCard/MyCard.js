import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import api from '../../api/axios'
import html2canvas from 'html2canvas';
import saveAs from "file-saver";
import styles from './MyCard.module.css';
import { useLocation } from 'react-router-dom';
import  useUserEmailStore from '../../store/userEmail'
import ProgressBar from '../ProgressBar';
import "98.css";

function MyCard() {

  const {userEmail,setUserEmail} = useUserEmailStore();
  const [cards, setCards] = useState([]); //카드 저장용
  const [cardImage, setCardImage] = useState(null);//이미지 저장
  const [isSaving, setIsSaving] = useState(false);//사진 저장 상태 추적
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQR,setShowQR]=useState("false");
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get('userEmail');
    if (email) {
      console.log("url에서 뽑은 userEmail",email);
      setUserEmail(email);
      console.log("zustan에 저장된 userEmail",userEmail);
    }
 }, []);

  //userEmail 변경시 호출됨
  useEffect(() => {
    if (userEmail) {
      fetchCards(userEmail);
      fetchImages();
    }
  }, [userEmail]);

  //서버에서 데이터 가져오기, useEmail이 맞을때만
  const fetchCards = (userEmail) => {
    api.get('/cards')
      .then((response) => {
        const data = response.data;
        if (data.status === 'ok') {
          const userCards = data.data.filter(card => card.userEmail === userEmail);
          // 업데이트 날짜 기준으로 정렬
          userCards.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          // 같은 이메일 중 가장 최근에 업데이트된 카드 선택
          const latestCard = userCards[0] ? [userCards[0]] : [];
          setCards(latestCard);
        }
      })
      .catch((error) => {
        console.error("Fetching cards failed:", error);
      });
  };

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
        const lastImageIndex = response.data.length - 1;
        setCardImage(response.data[lastImageIndex].url);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
  }};

  //이미지로 저장
  const frontRef = useRef(null); 
  const backRef = useRef(null); //카드 부분 참조

  const saveCardAsImage = async () => {
    
    setIsSaving(true); // 사진 저장 시작
    console.log("사진 저장 실행");

    const waitForRender = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    const captureCardImage = async (element, filename) => {
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
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
      } catch (error) {
        console.error("Error saving card image:", error);
      }
    };

    setIsFlipped(false);
    await waitForRender();

    if (frontRef.current) {
      await captureCardImage(frontRef.current, "card-front.png");
    } 

    setIsFlipped(true);
    await waitForRender();

    if (backRef.current) {
      await captureCardImage(backRef.current, "card-back.png");
    } 

    // Clean up and set states back to initial values
    setIsFlipped(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false); 
    // // 카드를 앞면으로 설정
    // setIsFlipped(false);
    // // 앞면이 화면에 표시되기를 잠시 기다림
    // await new Promise(resolve => setTimeout(resolve, 800));

    // if (frontRef.current) {
    //   try {
    //     const canvasFront = await html2canvas(frontRef.current, { scale: 2, useCORS: true });

    //     const dataUrl = canvasFront.toDataURL();
    //     const rotatedImage = new Image();
    //     rotatedImage.onload = function() {
    //       const rotatedCanvas = document.createElement('canvas');
    //       rotatedCanvas.width = rotatedImage.height;
    //       rotatedCanvas.height = rotatedImage.width;

    //       const context = rotatedCanvas.getContext('2d');
    //       context.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    //       context.rotate(-90 * Math.PI / 180);
    //       context.drawImage(rotatedImage, -rotatedImage.width / 2, -rotatedImage.height / 2);

    //       rotatedCanvas.toBlob(function(blob) {
    //         if (blob) {
    //           saveAs(blob, "card-front.png");
    //         }
    //       });
    //     };
    //     rotatedImage.src = dataUrl;
    //   } catch (error) {
    //       console.error("Problem saving front of card:", error);
    //   }
    // } 
    // // 카드를 뒷면으로 설정
    // setIsFlipped(true);
    // // 뒷면이 화면에 표시되기를 잠시 기다림
    // await new Promise(resolve => setTimeout(resolve, 800)); 


    // if (backRef.current) {
    //   try {
    //       // CORS를 통해 외부 이미지를 로드
    //       const canvasBack = await html2canvas(backRef.current, { scale: 2, useCORS: true });
    //       const dataUrl = canvasBack.toDataURL();
    //       const rotatedImage = new Image();
    //       rotatedImage.onload = function() {
    //         const rotatedCanvas = document.createElement('canvas');
    //         rotatedCanvas.width = rotatedImage.height;
    //         rotatedCanvas.height = rotatedImage.width;

    //         const context = rotatedCanvas.getContext('2d');
    //         context.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    //         context.rotate(-90 * Math.PI / 180);
    //         context.drawImage(rotatedImage, -rotatedImage.width / 2, -rotatedImage.height / 2);

    //         rotatedCanvas.toBlob(function(blob) {
    //           if (blob) {
    //             saveAs(blob, "card-back.png");
    //           }
    //         });
    //       };
    //       rotatedImage.src = dataUrl;
    //   } catch (error) {
    //       console.error("Problem saving back of card:", error);
    //   }
  // }
  // // 마무리로 카드를 원래 상태로 돌려놓기
  // setIsFlipped(false); 
  // await new Promise(resolve => setTimeout(resolve, 800));
  // setIsSaving(false); // 사진 저장 종료
};


const handleEmailClick = () => {
  console.log("이메일 클릭");
  
};
const handleIgClick = () => {
  console.log("인스타 클릭");
  if (cards[0].ig) {
    console.log('cards[0].ig',cards[0].ig)
    const instagramUrl = `https://www.instagram.com/${encodeURIComponent(cards[0].ig)}/`; //비공개 계정도 열러기 해야함
    // const instagramUrl = `https://www.instagram.com/${cards[0].ig}/`;

    window.open(instagramUrl, '_blank');
  }
};

  //공유하기 누르면 링크 복사됨 
  const shareCard = () => {
    const shareUrl = `https://kimmobile.netlify.app/card-info?userEmail=${userEmail}`;
    // const shareUrl = `http://localhost:3001/card-info?userEmail=${userEmail}`;
    console.log("공유 주소",shareUrl);
    // 공유주소를 클립보드에 복사
    // 다른 소셜로 공유 (카톡, 메일 ...)
  };


  //카드 뒤집기 애니메이션 
  const handleCardClick = () => {
    //앞면이면
    if (isFlipped) {
      setShowQR(true);
      // 애니메이션이 조금 진행된 후 QR 코드를 보여줌
      // 애니메이션 지속 시간이 0.5초일 때
      setTimeout(() => {
        setShowQR(false);
      }, 150); 
    }
    
    // 카드의 뒤집힌 상태를 토글
    setIsFlipped(!isFlipped);
    console.log("card flipped!")

    // 카드가 뒤집히기 시작할 때 (앞면에서 뒷면으로 가는 경우)
    if (!isFlipped) {
      setShowQR(false);
      // 애니메이션이 조금 진행된 후 QR 코드를 보여줌
      // 애니메이션 지속 시간이 1초일 때
      setTimeout(() => {
        setShowQR(true);
      }, 150); 
    }
  };


  return (
     <>
          <div style={{ width: 350, marginTop:5, marginBottom:5}} className='window'>
              <div className="title-bar">
              <span className={styles.addressText}>https://www.kimsoffice.com :: 김씨네 <span className={styles.addressTextColor}> 명함제작 </span> 사무소</span>
              <div style={{paddingTop:5, paddingBottom:5}}className="title-bar-controls">
                <button aria-label="Minimize" />
                <button aria-label="Maximize" />
                <button aria-label="Close" />
              </div>
            </div>
            <div className={styles.contentArea}>
                {isSaving&&<div className={styles.savingPopup}>
                  <div>사진 저장 중...</div>
                  <div><ProgressBar/></div>
                </div>}
                {/* {userEmail}에 해당하는 카드 출력 */}
                {cards.length > 0 ? (
                  <>
                    <div className={styles.ownerText}><span className={styles.ownerTextStrong}>{cards[0].name}</span> 님의 명함</div>
                    <div className={styles.card}>
                        <div className={`${styles.cardFront} ${isFlipped ? styles.flipped : ''}`} ref={frontRef}>
                          <div className={styles.infoContainer}>
                            <div className={`${styles.infoItem} ${styles.date}`}>
                              {cards[0].updatedAt ? new Date(cards[0].updatedAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className={`${styles.infoItem} ${styles.name}`}>{cards[0].name || 'N/A'}</div>
                            <div className={`${styles.infoItem} ${styles.engName}`}>{cards[0].engName || 'N/A'}</div>
                            <div className={`${styles.infoItem} ${styles.school}`}>{cards[0].school || 'N/A'}</div>
                            <div className={`${styles.infoItem} ${styles.studentNum}`}>{cards[0].studentNum || 'N/A'}</div>
                            <div className={`${styles.infoItem} ${styles.major}`}>{cards[0].major || 'N/A'}</div>
                            <div className={`${styles.infoItem} ${styles.email}`} onClick={handleEmailClick}>{cards[0].email || 'N/A'}</div>
                            <div className={`${styles.infoItem} ${styles.session}`}>{cards[0].session || 'N/A'}</div>
                            <div className={`${styles.infoItem} ${styles.MBTI}`}>{cards[0].MBTI || 'N/A'}</div>
                            <div className={`${styles.infoItem} ${styles.IG}`} onClick={handleIgClick}>@{cards[0].ig || 'N/A'}</div>
                            <div className={`${styles.infoItem} ${styles.moto}`}>{cards[0].moto || 'N/A'}</div>
                            {cardImage && <img src={cardImage} alt="Profile" className={styles.cardImage} />}
                          </div>
                        </div>
                        <div className={`${styles.cardBack} ${isFlipped ? styles.flipped : ''}`} ref={backRef}>
                        {showQR && (
                          <div className={styles.QR}>
                            <QRCode value={`https://kimmobile.netlify.app/card-info?userEmail=${userEmail}`} />
                          </div>
                        )}
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
                {/* <div className={styles.buttonContainer}>
                  <button type="button" onClick={handleCardClick}>카드뒤집기</button>
                  <button type="button" onClick={saveCardAsImage}>저장하기(이미지)</button>
                  <button type="button" onClick={shareCard}>공유하기</button>
                </div> */}
              </div>
          </div>
     </>
  );
}

export default MyCard;
