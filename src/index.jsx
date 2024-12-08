// src/index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './index.css';
import App from './App';
import './App.css';

const originalConsoleError = console.error;
// remove default props error message
console.error = (message, ...args) => {
    if (typeof message === 'string' && message.includes('defaultProps will be removed')) {
        return;
    }
    originalConsoleError.apply(console, [message, ...args])
}



const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const fitDashboardToScreen = () => {
  const screenWidth = window.innerWidth; // Device screen width
  const screenHeight = window.innerHeight; // Device screen height
  const baseWidth = 1280; // Fixed dashboard width for desktop mode
  const baseHeight = 720; // Approximate height for desktop mode (adjust as needed)
  
  // Calculate scale factors for width and height
  const widthScaleFactor = screenWidth / baseWidth;
  const heightScaleFactor = screenHeight / baseHeight;

  // Use the smaller scale factor to ensure the content fits entirely
  const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);

  // Update the viewport meta tag dynamically
  const metaViewport = document.querySelector('meta[name="viewport"]');
  if (metaViewport) {
      metaViewport.setAttribute(
          'content',
          `width=${baseWidth}, initial-scale=${scaleFactor}, maximum-scale=${scaleFactor}, user-scalable=no`
      );
  }
};

// Apply scaling on page load and resize
window.addEventListener('resize', fitDashboardToScreen);
window.addEventListener('load', fitDashboardToScreen);


