import React, { useEffect }  from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MyCard from './components/MyCard/MyCard';
import CardInfo from './components/CardInfo/CardInfo'


function App() {

  function setVHVariable() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  useEffect(() => {
    setVHVariable();
    // resize 이벤트가 발생하면 다시 계산하도록 아래 코드 추가
    window.addEventListener('resize', setVHVariable);
    return () => window.removeEventListener('resize', setVHVariable);
  }, []);

  // useEffect(() => {
  //   if (userEmail) {
  //     console.log("User Email from URL Query String:", userEmail);
  //   }
  // }, [userEmail]);

  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<MyCard/>}/>
          <Route path="/card-info" element={<CardInfo/>}/>
        </Routes>
      </>
    </Router>
  );
}

export default App;