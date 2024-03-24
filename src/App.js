import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';

function App() {
  const [userEmail, setUserEmail] = useState('');
  const [cards, setCards] = useState([]); //카드 저장용

  useEffect(() => {
     // 현재 URL에서 쿼리 파라미터를 추출합니다.
     const searchParams = new URLSearchParams(window.location.search);
     // 'userEmail' 파라미터 값을 가져옵니다.
     const email = searchParams.get('userEmail');
     // userEmail 상태를 업데이트합니다.
     if (email) setUserEmail(email);
    // const email = "rladuwls0814@gmail.com";
    // setUserEmail("rladuwls0814@gmail.com");
    console.log("email",email);

    // 카드 데이터 가져오기
    fetchCards(email);
  }, []);

  //서버에서 데이터 가져오기, useEmail이 맞을때만
  const fetchCards = (email) => {
    fetch('http://localhost:8000/cards')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          const userCards = data.data.filter(card => card.userEmail === email);
          // 업데이트 날짜 기준으로 정렬
          userCards.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          // 가장 최근에 업데이트된 카드만 선택
          const latestCard = userCards[0] ? [userCards[0]] : [];
          setCards(latestCard);
        }
      })
      .catch((err) => console.error("Fetching cards failed:", err));
  };

  //카드 애니메이션 관련 
  const [isFlipped, setIsFlipped] = useState(false);
  const handleCardClick = () => {
    setIsFlipped(!isFlipped); // 카드의 뒤집힌 상태를 토글
    console.log("card flipped!")
  };

  return (
    <div>
      {userEmail && (
          <div>
            {userEmail}에 해당하는 카드 출력 
          </div>
      )}
      {cards.length > 0 ? (
        <div className="card" onClick={handleCardClick}>
          <div className={`cardFront ${isFlipped ? 'flipped' : ''}`}>
            <div className="info-container">
              <div className="info-item date">
                {cards[0].updatedAt ? new Date(cards[0].updatedAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="info-item name">{cards[0].name || 'N/A'}</div>
              <div className="info-item school">{cards[0].school || 'N/A'}</div>
              <div className="info-item studentNum">{cards[0].studentNum || 'N/A'}</div>
              <div className="info-item major">{cards[0].major || 'N/A'}</div>
              <div className="info-item email">{cards[0].email || 'N/A'}</div>
              <div className="info-item session">{cards[0].session || 'N/A'}</div>
              <div className="info-item MBTI">{cards[0].MBTI || 'N/A'}</div>
              <div className="info-item IG">{cards[0].ig || 'N/A'}</div>
              <div className="info-item moto">{cards[0].moto || 'N/A'}</div>
            </div>
          </div>
          <div className={`cardBack ${isFlipped ? 'flipped' : ''}`}>
            <div className="QR">
              <QRCode value={`http://localhost:3001/MyMyungham?userEmail=${userEmail}`} />
            </div>
          </div>
        </div>
      ) : (
        <div>{userEmail}에 해당하는 카드 없음</div>
      )}


      {/* Implement image save and share functionality */}
      <button>저장하기(이미지)</button>
      <button>공유하기(이미지)</button>
    </div>
  );
}

export default App;
