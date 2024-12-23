import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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

  const userEmail = useUserEmailStore(state=>state.userEmail);
  const setUserEmail = useUserEmailStore(state=>state.setUserEmail);
  const [cards, setCards] = useState([]); //카드 저장용
  const [cardImage, setCardImage] = useState('/images/kimLogo_padded_w.webp'); // 에러 발생 시 기본 이미지);//이미지 저장
  const [isLoading, setIsLoading] = useState(true);//로딩 상태 
  const [isSaving, setIsSaving] = useState(false);//사진 저장 상태 추적
  const [isFlipped, setIsFlipped] = useState(false);
  // 기본 카드 스타일을 상수로 선언
  const baseCardStyles = {
    back: {
      position: 'relative',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    front: {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  };
  const [infoItemStyle, setInfoItemStyle] = useState({
    position: 'absolute',
  });
  const [mbtiUrl,setMbtiUrl]=useState('');
  const [patternUrl,setPatternUrl]=useState('');
  const [frameUrl,setFrameUrl]=useState('');
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
  
        // 모든 데이터 로드가 완료되고 2.5초 더 기다림 로딩 상태를 종료
        await new Promise((resolve) => setTimeout(resolve, 5000));
        setIsLoading(false);
      } catch (error) {
        console.error("Data fetching failed:", error);
        setIsLoading(false); // 에러 발생 시에도 로딩 상태 종료
      }
    };
  
    loadData();
  }, [userEmail]); // userEmail이 변경될 때마다 이 효과를 다시 실행

  // 실행 환경 확인
  function detectBrowser() {
    const userAgent = navigator.userAgent;

    // iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }
    // Samsung Internet
    if (/SamsungBrowser/.test(userAgent)) {
      return "Samsung Internet";
    }
    // android 
    if (/Android/.test(userAgent)) {
      return "Android";
    }
    
    // If none of the above, return a generic result
    return "Unknown";
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get('userEmail');
    if (email) {
      // console.log("url에서 뽑은 userEmail",email);
      setUserEmail(email);
    }

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

    // 인앱 브라우저 처리
    inappdenyExecVanillaJs(() => {
      const inappbrowserout=()=>{
        alert('\n인앱브라우저 호환문제로 인해 Safari로 접속해야합니다.\n\nSafari에서 실행하시면 정상적으로 이용하실 수 있습니다.');
      };

      const userAgent = navigator.userAgent.toLowerCase();
      const target_url = window.location.href;

      // URL에서 쿼리 파라미터를 검사하는 함수
      const searchParams = new URLSearchParams(window.location.search);
      const fromApp = searchParams.get('from');

      if (browserType === "Samsung Internet") {
        if (window.confirm('\n인앱브라우저 호환문제로 인해 Chrome으로 접속해야합니다.\n\nChrome에서 실행하시면 정상적으로 이용하실 수 있습니다.\n')) {
          // 사용자가 "확인"을 누른 경우에만 리디렉션 코드를 실행
          location.href = 'intent://'+target_url.replace(/https?:\/\//i,'')+'#Intent;scheme=http;package=com.android.chrome;end';
        }
      }
      // 카카오톡 인앱 브라우저를 감지하고 리디렉션 처리
      if (fromApp === 'kakaotalk') {
        // 삼성 인터넷 브라우저 감지
        if (browserType === 'Samsung Internet') {
          if (window.confirm('\n인앱브라우저 호환문제로 인해 Chrome으로 접속해야합니다.\n\nChrome에서 실행하시면 정상적으로 이용하실 수 있습니다.\n')) {
            window.location.href = 'intent://' + window.location.href.replace(/https?:\/\//i, '') + '#Intent;scheme=http;package=com.android.chrome;end';
          }
        }
      } else if (userAgent.match(/kakaotalk/i)) {
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

 }, []); //컴포넌트가 마운트될 때, userEmail 추출하고 이를 zustand에 저장


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
        // const mostRecentCard = userCards[0];
        // 카드가 존재하면 상태 업데이트
        setCards(mostRecentCard ? [mostRecentCard] : []);
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
        setCardImage(response.data[0].url);
        // console.log(response.data[0].url)
      }
      else {
        // 데이터가 비어있을 경우 기본 이미지 설정
        setCardImage('/images/kimLogo_padded_w.webp');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setCardImage('/images/kimLogo_padded_w.webp'); // 에러 발생 시 기본 이미지
  }};

   //이미지로 저장
   const frontRef = useRef(null); 
   const backRef = useRef(null); //카드 부분 참조
 
   const captureCardImage = async (element, filename) => {
     try {
      const canvas = await html2canvas(element, { useCORS:true, backgroundColor: null, logging:true});
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
      // canvas.toBlob(function(blob) {
      //   if (blob) {
      //     saveAs(blob, filename);
      //   }
      // });
      } catch (error) {
      alert("사진 저장 중에 문제가 생겼습니다. 다시 시도해주세요")
    }
   };
 
   const waitForRender = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
   };
 
   const saveCardFAsImage = async () => {
    setIsSaving(true); // 사진 저장 상태 시작
 
    // console.log("앞면 저장 실행");
    setIsFlipped(false); //앞면으로 돌리고
    await waitForRender();
    // await waitForElement('.cardFront'); // 앞면이 화면에 나타날 때까지 기다림
    if (frontRef.current) {
      // console.log("앞면 저장 시작");
    //  alert("앞면 저장 시작");
    await captureCardImage(frontRef.current, "card.png");
    // console.log("앞면 저장 완료");
    }
    setIsSaving(false); 
  };
  const saveCardBAsImage = async () => {
    setIsSaving(true); // 사진 저장 상태 시작
    setShowQR(true); // QR 코드 보이기 시작_qr이 안찍히는 상황 방지

    setIsFlipped(true); //뒷면으로 돌리고 
    await waitForRender();
    // await waitForElement('.cardBack');
    if (backRef.current) {
      // console.log("뒷면 저장 시작");
    //  alert("뒷면 저장 시작");
    await captureCardImage(backRef.current, "card-back.png");
    // console.log("뒷면 저장 완료");
    }

    setIsFlipped(false);
    // await waitForElement('.cardFront');
    // await new Promise((resolve) => setTimeout(resolve, 800)); // 다시 앞면이 화면에 나타날 때까지 기다림
    await waitForRender();
    setIsSaving(false); 
  };

const handleEmailClick = useCallback(() => {
  // console.log("이메일 클릭");
  if (cards[0].email) {
    const emailUrl = `mailto:${cards[0].email}`;
    window.open(emailUrl, '_self'); 
  }
},[cards]);
const handleIgClick = useCallback(() => {
  // console.log("인스타 클릭");
  if (cards[0].ig) {
    // console.log('cards[0].ig',cards[0].ig)
    const instagramUrl = `https://www.instagram.com/${cards[0].ig}/`; //비공개 계정도 열러기 해야함
    // const instagramUrl = `https://www.instagram.com/k_nijy/`;
    window.open(instagramUrl, '_blank');
  }
}, [cards]); //cards가 변경될때만 함수 재생성

  //공유하기 누르면 
  const isShareSupported = () => !!navigator.share; //share api 지원 확인 

  // 텍스트를 클립보드에 복사하는 함수
  const copyToClipboard = async() => {
    try {
      const shareUrl = `https://kimsofficebc.netlify.app/card-info?userEmail=${userEmail}`;
      // const shareUrl = `http://localhost:3000/card-info?userEmail=${userEmail}`;
      // console.log("공유 주소",shareUrl);
      // 공유주소를 클립보드에 복사
      await navigator.clipboard.writeText(shareUrl);
      // alert("링크가 복사되었어요");
    } catch (err) {
      console.error('링크 복사 실패',err);
    }
  };

  const shareCard = async () => {
    if (isShareSupported()) {
      try {
        // console.log("공유 주소",`https://kimsofficebc.netlify.app/card-info?userEmail=${userEmail}`);
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


  // useEffect(()=>{
  //   console.log("isFlipped 변함", isFlipped);
  // },[isFlipped]);

  //카드 뒤집기 애니메이션 
  const handleCardClick = useCallback(() => {
    // 카드의 뒤집힌 상태를 토글
    setIsFlipped(!isFlipped);
    // console.log("card flipped!")

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
  }, [isFlipped]); //isFlipped가 변경될때만 함수 재생성

  // 카드 및 이미지 URL을 메모이제이션
  const { backImageUrl, frontImageUrl } = useMemo(() => {
    if (cards.length > 0) {
      const card = cards[0];
      return {
        backImageUrl: card.backgroundOption ? getBackImageUrl(card.backgroundOption): '/images/back/GreyA.webp',
        frontImageUrl: card.backgroundOption ? `/images/front/${card.backgroundOption}.webp` : '/images/front/GreyAurora.webp'
      };
    }
    return { backImageUrl: '', frontImageUrl: '' };
  }, [cards]);

   // 카드 스타일을 메모이제이션
   const cardStyles = useMemo(() => ({
    back: {
      ...baseCardStyles.back,
      backgroundImage: `url('${backImageUrl}')`,
      transform: isFlipped ? 'rotateX(0deg)' : 'rotateX(180deg)',
    },
    front: {
      ...baseCardStyles.front,
      backgroundImage: `url('${frontImageUrl}')`,
      transform: isFlipped ? 'rotateX(-180deg)' : 'rotateX(0deg)',
    }
  }), [backImageUrl, frontImageUrl, isFlipped]);

  // useEffect를 사용하여 나머지 상태 업데이트
  useEffect(() => {
    if (cards.length > 0) {
      const card = cards[0];
      setInfoItemStyle(prev => ({
        ...prev,
        fontFamily: getFontFamily(card.fontOption),
      }));

      setPatternUrl(card.patternOption ? `/images/pattern/${card.patternOption}.webp` : '');
      setFrameUrl(card.frameOption ? `/images/frame/${card.frameOption}.webp` : '');
      setMbtiUrl(card.MBTI ? `/images/mbti/${card.MBTI}.webp` : '');
    }
  }, [cards]); 

  // useEffect(() => {
  //   if (cards.length > 0) {
  //   const card = cards[0]; // 현재 카드를 임시 변수에 저장
  //   console.log("card",card);

  //   if (card) {
  //     const backImageUrl = getBackImageUrl(card.backgroundOption);
  //     const frontImageUrl = card.backgroundOption ? `/images/front/${card.backgroundOption}.webp` : '/images/front/GreyAurora.webp';
  //     const newBackStyle = {
  //       ...cardStyles.back,
  //       backgroundImage: `url('${backImageUrl}')`,
  //       transform: isFlipped ? 'rotateX(0deg)' : 'rotateX(180deg)',
  //     };
  //     const newFrontStyle = {
  //       ...cardStyles.front,
  //       backgroundImage: `url('${frontImageUrl}')`,
  //       transform: isFlipped ? 'rotateX(-180deg)' : 'rotateX(0deg)',
  //     };
  //     // 스타일 상태를 업데이트
  //     setCardStyles({ back: newBackStyle, front: newFrontStyle });

  //     // 폰트 옵션에 따른 스타일 조정
  //     const newInfoItemStyle = {
  //       ...infoItemStyle,
  //       fontFamily: getFontFamily(card.fontOption),
  //     };
  //     setInfoItemStyle(newInfoItemStyle);
  
  //     // 패턴 옵션, 프레임 필터 옵션, MBTI URL 설정
  //     const patternImageUrl = card.patternOption ? `/images/pattern/${card.patternOption}.webp` : '';
  //     const frameImageUrl = card.frameOption ? `/images/frame/${card.frameOption}.webp` : '';
  //     console.log("frameImageUrl",frameImageUrl);
  //     const mbtiImageUrl = card.MBTI ?`/images/mbti/${card.MBTI}.webp`:'';
  //     setPatternUrl(patternImageUrl);
  //     setFrameUrl(frameImageUrl);
  //     setMbtiUrl(mbtiImageUrl);
  //     }
  //   }
  // }, [cards,isFlipped]); 
  
  // 폰트 옵션에 따라 폰트 패밀리를 반환하는 함수
  function getFontFamily(fontOption) {
    switch (fontOption) {
      case 1:
        return "HakgyoansimBombanghakR";
      case 2:
        return "Ownglyph_meetme-Rg";
      case 3:
        return "SUITE-Regular";
      case 4:
        return "Dovemayo_wild";
      case 5:
        return "HakgyoansimButpenB";
      default: //디폴트
      return "sans-serif";
    }
  }

  // 이 함수는 각 배경 옵션에 따른 URL을 반환합니다.
  function getBackImageUrl(backgroundOption) {
    switch (backgroundOption) {
      case 'BlueCheck':
        return `/images/back/Blue.webp`;
      case 'GreenMilitary':
        return `/images/back/GreenM.webp`;
      case 'GreenBerry':
        return `/images/back/GreenB.webp`; 
      case 'Grey':
        return `/images/back/Grey.webp`;
      case 'GreyAurora':
        return `/images/back/GreyA.webp`;
      case 'PinkAurora':
      case 'PinkCheck':
      case 'Pink':
        return `/images/back/Pink.webp`;
      case 'RedMelt':
        return `/images/back/RedM.webp`;
      case 'PurpleAurora':
        return `/images/back/PurpleA.webp`;
      case 'PurpleCheck':
        return `/images/back/PurpleC.webp`;
      case 'SkyMelt':
        return `/images/back/SkyM.webp`;
      case 'SKy':
        return `/images/back/SkyM.webp`;
      case 'SkyCloud':
        return `/images/back/SkyC.webp`;
      case 'Yellow':
        return `/images/back/Yellow.webp`;
      default:
        return '/images/back/Grey.webp'; // 기본 이미지-단색 그레이
    }
  }


  //처음에 로딩 화면 띄우려고
  if (isLoading) {
    return (
      <div className={styles.popUp}>
        <div className={styles.popUpContent}>
          <div>카드 로드 중...</div>
          <ProgressBar progressDuration={4000} totalBlocks={16} /> {/* 여기서 넘기는 초가 더 적어야 progressBar가 먼저 사라지지 않음 */}
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
                  <div><ProgressBar progressDuration={1000} totalBlocks={16}/></div>
                </div>
              </div>}
              {cards.length > 0 ? (
                <>
                  <div className={styles.ownerText}><span className={styles.ownerTextStrong}>{cards[0].name||'사용자'}</span> 님의 명함</div>
                  <div className={styles.card}>
                      <div className={`${styles.cardFront}`} style={cardStyles.front} ref={frontRef}>
                        <div className={styles.infoContainer}>
                          <div className={styles.date} style={infoItemStyle}>
                            {cards[0].updatedAt ? new Date(cards[0].updatedAt).toLocaleDateString() : ''}
                          </div>
                          <div className={styles.name} style={infoItemStyle}>이름</div>
                          <div className={styles.nameValue} style={infoItemStyle}>{cards[0].name || ''}</div>
                          <div className={styles.engNameValue} style={infoItemStyle}>{cards[0].engName || ''}</div>
                          <div className={styles.school} style={infoItemStyle}>학교</div>
                          <div className={cards[0].studentNum ? styles.schoolValue : styles.schoolValueWithoutNum} style={infoItemStyle}>{cards[0].school || ''}</div>
                          <div className={styles.studentNumValue} style={infoItemStyle}>{cards[0].studentNum || ''}</div>
                          <div className={styles.major} style={infoItemStyle}>전공</div>
                          <div className={styles.majorValue} style={infoItemStyle}>{cards[0].major || ''}</div>
                          <div className={styles.session} style={infoItemStyle}>진로</div>
                          <div className={styles.sessionValue} style={infoItemStyle}><span className={styles.highlight}>{cards[0].session || ''}</span></div>
                          <div className={styles.MBTI} style={infoItemStyle}>MBTI</div>
                          <div className={styles.email} style={infoItemStyle}>이메일</div>
                          <div className={styles.emailValue} style={infoItemStyle} onClick={handleEmailClick}>{cards[0].email || ''}</div>
                          <div className={styles.IG} style={infoItemStyle}>IG</div>
                          <div className={styles.IGValue} style={infoItemStyle} onClick={handleIgClick}>{cards[0].ig ? `@${cards[0].ig}` : ''}</div>
                          {frameUrl && <img className={styles.frame} src={frameUrl} alt="Frame"/>} 
                          {cardImage && 
                            <div className={cards[0].frameShapeoption === "Rec" ? styles.cardImageContainerR : styles.cardImageContainerC}>
                              <img src={cardImage} alt="Profile" 
                                className={cards[0].frameShapeoption === "Rec" ? styles.cardImageRectGrey : styles.cardImageCircleGrey}
                              />
                            </div>
                          }
                          {mbtiUrl && <img src={mbtiUrl} alt="mbti" className={styles.MBTIValue} style={infoItemStyle}/>}
                          </div>
                      </div>
                      <div className={`${styles.cardBack}`} style={cardStyles.back} ref={backRef}>
                        {patternUrl &&<img className={styles.pattern} src={patternUrl} alt="Pattern"/>}
                        <div className={styles.moto} style={infoItemStyle}>{cards[0].moto || ''}</div>
                        {showQR && (
                          <div className={styles.QR} >
                            <QRCode value={`https://kimsofficebc.netlify.app/card-info?userEmail=${userEmail}`} size={30} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                  ) : ( <div>{userEmail}에 해당하는 카드 없음</div>)
                  } 
                  <div className={styles.btnContainer}>
                    <button type="button" className={styles.btn} onClick={handleCardClick}>뒤집기</button>
                    <button type="button" className={styles.btn} onClick={saveCardFAsImage}>앞저장</button>
                    <button type="button" className={styles.btn} onClick={saveCardBAsImage}>뒤저장</button>
                    <button type="button" className={styles.btn} onClick={shareCard}>공유</button>
                  </div>
                  </div>
          </div>
      </>
  );
}

export default MyCard;
