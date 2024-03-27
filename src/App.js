import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MyCard from './components/MyCard/MyCard';
import CardCollection from './components/CardCollection/CardCollection';
import CardInfo from './components/CardInfo/CardInfo'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MyCard />} />
        <Route path="/my-card" element={<MyCard />} />
        <Route path="/card-collection" element={<CardCollection />} />
        <Route path="/card-info" element={<CardInfo />} /> 
      </Routes>
    </Router>
  );
}

export default App;
