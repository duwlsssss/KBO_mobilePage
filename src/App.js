import React, { useEffect }  from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import MyCard from './components/MyCard/MyCard';
import CardInfo from './components/CardInfo/CardInfo'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function useQuery() {
  return queryString.parse(useLocation().search);
}


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
      <>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<RouteHandler component={MyCard} />} />
          <Route path="/card-info" element={<RouteHandler component={CardInfo} />} /> 
        </Routes>
      </>
    </Router>
  );
}

export default App;