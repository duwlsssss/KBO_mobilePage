import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import api from '../../api/axios'
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import saveAs from "file-saver";
import styles from './CardInfo.module.css';
import { useLocation } from 'react-router-dom';
import  useUserEmailStore from '../../store/userEmail'
import ProgressBar from '../ProgressBar/ProgressBar';
import "xp.css/dist/98.css"

function CardInfo() {

  const {userEmail,setUserEmail} = useUserEmailStore();
  const [cards, setCards] = useState([]); //카드 저장용
  const [cardImage, setCardImage] = useState(null);//이미지 저장
  const [isLoading, setIsLoading] = useState(true);//로딩 상태 
  const [isSaving, setIsSaving] = useState(false);//사진 저장 상태 추적
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStyles, setCardStyles] = useState({
    back: {
      position: 'relative',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    front: {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  });
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


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get('userEmail');
    if (email) {
      console.log("url에서 뽑은 userEmail",email);
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
      else {
        // 데이터가 비어있을 경우 기본 이미지 설정
        setCardImage('/images/kimLogo_padded.png');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
  }};

   //이미지로 저장
   const frontRef = useRef(null); 
   const backRef = useRef(null); //카드 부분 참조
 
   const captureCardImage = async (element, filename) => {
     try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: null });
      // const dataUrl = canvas.toDataURL();
      //  const rotatedImage = new Image();
      //  rotatedImage.onload = function() {
      //    const rotatedCanvas = document.createElement('canvas');
      //    rotatedCanvas.width = rotatedImage.height;
      //    rotatedCanvas.height = rotatedImage.width;
 
      //    const context = rotatedCanvas.getContext('2d');
      //    context.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      //    context.rotate(-90 * Math.PI / 180);
      //    context.drawImage(rotatedImage, -rotatedImage.width / 2, -rotatedImage.height / 2);
 
      //    rotatedCanvas.toBlob(function(blob) {
      //      if (blob) {
      //        saveAs(blob, filename);
      //      }
      //    });
      //  };
      //  rotatedImage.src = dataUrl;
      canvas.toBlob(function(blob) {
        if (blob) {
          saveAs(blob, filename);
        }
      });
     } catch (error) {
      toast.error('이미지 저장 중 오류가 발생했습니다.');
      alert("사진 저장 중에 문제가 생겼습니다. 다시 시도해주세요")
     }
   };
 
   const waitForRender = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
   };
 
   const saveCardFAsImage = async () => {
    setIsSaving(true); // 사진 저장 상태 시작
 
    console.log("앞면 저장 실행");
    setIsFlipped(false); //앞면으로 돌리고
    await waitForRender();
    // await waitForElement('.cardFront'); // 앞면이 화면에 나타날 때까지 기다림
    if (frontRef.current) {
      console.log("앞면 저장 시작");
    //  alert("앞면 저장 시작");
    await captureCardImage(frontRef.current, "card.png");
    console.log("앞면 저장 완료");
    //  alert("앞면 저장 완료");
    }
    setIsSaving(false); 
  };
  // const saveCardBAsImage = async () => {
  //   setIsSaving(true); // 사진 저장 상태 시작
  //   setShowQR(true); // QR 코드 보이기 시작_qr이 안찍히는 상황 방지

  //   setIsFlipped(true); //뒷면으로 돌리고 
  //   await waitForRender();
  //   // await waitForElement('.cardBack');
  //   if (backRef.current) {
  //     console.log("뒷면 저장 시작");
  //   //  alert("뒷면 저장 시작");
  //   await captureCardImage(backRef.current, "card-back.png");
  //   console.log("뒷면 저장 완료");
  //   //  alert("뒷면 저장 완료");
  //   }

  //   setIsFlipped(false);
  //   // await waitForElement('.cardFront');
  //   // await new Promise((resolve) => setTimeout(resolve, 800)); // 다시 앞면이 화면에 나타날 때까지 기다림
  //   await waitForRender();
  //   setIsSaving(false); 
  // };

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


  useEffect(() => {
    if (cards.length > 0) {
    const card = cards[0]; // 현재 카드를 임시 변수에 저장
    console.log("card",card);

    if (card) {
      const backImageUrl = getBackImageUrl(card.backgroundOption);
      const frontImageUrl = card.backgroundOption ? `/images/front/${card.backgroundOption}.png` : '/images/front/GreyAurora.png';
      const newBackStyle = {
        ...cardStyles.back,
        backgroundImage: `url('${backImageUrl}')`,
        transform: isFlipped ? 'rotateX(0deg)' : 'rotateX(180deg)',
      };
      const newFrontStyle = {
        ...cardStyles.front,
        backgroundImage: `url('${frontImageUrl}')`,
        transform: isFlipped ? 'rotateX(-180deg)' : 'rotateX(0deg)',
      };
      // 스타일 상태를 업데이트
      setCardStyles({ back: newBackStyle, front: newFrontStyle });
      // 폰트 옵션에 따른 스타일 조정
      const newInfoItemStyle = {
        ...infoItemStyle,
        fontFamily: getFontFamily(card.fontOption),
      };
      setInfoItemStyle(newInfoItemStyle);
  
      // 패턴 옵션, 프레임 필터 옵션, MBTI URL 설정
      const patternImageUrl = card.patternOption ? `/images/pattern/${card.patternOption}.png` : '';
      const frameImageUrl = card.frameOption ? `/images/frame/${card.frameOption}.png` : '';
      console.log("frameImageUrl",frameImageUrl);
      const mbtiImageUrl = card.MBTI ?`/images/mbti/${card.MBTI}.png`:'';
      setPatternUrl(patternImageUrl);
      setFrameUrl(frameImageUrl);
      setMbtiUrl(mbtiImageUrl);
      }
    }
  }, [cards,isFlipped]); 
  
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
      default: //디폴트는 Arial
      return "sans-serif";
    }
  }

  // 이 함수는 각 배경 옵션에 따른 URL을 반환합니다.
  function getBackImageUrl(backgroundOption) {
    switch (backgroundOption) {
      case 'BlueCheck':
        return `/images/back/backBlue.png`;
      case 'GreenMilitary':
      case 'GreenStrawberry':
        return `/images/back/backGreen.png`; 
      case 'Grey':
      case 'GreyAurora':
        return `/images/back/backGrey.png`;
      case 'PinkAurora':
      case 'PinkCheck':
      case 'PinkOther':
      case 'Pink':
        return `/images/back/backPink.png`;
      case 'PurpleAurora':
      case 'PurpleCheck':
        return `/images/back/backPurple.png`;
      case 'BlueOther':
      case 'Sky':
      case 'SkyOther':
        return `/images/back/backSky.png`;
      case 'Yellow':
        return `/images/back/backYellow.png`;
      default:
        return '/images/back/backGrey.png'; // 기본 이미지-단색 그레이
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
      <div ref={frontRef}>
        {cardImage && 
            <img src={cardImage} 
            alt="Profile" 
            className={styles.cardImg}
            // className={styles.cardImageCircleGrey}
            // className={cards[0].frameShapeoption === "Rec" ? styles.cardImageRectGrey : styles.cardImageCircleGrey}
            // style={infoItemStyle} 
        />}
      </div>
      <button type="button" onClick={saveCardFAsImage}>저장하기 (이미지)</button>
    </>
  );
}

export default CardInfo;
