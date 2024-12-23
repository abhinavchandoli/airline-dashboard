// src/utils/isMobile.js
export function isMobileDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    // Common checks for mobile user agents
    if (/android/i.test(ua)) return true;
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return true;
    
    return false;
  }
  