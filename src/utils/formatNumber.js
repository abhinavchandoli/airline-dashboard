// src/utils/formatNumber.js

import Big from 'big.js';

export function formatNumber(value) {
  if (value === 0) return '0';
  
  // Handle Big.js instances
  if (value instanceof Big) {
    if (value.gte(1_000_000_000_000)) {
      const num = value.div(1_000_000_000_000);
      return num.eq(num.round(0)) ? num.round(0).toString() + 'T' : num.toFixed(2) + 'T';
    } else if (value.gte(1_000_000_000)) {
      const num = value.div(1_000_000_000);
      return num.eq(num.round(0)) ? num.round(0).toString() + 'B' : num.toFixed(2) + 'B';
    } else if (value.gte(1_000_000)) {
      const num = value.div(1_000_000);
      return num.eq(num.round(0)) ? num.round(0).toString() + 'M' : num.toFixed(2) + 'M';
    } else if (value.gte(1_000)) {
      const num = value.div(1_000);
      return num.eq(num.round(0)) ? num.round(0).toString() + 'K' : num.toFixed(2) + 'K';
    }
    return value.toString();
  }
  
  // Handle BigInt
  if (typeof value === 'bigint') {
    if (value >= 1_000_000_000_000n) {
      const num = Number(value / 1_000_000_000_000n);
      return Number.isInteger(num) ? num.toString() + 'T' : num.toFixed(2) + 'T';
    } else if (value >= 1_000_000_000n) {
      const num = Number(value / 1_000_000_000n);
      return Number.isInteger(num) ? num.toString() + 'B' : num.toFixed(2) + 'B';
    } else if (value >= 1_000_000n) {
      const num = Number(value / 1_000_000n);
      return Number.isInteger(num) ? num.toString() + 'M' : num.toFixed(2) + 'M';
    } else if (value >= 1_000n) {
      const num = Number(value / 1_000n);
      return Number.isInteger(num) ? num.toString() + 'K' : num.toFixed(2) + 'K';
    }
    return value.toString();
  }
  
  // Handle regular numbers
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000_000) {
    const num = value / 1_000_000_000_000;
    return Number.isInteger(num) ? num.toString() + 'T' : num.toFixed(2) + 'T';
  } else if (absValue >= 1_000_000_000) {
    const num = value / 1_000_000_000;
    return Number.isInteger(num) ? num.toString() + 'B' : num.toFixed(2) + 'B';
  } else if (absValue >= 1_000_000) {
    const num = value / 1_000_000;
    return Number.isInteger(num) ? num.toString() + 'M' : num.toFixed(2) + 'M';
  } else if (absValue >= 1_000) {
    const num = value / 1_000;
    return Number.isInteger(num) ? num.toString() + 'K' : num.toFixed(2) + 'K';
  }
  return value.toString();
}
