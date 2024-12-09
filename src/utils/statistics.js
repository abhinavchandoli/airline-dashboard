// src/utils/statistics.js
export function pearsonCorrelation(xArray, yArray) {
    const n = xArray.length;
    const meanX = xArray.reduce((a, b) => a + b, 0) / n;
    const meanY = yArray.reduce((a, b) => a + b, 0) / n;
  
    let num = 0;
    let den1 = 0;
    let den2 = 0;
  
    for (let i = 0; i < n; i++) {
      const x = xArray[i] - meanX;
      const y = yArray[i] - meanY;
      num += x * y;
      den1 += x * x;
      den2 += y * y;
    }
  
    return den1 === 0 || den2 === 0 ? 0 : num / Math.sqrt(den1 * den2);
  }
  