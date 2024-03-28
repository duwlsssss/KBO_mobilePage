import "xp.css/dist/XP.css";
import React, { useEffect, useState, useRef } from 'react';

const ProgressBar=()=>{
  const intervalRef = useRef(null);
  const [saveProgress, setSaveProgress] = useState(0);
  useEffect(() => {
    simulateProgress();

    return () => {
      // Clear the interval on cleanup
      clearInterval(intervalRef.current);
    };
  }, []); //컴포넌트 마운트 시 한 번만 실행되게

  const simulateProgress = () => {
    setSaveProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5; 
      if (progress >= 100) {
        setSaveProgress(100); // 마지막 진행 상태를 100으로 설정
        clearInterval(interval);
      } else {
        setSaveProgress(progress);
      }
    }, 100);

    return () => clearInterval(interval); // useEffect의 클린업 함수에서 interval을 정리
  };

  return (
      <progress className="xp-progress" max="100" value={saveProgress}></progress>
  );
};

export default ProgressBar;
