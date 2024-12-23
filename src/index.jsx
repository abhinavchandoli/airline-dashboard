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




