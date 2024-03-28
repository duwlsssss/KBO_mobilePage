import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyCard from './components/MyCard/MyCard';
import CardInfo from './components/CardInfo/CardInfo'

function App() {

  function setVHVariable() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  // 초기 설정
  setVHVariable();
  // 윈도우 리사이즈 이벤트가 발생할 때마다 setVHVariable를 호출하여 --vh 값을 업데이트
  window.addEventListener('resize', setVHVariable);
  

  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MyCard />} />
        <Route path="/card-info" element={<CardInfo />} /> 
      </Routes>
    </Router>
  );
}

export default App;