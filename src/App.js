import React, { useEffect }  from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import MyCard from './components/MyCard/MyCard';
import CardInfo from './components/CardInfo/CardInfo'

function useQuery() {
  return queryString.parse(useLocation().search);
}


function App() {

  function setVHVariable() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  // 초기 설정
  setVHVariable();
  // 윈도우 리사이즈 이벤트가 발생할 때마다 setVHVariable를 호출하여 --vh 값을 업데이트
  window.addEventListener('resize', setVHVariable);
  
  // Route Handler to manage component rendering based on the query string
  function RouteHandler({ component: Component }) {
    const query = useQuery();
    const userEmail = query.userEmail;

    useEffect(() => {
      if (userEmail) {
        console.log("User Email from URL Query String:", userEmail);
      }
    }, [userEmail]);

    return <Component />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RouteHandler component={MyCard} />} />
        <Route path="/card-info" element={<RouteHandler component={CardInfo} />} /> 
      </Routes>
    </Router>
  );
}

export default App;