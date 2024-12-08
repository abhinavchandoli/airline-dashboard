// src/hooks/useAirlineData.js

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import airlines from '../data/airlines';

const useAirlineData = (airlineId) => {
  const [loading, setLoading] = useState(true);
  const [airlineData, setAirlineData] = useState([]);
  const [operatingData, setOperatingData] = useState([]);
  const [operatingDataExtended, setOperatingDataExtended] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [allStockKPIs, setAllStockKPIs] = useState([]);
  const [stockKPIs, setStockKPIs] = useState({});
  const [balanceSheets, setBalanceSheets] = useState([]);
  const [error, setError] = useState(null); // New error state

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Add a console log to verify API_BASE_URL
  console.log('API_BASE_URL:', API_BASE_URL);

  const calculateStockKPIs = useCallback(() => {
    if (!stockData || stockData.length === 0) return;

    // Sort stockData by Date and ensure dates are properly parsed
    const sortedData = [...stockData]
      .map(item => ({
        ...item,
        Date: new Date(item.Date)
      }))
      .sort((a, b) => a.Date - b.Date);

    // Get latest data point
    const latestDataPoint = sortedData[sortedData.length - 1];
    const latestPrice = parseFloat(latestDataPoint['Adj Close']);
    const latestDate = latestDataPoint.Date;

    // Create start of year date
    const startOfYear = new Date(latestDate.getFullYear(), 0, 1);

    // Find YTD starting point - look for exact date first, then closest before
    let ytdDataPoint = sortedData.find(d =>
      d.Date.getFullYear() === startOfYear.getFullYear() &&
      d.Date.getMonth() === startOfYear.getMonth() &&
      d.Date.getDate() === startOfYear.getDate()
    );

    // If no exact match, find the first data point after January 1st
    if (!ytdDataPoint) {
      ytdDataPoint = sortedData.find(d => d.Date >= startOfYear);
    }

    // Calculate YTD return
    let ytdReturn;
    if (ytdDataPoint && ytdDataPoint['Adj Close']) {
      const startPrice = parseFloat(ytdDataPoint['Adj Close']);
      ytdReturn = ((latestPrice - startPrice) / startPrice) * 100;
    } else {
      ytdReturn = 'N/A';
    }

    // 1-Year Return calculation
    const oneYearAgoDate = new Date(latestDate);
    oneYearAgoDate.setFullYear(oneYearAgoDate.getFullYear() - 1);
    const oneYearAgoDataPoint = sortedData.find(d => d.Date >= oneYearAgoDate) ||
      sortedData.find(d => d.Date <= oneYearAgoDate);
    let oneYearReturn;
    if (oneYearAgoDataPoint && oneYearAgoDataPoint['Adj Close']) {
      const startPrice = parseFloat(oneYearAgoDataPoint['Adj Close']);
      oneYearReturn = ((latestPrice - startPrice) / startPrice) * 100;
    } else {
      oneYearReturn = 'N/A';
    }

    // 3-Year Return calculation
    const threeYearsAgoDate = new Date(latestDate);
    threeYearsAgoDate.setFullYear(threeYearsAgoDate.getFullYear() - 3);
    const threeYearsAgoDataPoint = sortedData.find(d => d.Date >= threeYearsAgoDate) ||
      sortedData.find(d => d.Date <= threeYearsAgoDate);
    let threeYearReturn;
    if (threeYearsAgoDataPoint && threeYearsAgoDataPoint['Adj Close']) {
      const startPrice = parseFloat(threeYearsAgoDataPoint['Adj Close']);
      threeYearReturn = ((latestPrice - startPrice) / startPrice) * 100;
    } else {
      threeYearReturn = 'N/A';
    }

    // 5-Year Return calculation
    const fiveYearsAgoDate = new Date(latestDate);
    fiveYearsAgoDate.setFullYear(fiveYearsAgoDate.getFullYear() - 5);
    const fiveYearsAgoDataPoint = sortedData.find(d => d.Date >= fiveYearsAgoDate) ||
      sortedData.find(d => d.Date <= fiveYearsAgoDate);
    let fiveYearReturn;
    if (fiveYearsAgoDataPoint && fiveYearsAgoDataPoint['Adj Close']) {
      const startPrice = parseFloat(fiveYearsAgoDataPoint['Adj Close']);
      fiveYearReturn = ((latestPrice - startPrice) / startPrice) * 100;
    } else {
      fiveYearReturn = 'N/A';
    }

    // Set the KPIs
    setStockKPIs({
      latestPrice,
      latestDate: latestDate.toLocaleDateString(),
      ytdReturn,
      oneYearReturn,
      threeYearReturn,
      fiveYearReturn,
    });

    // Add a console log to verify KPIs
    console.log('Calculated Stock KPIs:', {
      latestPrice,
      latestDate: latestDate.toLocaleDateString(),
      ytdReturn,
      oneYearReturn,
      threeYearReturn,
      fiveYearReturn,
    });
  }, [stockData]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error state
      try {
        const [
          airlineDataResponse,
          stockDataResponse,
          allStockKPIsResponse,
          operatingDataResponse,
          operatingDataExtendedResponse,
          balanceSheetsResponse,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/airline-data/${airlineId}`),
          axios.get(`${API_BASE_URL}/stock-data/${airlineId}`),
          axios.get(`${API_BASE_URL}/stock-kpis`),
          axios.get(`${API_BASE_URL}/operating-data/${airlineId}`),
          axios.get(`${API_BASE_URL}/operatingdataextended/${airlineId}`),
          axios.get(`${API_BASE_URL}/balance-sheets/${airlineId}`)
        ]);

        // Add console logs to verify responses
        console.log('airlineDataResponse.data:', airlineDataResponse.data);
        console.log('stockDataResponse.data:', stockDataResponse.data);
        console.log('allStockKPIsResponse.data:', allStockKPIsResponse.data);
        console.log('operatingDataResponse.data:', operatingDataResponse.data);
        console.log('operatingDataExtendedResponse.data:', operatingDataExtendedResponse.data);
        console.log('balanceSheetsResponse.data:', balanceSheetsResponse.data);

        // Process and set airlineData
        setAirlineData(airlineDataResponse.data);

        // Process and set stockData
        setStockData(stockDataResponse.data);

        // Process allStockKPIs
        const data = allStockKPIsResponse.data;

        const mappedData = data
          .map((kpi) => {
            const airline = airlines.find((a) => a.ticker === kpi.ticker);
            if (airline) {
              return { ...kpi, airlineId: airline.id };
            } else {
              return null;
            }
          })
          .filter((kpi) => kpi !== null);

        setAllStockKPIs(mappedData);
        console.log('mappedData:', mappedData);

        const currentAirlineKPIs = mappedData.find(
          (kpi) => kpi.airlineId === airlineId
        );
        if (currentAirlineKPIs) {
          setStockKPIs(currentAirlineKPIs);
          console.log('currentAirlineKPIs:', currentAirlineKPIs);
        }

        // Set operatingData
        setOperatingData(operatingDataResponse.data);

        // Set operatingDataExtended
        setOperatingDataExtended(operatingDataExtendedResponse.data);

        // Set balanceSheets
        setBalanceSheets(balanceSheetsResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [airlineId, API_BASE_URL]);

  useEffect(() => {
    if (stockData && stockData.length > 0) {
      calculateStockKPIs();
    }
  }, [stockData, calculateStockKPIs]);

  return {
    loading,
    airlineData,
    operatingData,
    operatingDataExtended,
    stockData,
    allStockKPIs,
    stockKPIs,
    balanceSheets,
    error, // Expose error state
  };
};

export default useAirlineData;
