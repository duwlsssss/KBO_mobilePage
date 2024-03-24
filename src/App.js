import React, { useEffect, useState } from 'react';

function App() {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // 현재 URL에서 쿼리 파라미터를 추출합니다.
    const searchParams = new URLSearchParams(window.location.search);
    // 'userEmail' 파라미터 값을 가져옵니다.
    const email = searchParams.get('userEmail');
    // userEmail 상태를 업데이트합니다.
    if (email) setUserEmail(email);
  }, []);

  return (
    <div>
      <div>
        {userEmail && (
          <div>
            {userEmail}에 해당하는 카드 출력 부분
            console.log({userEmail});
          </div>
        )}
      </div>

      <button>저장하기(이미지)</button>
      <button>공유하기(이미지)</button>
    </div>
  );
}

export default App;
