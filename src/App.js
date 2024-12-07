// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/Homepage';
import AirlineDashboard from './components/AirlineDashboard/AirlineDashboard';
import DataPage from './components/DataPage';
import ResourcesPage from './components/ResourcesPage';
import AboutPage from './components/AboutPage';
import './App.css';

const enforceDesktopMode = () => {
  const metaViewport = document.querySelector('meta[name="viewport"]');
  if (metaViewport) {
      metaViewport.setAttribute('content', 'width=1280, initial-scale=1');
  }
};

window.addEventListener('resize', enforceDesktopMode);
window.addEventListener('load', enforceDesktopMode);

function App() {
  return (
    <Router>
      <Header />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/airline/:airlineId" element={<AirlineDashboard />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


