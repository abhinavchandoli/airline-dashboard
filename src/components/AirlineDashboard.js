// AirlineDashboard.js
/* eslint-env es2020 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PageContainer, GridContent } from '@ant-design/pro-layout';
import { Statistic, Row, Col, Card, Progress, Table, Select, Modal, Tooltip, Tabs, Segmented, Spin } from 'antd';
import { Column, Area, Line } from '@ant-design/plots';
import { InfoCircleOutlined, FullscreenOutlined, ArrowsAltOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

import Big from 'big.js';
import './AirlineDashboard.css';
import airlines from '../data/airlines';
import { formatNumber } from '../utils/formatNumber';
import useAirlineData from '../hooks/useAirlineData';
import useKPIs from '../hooks/useKPIs';
import useOperatingKPIs from '../hooks/useOperatingKPIs';
import FuelStatistics from './FuelStatistics';

import {
  regionMap,
  regionMapReverse,
  filterDataByRegionAndYear,
  aggregateByYear,
  aggregateDataByYearAndQuarter,
  aggregateLoadFactorByYear,
  aggregateCASMvsRASMByYear,
  aggregateYieldByYear,
} from '../utils/dataTransformations';

const { Option } = Select;

const AirlineDashboard = () => {
  const { airlineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab');

  const {
    loading,
    airlineData,
    operatingData,
    operatingDataExtended,
    stockData,
    allStockKPIs,
    stockKPIs,
  } = useAirlineData(airlineId);

  const [stockViewRange, setStockViewRange] = useState('Max');
  const [activeTabKey, setActiveTabKey] = useState(initialTab === 'stock' ? '2' : '1');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expandedChart, setExpandedChart] = useState(null);

  // Filters for KPIs
  const [kpiSelectedRegion, setKpiSelectedRegion] = useState('All');
  const [kpiSelectedYear, setKpiSelectedYear] = useState('All');

  // Filters for Charts and Tables
  const [chartSelectedRegion, setChartSelectedRegion] = useState('All');
  const [operatingSelectedYear, setOperatingSelectedYear] = useState('All');
  const [operatingSelectedCategory, setOperatingSelectedCategory] = useState('All');

  const [availableOperatingYears, setAvailableOperatingYears] = useState([]);
  const [availableAircraftCategories, setAvailableAircraftCategories] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);

  // Use custom hooks for KPIs
  const kpis = useKPIs(airlineData, kpiSelectedRegion, kpiSelectedYear, regionMap, regionMapReverse);
  const operatingKPIs = useOperatingKPIs(operatingData, operatingSelectedYear, operatingSelectedCategory);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [airlineId]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (activeTabKey === '1') {
      queryParams.delete('tab');
    } else if (activeTabKey === '2') {
      queryParams.set('tab', 'stock');
    }
    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString(),
      },
      { replace: true }
    );
  }, [activeTabKey, navigate, location.pathname, location.search]);

  // Extract available years and categories for operating data
  useEffect(() => {
    if (operatingData && operatingData.length > 0) {
      // Extract available years
      const yearsSet = new Set(
        operatingData
          .filter((item) => item.YEAR !== undefined && item.YEAR !== null)
          .map((item) => item.YEAR.toString())
      );
      setAvailableOperatingYears(Array.from(yearsSet).sort((a, b) => a - b));

      // Extract available aircraft categories
      const categoriesSet = new Set(
        operatingData
          .filter((item) => item.AIRCRAFT_CATEGORIZATION)
          .map((item) => item.AIRCRAFT_CATEGORIZATION)
      );
      setAvailableAircraftCategories(Array.from(categoriesSet));
    }
  }, [operatingData]);

  // Extract available regions after airlineData fetch
  useEffect(() => {
    if (airlineData && airlineData.length > 0) {
      const regionsSet = new Set(airlineData.map((item) => regionMap[item.REGION]));
      setAvailableRegions(Array.from(regionsSet));
    }
  }, [airlineData]);

  const formatReturn = (value) => {
    if (value === 'N/A' || value === null || value === undefined) {
      return 'N/A';
    } else {
      return `${value.toFixed(2)}%`;
    }
  };

  const getStockChartData = useCallback(() => {
    if (!stockData || stockData.length === 0) return [];

    const endDate = new Date();
    let startDate;

    switch (stockViewRange) {
      case '1Y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '3Y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 3);
        break;
      case '5Y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      case 'Max':
        startDate = null; // Include all data
        break;
      default:
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const filteredData = stockData
      .filter((item) => {
        const date = new Date(item.Date);
        if (startDate) {
          return date >= startDate && date <= endDate;
        } else {
          return date <= endDate;
        }
      })
      .map((item) => {
        const date = new Date(item.Date);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return {
          date: `${year}-${month}-${day}`,
          price: parseFloat(item['Adj Close']),
          volume: parseInt(item.Volume),
        };
      });

    // Sort data by date
    filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

    return filteredData;
  }, [stockData, stockViewRange]);

  // Area chart configuration for stock
  const stockPriceAreaConfig = useMemo(() => {
    const data = getStockChartData();
    if (data.length === 0) return {};

    return {
      data,
      xField: 'date',
      yField: 'price',
      axis: {
        x: {
          title: 'Date',
          labelSpacing: 6,
          style: { labelTransform: 'rotate(90)' },
        },
        y: {
          title: 'Price',
        },
      },
      style: {
        fill: 'linear-gradient(-90deg, #41b6c4 0%, #225ea8 100%)',
      },
      smooth: true,
      height: 400,
    };
  }, [getStockChartData]);

  const volumeBarChartConfig = useMemo(() => {
    const data = getStockChartData();
    if (data.length === 0) return {};
    // Calculate price change to determine bar color
    const dataWithPriceChange = data.map((item, index) => {
      const prevPrice = index > 0 ? data[index - 1].price : item.price;
      return {
        ...item,
        priceChange: item.price - prevPrice,
      };
    });

    return {
      data: dataWithPriceChange,
      xField: 'date',
      yField: 'volume',
      colorField: 'priceChange',
      scale: {
        color: ({ priceChange }) => {
          if (priceChange > 0) {
            return 'green';
          } else if (priceChange < 0) {
            return 'red';
          } else {
            return 'gray';
          }
        },
      },
      style: {
        radiusTopLeft: 8,
        radiusTopRight: 8,
        radiusBottomLeft: 8,
        radiusBottomRight: 8,
      },
      tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
      height: 200,
    };
  }, [getStockChartData]);

  // Seasonal Data
  const getSeasonalData = useCallback(() => {
    if (!stockData || stockData.length === 0) return { chartData: [], years: [] };

    const endDate = new Date();
    const startYear = endDate.getFullYear() - 3; 
    const startDate = new Date(startYear, 0, 1);

    const filteredData = stockData
      .filter((item) => {
        const date = new Date(item.Date);
        const year = date.getFullYear();
        return date >= startDate && date <= endDate && year >= 2020;
      })
      .map((item) => ({
        date: item.Date,
        price: parseFloat(item['Adj Close']),
      }));

    // Sort data by date
    filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group data by year and month
    const dataByYearMonth = {};
    filteredData.forEach((item) => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const key = `${year}-${month}`;
      if (!dataByYearMonth[key]) {
        dataByYearMonth[key] = { total: 0, count: 0, year, month };
      }

      dataByYearMonth[key].total += item.price;
      dataByYearMonth[key].count += 1;
    });

    // Prepare data for the chart
    const chartData = [];
    Object.values(dataByYearMonth).forEach((item) => {
      chartData.push({
        month: item.month,
        price: item.total / item.count,
        year: item.year.toString(),
      });
    });

    // Extract and sort years
    const years = [...new Set(chartData.map((item) => item.year))];
    years.sort((a, b) => a - b);

    return { chartData, years };
  }, [stockData]);

  const { chartData: seasonalChartData, years } = getSeasonalData();
  const seasonalsChartConfig = {
    data: seasonalChartData,
    xField: 'month',
    yField: 'price',
    seriesField: 'year',
    scale: { color: { palette: 'Set2' } },
    meta: {
      year: {
        values: years,
      },
    },
    axis: {
      x: {
        title: 'Month',
      },
      y: {
        title: 'Price',
      },
    },
    colorField: 'year',
    shapeField: 'smooth',
    xAxis: {
      title: {
        text: 'Month',
      },
      label: {
        formatter: (val) => {
          const monthNames = [
            '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          ];
          return monthNames[parseInt(val, 10)];
        },
      },
    },
    yAxis: {
      label: {
        formatter: (value) => `$${value.toFixed(2)}`,
      },
    },
    height: 400,
    smooth: true,
    line: {
      style: {
        lineWidth: 2,
        strokeWidth: 1,
      },
    },
  };

  // Columns for expenses charts
  const expensesOnCrewColumns = {
    'PILOT_FLY_OPS': 'Pilots And Copilots',
    'TRAIN_FLY_OPS': 'Trainees And Instructors',
    'PERS_EXP_FLY_OPS': 'Personnel Expenses',
    'BENEFITS_FLY_OPS': 'Employee Benefits And Pensions',
    'PAY_TAX_FLY_OPS': 'Taxes-Payroll',
  };

  const purchasablesColumns = {
    'FUEL_FLY_OPS': 'Aircraft Fuel',
    'OIL_FLY_OPS': 'Aircraft Oil',
  };

  const maintenanceColumns = {
    'AIRFRAME_LABOR': 'Labor-Airframes',
    'ENGINE_LABOR': 'Labor-Aircraft Engines',
    'AIRFRAME_REPAIR': 'Airframe Repairs',
    'ENGINE_REPAIRS': 'Aircraft Engine Repairs',
    'AP_MT_BURDEN': 'Burden',
  };

  const materialsColumns = {
    'AIRFRAME_MATERIALS': 'Airframes',
    'ENGINE_MATERIALS': 'Aircraft Engines',
  };

  const depreciationColumns = {
    'AIRFRAME_DEP': 'Airframes',
    'ENGINE_DEP': 'Aircraft Engines',
    'PARTS_DEP': 'Airframe Parts',
    'ENG_PARTS_DEP': 'Aircraft Engine Parts',
    'OTH_FLT_EQUIP_DEP': 'Other Flight Equipment',
  };

  const aggregateOperatingExpensesByYear = useCallback((columns) => {
    const filteredData = operatingData.filter((item) => {
      const categoryMatch = operatingSelectedCategory === 'All' || item.AIRCRAFT_CATEGORIZATION === operatingSelectedCategory;
      const year = item.YEAR ? item.YEAR : null;
      const yearMatch = year && year >= 2001 && year <= 2024;
      return categoryMatch && yearMatch;
    });

    const aggregated = {};

    filteredData.forEach((item) => {
      const year = item.YEAR ? item.YEAR.toString() : null;
      if (!year) return;

      if (!aggregated[year]) {
        aggregated[year] = {};
        Object.keys(columns).forEach((col) => {
          aggregated[year][col] = Big(0);
        });
      }

      Object.keys(columns).forEach((col) => {
        aggregated[year][col] = aggregated[year][col].plus(Big(item[col] || 0));
      });
    });

    const result = [];
    Object.keys(aggregated).forEach((year) => {
      Object.keys(columns).forEach((col) => {
        result.push({
          year: year,
          type: columns[col],
          value: aggregated[year][col].toNumber(),
        });
      });
    });

    result.sort((a, b) => Number(a.year) - Number(b.year));
    return result;
  }, [operatingData, operatingSelectedCategory]);

  const expensesOnCrewData = aggregateOperatingExpensesByYear(expensesOnCrewColumns);
  const expensesOnCrewDataReversed = expensesOnCrewData.slice().reverse();

  const expensesOnCrewChartConfig = {
    data: expensesOnCrewDataReversed,
    xField: 'year',
    yField: 'value',
    colorField: 'type',
    seriesField: 'type',
    slider: {
      x: {
        values: [0.0, 0.3],
      },
    },
    axis: {
      y: {
        title: 'Expenses ($)',
        labelFormatter: formatNumber,
      },
    },
    stack: {
      groupBy: ['x', 'series'],
      series: false,
    },
    scale: { color: { range: ['#E64B35', '#8B7CB3', '#00A087', '#3C5488', '#4DBBD5'] } },
    height: 400,
    legend: {
      position: 'top-right',
    },
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
  };

  const purchasablesData = aggregateOperatingExpensesByYear(purchasablesColumns);
  const purchasablesDataReversed = purchasablesData.slice().reverse();

  const purchasablesChartConfig = {
    data: purchasablesDataReversed,
    xField: 'year',
    yField: 'value',
    colorField: 'type',
    seriesField: 'type',
    slider: {
      x: {
        values: [0.0, 1.0],
      },
    },
    axis: {
      y: {
        title: 'Expenses ($)',
        labelFormatter: formatNumber,
      },
    },
    stack: {
      groupBy: ['x', 'series'],
      series: false,
    },
    scale: { color: { range: ['#E64B35', '#8B7CB3', '#00A087', '#3C5488', '#4DBBD5'] } },
    height: 400,
    legend: {
      position: 'top-right',
    },
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
  };

  const maintenanceData = aggregateOperatingExpensesByYear(maintenanceColumns);
  const maintenanceDataReversed = maintenanceData.slice().reverse();

  const maintenanceChartConfig = {
    data: maintenanceDataReversed,
    xField: 'year',
    yField: 'value',
    colorField: 'type',
    seriesField: 'type',
    slider: {
      x: {
        values: [0.0, 0.3],
      },
    },
    axis: {
      y: {
        title: 'Expenses ($)',
        labelFormatter: formatNumber,
      },
    },
    stack: {
      groupBy: ['x', 'series'],
      series: false,
    },
    scale: { color: { range: ['#173753', '#6daedb', '#2892d7', '#6290c3', '#1d70a2'] } },
    height: 400,
    legend: {
      position: 'top-right',
    },
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
  };

  const materialsData = aggregateOperatingExpensesByYear(materialsColumns);
  const materialsDataReversed = materialsData.slice().reverse();

  const materialsChartConfig = {
    data: materialsDataReversed,
    xField: 'year',
    yField: 'value',
    colorField: 'type',
    seriesField: 'type',
    slider: {
      x: {
        values: [0.0, 0.3],
      },
    },
    axis: {
      y: {
        title: 'Expenses ($)',
        labelFormatter: formatNumber,
      },
    },
    stack: {
      groupBy: ['x', 'series'],
      series: false,
    },
    scale: { color: { range: ['#8B7CB3', '#4DBBD5'] } },
    height: 400,
    legend: {
      position: 'top-right',
    },
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
  };

  const depreciationData = aggregateOperatingExpensesByYear(depreciationColumns);
  const depreciationDataReversed = depreciationData.slice().reverse();

  const depreciationChartConfig = {
    data: depreciationDataReversed,
    xField: 'year',
    yField: 'value',
    colorField: 'type',
    seriesField: 'type',
    slider: {
      x: {
        values: [0.0, 0.3],
      },
    },
    axis: {
      y: {
        title: 'Expenses ($)',
        labelFormatter: formatNumber,
      },
    },
    stack: {
      groupBy: ['x', 'series'],
      series: false,
    },
    scale: { color: { range: ['#173753', '#6daedb', '#2892d7', '#6290c3', '#1d70a2'] } },
    height: 400,
    legend: {
      position: 'top-right',
    },
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
  };

  const handleEnlargeClick = useCallback((chartKey) => {
    setExpandedChart(chartKey);
    setIsModalVisible(true);
  }, []);

  const chartConfig = (metric, chartHeight = 400) => {
    return {
      data: aggregateDataByYearAndQuarter(airlineData, metric, chartSelectedRegion, regionMap, regionMapReverse).sort((a, b) => b.YEAR - a.YEAR),
      xField: 'YEAR',
      yField: 'value',
      autoFit: true,
      colorField: 'QUARTER',
      seriesField: 'QUARTER',
      stack: {
        groupBy: ['x', 'series'],
        series: false,
      },
      scale: { color: { range: ['#8B7CB3', '#00A087', '#3C5488', '#4DBBD5'] } },
      slider: {
        x: {
          values: [0.0, 0.2],
        },
      },
      height: chartHeight,
      padding: 'auto',
      axis: {
        x: {
          title: 'Year',
          rotate: -45,
        },
        y: {
          title: 'Miles',
          labelFormatter: formatNumber,
        },
      },
      style: {
        radiusTopLeft: 8,
        radiusTopRight: 8,
        radiusBottomLeft: 8,
        radiusBottomRight: 8,
      },
      tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
      animation: {
        appear: {
          animation: 'scale-in-y',
          duration: 800,
        },
      },
    };
  };

  const loadFactorChartConfig = {
    data: aggregateLoadFactorByYear(airlineData, chartSelectedRegion),
    xField: 'YEAR',
    yField: 'value',
    autoFit: true,
    scale: {
      y: { nice: true },
      color: '#225ea8',
    },
    shapeField: 'smooth',
    height: 400,
    padding: 'auto',
    axis: {
      y: { title: '%' },
    },
    smooth: true,
  };

  const casmRasmChartConfig = {
    data: aggregateCASMvsRASMByYear(airlineData, chartSelectedRegion),
    xField: 'YEAR',
    yField: 'value',
    autoFit: true,
    colorField: 'type',
    shapeField: 'smooth',
    scale: {
      color: {
        palette: ['#41b6c4', '#225ea8'],
      },
    },
    height: 400,
    padding: 'auto',
    axis: {
      y: { title: '¢ per ASM' },
    },
    legend: {
      position: 'top-right',
      visible: true,
      itemName: {
        style: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    },
    line: {
      style: {
        lineWidth: 2,
        strokeWidth: 1,
      },
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 800,
      },
    },
  };

  const yieldChartConfig = {
    data: aggregateYieldByYear(airlineData, chartSelectedRegion),
    xField: 'YEAR',
    yField: 'value',
    autoFit: true,
    height: 300,
    padding: 'auto',
    shapeField: 'smooth',
    scale: { color: { palette: 'Paired' } },
    axis: {
      y: { title: '¢ per Million Miles' },
    },
    xAxis: {
      title: {
        text: 'Year',
        style: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      label: {
        autoHide: false,
        autoRotate: false,
        rotate: -45,
      },
    },
    yAxis: {
      title: {
        text: 'Yield (cents per mile)',
        style: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      label: {
        formatter: (value) => `${value.toFixed(4)}¢`,
      },
    },
    smooth: true,
    lineStyle: {
      lineWidth: 3,
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        stroke: '#fff',
        lineWidth: 1,
      },
    },
    color: '#52c41a',
  };

  const getStackedColumnChartConfig = (metric) => {
    return {
      data: aggregateDataByYearAndQuarter(airlineData, metric, chartSelectedRegion, regionMap, regionMapReverse).sort((a, b) => b.YEAR - a.YEAR),
      xField: 'YEAR',
      yField: 'value',
      autoFit: true,
      height: 400,
      padding: 'auto',
      colorField: 'QUARTER',
      seriesField: 'QUARTER',
      stack: {
        groupBy: ['x', 'series'],
        series: false,
      },
      scale: { color: { range: ['#8B7CB3', '#00A087', '#3C5488', '#4DBBD5'] } },
      slider: {
        x: {
          values: [0.0, 0.3],
        },
      },
      axis: {
        x: {
          title: 'Year',
        },
        y: {
          title: '$',
          labelFormatter: formatNumber,
        },
      },
      style: {
        radiusTopLeft: 8,
        radiusTopRight: 8,
        radiusBottomLeft: 8,
        radiusBottomRight: 8,
      },
      tooltip: {
        items: [{ channel: 'y', valueFormatter: formatNumber }],
      },
      legend: {
        position: 'top-right',
      },
      smooth: true,
      animation: {
        appear: {
          animation: 'path-in',
          duration: 800,
        },
      },
    };
  };

  const transRevPaxChartConfig = getStackedColumnChartConfig('TRANS_REV_PAX');
  const OpRevenueChartConfig = getStackedColumnChartConfig('OP_REVENUES');
  const opExpensesChartConfig = getStackedColumnChartConfig('OP_EXPENSES');

  const tableColumns = (metric) => [
    {
      title: 'Year',
      dataIndex: 'YEAR',
      key: 'YEAR',
    },
    {
      title: metric,
      dataIndex: 'value',
      key: 'value',
      render: (text) => {
        if (metric.includes('Yield')) {
          return `${text.toFixed(4)}`;
        } else if (metric.includes('Load Factor')) {
          return `${text.toFixed(2)}%`;
        } else {
          return formatNumber(text);
        }
      },
    },
  ];

  const getLast5YearsData = (metric) => {
    const data = aggregateByYear(filterDataByRegionAndYear(airlineData, chartSelectedRegion, 'All', regionMap, regionMapReverse), metric);
    return data
      .sort((a, b) => b.YEAR - a.YEAR)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        key: item.YEAR,
      }));
  };

  const getLast5YearsLoadFactorData = () => {
    const data = aggregateLoadFactorByYear(airlineData, chartSelectedRegion);
    return data
      .sort((a, b) => b.YEAR - a.YEAR)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        key: item.YEAR,
      }));
  };

  const getLast5YearsYieldData = () => {
    const data = aggregateYieldByYear(airlineData, chartSelectedRegion);
    return data
      .sort((a, b) => b.YEAR - a.YEAR)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        key: item.YEAR,
      }));
  };

  const getAvailableYears = () => {
    if (!airlineData || airlineData.length === 0) {
      return [];
    }
    const yearsSet = new Set(
      airlineData
        .filter((item) => item.YEAR !== undefined && item.YEAR !== null)
        .map((item) => item.YEAR.toString())
    );
    return Array.from(yearsSet).sort((a, b) => a - b);
  };

  const airlineInfo = airlines.find((a) => a.id === airlineId);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const innerTabItems = [
    {
      key: '1',
      label: 'Expenses on Crew',
      children: <Column {...expensesOnCrewChartConfig} />,
    },
    {
      key: '2',
      label: 'Fuel & Oil',
      children: <Column {...purchasablesChartConfig} />,
    },
    {
      key: '3',
      label: 'Direct Maintenance',
      children: <Column {...maintenanceChartConfig} />,
    },
    {
      key: '4',
      label: 'Materials',
      children: <Column {...materialsChartConfig} />,
    },
    {
      key: '5',
      label: 'Depreciation',
      children: <Column {...depreciationChartConfig} />,
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: 'Traffic, Capacity, and Revenue by Region',
      children: (
        <>
          {/* KPI Filters */}
          <div style={{ marginTop: '20px' }}>
            <Row gutter={16}>
              <Col>
                <Select
                  className="custom-card"
                  style={{ width: 200 }}
                  placeholder="Select Region"
                  value={kpiSelectedRegion}
                  onChange={(value) => setKpiSelectedRegion(value)}
                >
                  <Option value="All">All Regions</Option>
                  {availableRegions.map((regionName) => (
                    <Option key={regionName} value={regionName}>
                      {regionName}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Select
                  className="custom-card"
                  style={{ width: 200 }}
                  placeholder="Select Year"
                  value={kpiSelectedYear}
                  onChange={(value) => setKpiSelectedYear(value)}
                >
                  <Option value="All">All Years</Option>
                  {getAvailableYears().map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>
          {/* KPIs */}
          <div style={{ marginTop: '24px' }}>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card">
                  <Statistic title="Total Departures" value={formatNumber(kpis.departures)} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card">
                  <Statistic title="Total Distance Traveled" value={formatNumber(kpis.distance)} suffix=" miles" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card">
                  <Statistic title="Passengers Trasnported" value={formatNumber(kpis.passengers)} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card">
                  <Statistic title="Average Load Factor" value={`${kpis.loadFactor}%`} />
                  <Progress
                    percent={parseFloat(kpis.loadFactor)}
                    strokeColor={{
                      '0%': '#41b6c4',
                      '100%': '#225ea8',
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
          {/* New KPIs */}
          <div style={{ marginTop: '24px' }}>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card">
                  <Statistic title="Transport Revenues - Passenger" value={formatNumber(kpis.transRevPax)} prefix="$" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card">
                  <Statistic title="Operating Expenses" value={formatNumber(kpis.opExpenses)} prefix="$" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card">
                  <Statistic title="Operating Revenue" value={formatNumber(kpis.opRevenue)} prefix="$" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card">
                  <Statistic title="Total Air Time" value={formatNumber(kpis.airTime)} suffix=" hours" />
                </Card>
              </Col>
            </Row>
          </div>
          {/* Charts/Tables Filters */}
          <div style={{ marginTop: '40px' }}>
            <Row gutter={16}>
              <Col>
                <Select
                  className="custom-card"
                  style={{ width: 200 }}
                  placeholder="Select Region"
                  value={chartSelectedRegion}
                  onChange={(value) => setChartSelectedRegion(value)}
                >
                  <Option value="All">All Regions</Option>
                  {availableRegions.map((regionName) => (
                    <Option key={regionName} value={regionName}>
                      {regionName}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>
          {/* Charts and Tables Content */}
          <GridContent>
            {/* TRANS_REV_PAX Chart */}
            <Row gutter={24} style={{ marginTop: '24px' }}>
              <Col span={24}>
                <Card
                  className="custom-card"
                  title={
                    <div>
                      <span>Transport Revenue - Passengers</span>
                      <div style={{ fontSize: '12px', fontWeight: 'normal' }}>Revenue from Transported Passengers ($)</div>
                    </div>
                  }
                >
                  <Column {...transRevPaxChartConfig} />
                </Card>
              </Col>
            </Row>

            {/* OP_REVENUES Chart */}
            <Row gutter={24} style={{ marginTop: '24px' }}>
              <Col span={24}>
                <Card className="custom-card" title="Operating Revenue ($)">
                  <Column {...OpRevenueChartConfig} />
                </Card>
              </Col>
            </Row>

            {/* ASM Chart and Table */}
            <Row gutter={24} style={{ marginTop: '24px' }}>
              <Col xs={24} lg={12}>
                <Card
                  className="custom-card"
                  title={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>Available Seat Miles (ASM)</span>
                      <div>
                        <Tooltip
                          title="Available Seat Miles (ASM) is a measure of an airline's passenger carrying capacity. It is calculated by multiplying the number of seats available on a flight by the distance flown."
                          overlayInnerStyle={{
                            backgroundColor: 'white',
                            color: 'black',
                          }}
                          placement="topRight"
                        >
                          <InfoCircleOutlined style={{ marginRight: 16 }} />
                        </Tooltip>
                        <FullscreenOutlined style={{ cursor: 'pointer' }} onClick={() => handleEnlargeClick('ASM')} />
                      </div>
                    </div>
                  }
                >
                  <Column {...chartConfig('ASM')} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="ASM - Last 5 Years" className="custom-card">
                  <Table columns={tableColumns('ASM')} dataSource={getLast5YearsData('ASM')} pagination={false} />
                </Card>
              </Col>
            </Row>

            {/* RPM Chart and Table */}
            <Row gutter={24} style={{ marginTop: '24px' }}>
              <Col xs={24} lg={12}>
                <Card
                  className="custom-card"
                  title={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>Revenue Passenger Miles (RPM)</span>
                      <div>
                        <Tooltip
                          title="Revenue Passenger Miles (RPM) is a measure of the volume of passengers carried by an airline. It is calculated by multiplying the number of revenue-paying passengers by the distance traveled."
                          overlayInnerStyle={{
                            backgroundColor: 'white',
                            color: 'black',
                          }}
                          placement="topRight"
                        >
                          <InfoCircleOutlined style={{ marginRight: 16 }} />
                        </Tooltip>
                        <FullscreenOutlined style={{ cursor: 'pointer' }} onClick={() => handleEnlargeClick('RPM')} />
                      </div>
                    </div>
                  }
                >
                  <Column {...chartConfig('RPM')} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="RPM - Last 5 Years" className="custom-card">
                  <Table columns={tableColumns('RPM')} dataSource={getLast5YearsData('RPM')} pagination={false} />
                </Card>
              </Col>
            </Row>

            {/* Load Factor Chart and Table */}
            <Row gutter={24} style={{ marginTop: '24px' }}>
              <Col xs={24} lg={12}>
                <Card title="Load Factor (%)" className="custom-card">
                  <Line {...loadFactorChartConfig} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Load Factor - Last 5 Years" className="custom-card">
                  <Table columns={tableColumns('Load Factor (%)')} dataSource={getLast5YearsLoadFactorData()} pagination={false} />
                </Card>
              </Col>
            </Row>

            {/* CASM vs RASM Chart */}
            <Row gutter={24} style={{ marginTop: '24px' }}>
              <Col span={24}>
                <Card
                  className="custom-card"
                  title={
                    <div>
                      <span>CASM vs RASM</span>
                      <div style={{ fontSize: '12px', fontWeight: 'normal' }}>
                        Cost per Available Seat Mile vs Revenue per Available Seat Mile (cents per ASM)
                      </div>
                    </div>
                  }
                >
                  <Line {...casmRasmChartConfig} />
                </Card>
              </Col>
            </Row>

            {/* Yield Chart and Table */}
            <Row gutter={24} style={{ marginTop: '24px' }}>
              <Col xs={24} lg={12}>
                <Card title="Passenger Yield (¢ per mile)" className="custom-card">
                  <Line {...yieldChartConfig} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Passenger Yield - Last 5 Years" className="custom-card">
                  <Table columns={tableColumns('Yield (¢ per mile)')} dataSource={getLast5YearsYieldData()} pagination={false} />
                </Card>
              </Col>
            </Row>

            {/* Operating Expenses Chart */}
            <Row gutter={24} style={{ marginTop: '24px' }}>
              <Col span={24}>
                <Card className="custom-card" title="Operating Expenses ($)">
                  <Column {...opExpensesChartConfig} />
                </Card>
              </Col>
            </Row>
          </GridContent>
        </>
      ),
    },
    {
      key: '2',
      label: 'Stock Performance',
      children: (
        <>
          {/* Stock Tab */}
          <div style={{ marginTop: '5px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#000' }}>
              {airlineInfo?.nasdaqName} ({airlineInfo?.ticker})
            </h2>
          </div>
          <div style={{ marginTop: '24px' }}>
            <Row gutter={[16, 16]} justify="start" align="top">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic
                    title={`Nasdaq Price (as of ${stockKPIs.latestDate})`}
                    value={`$${stockKPIs.latestPrice ? stockKPIs.latestPrice.toFixed(2) : 'N/A'}`}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic
                    title={`1-Year Return`}
                    value={formatReturn(stockKPIs.oneYearReturn)}
                    valueStyle={{
                      color:
                        stockKPIs.oneYearReturn === 'N/A'
                          ? 'inherit'
                          : stockKPIs.oneYearReturn >= 0
                          ? 'green'
                          : 'red',
                    }}
                    prefix={
                      stockKPIs.oneYearReturn === 'N/A'
                        ? null
                        : stockKPIs.oneYearReturn >= 0
                        ? <ArrowUpOutlined />
                        : <ArrowDownOutlined />
                    }
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic
                    title={`3-Year Return`}
                    value={formatReturn(stockKPIs.threeYearReturn)}
                    valueStyle={{
                      color:
                        stockKPIs.threeYearReturn === 'N/A'
                          ? 'inherit'
                          : stockKPIs.threeYearReturn >= 0
                          ? 'green'
                          : 'red',
                    }}
                    prefix={
                      stockKPIs.threeYearReturn === 'N/A'
                        ? null
                        : stockKPIs.threeYearReturn >= 0
                        ? <ArrowUpOutlined />
                        : <ArrowDownOutlined />
                    }
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic
                    title={`5-Year Return`}
                    value={formatReturn(stockKPIs.fiveYearReturn)}
                    valueStyle={{
                      color:
                        stockKPIs.fiveYearReturn === 'N/A'
                          ? 'inherit'
                          : stockKPIs.fiveYearReturn >= 0
                          ? 'green'
                          : 'red',
                    }}
                    prefix={
                      stockKPIs.fiveYearReturn === 'N/A'
                        ? null
                        : stockKPIs.fiveYearReturn >= 0
                        ? <ArrowUpOutlined />
                        : <ArrowDownOutlined />
                    }
                  />
                </Card>
              </Col>
            </Row>
            {/* View Switches */}
            <div style={{ marginTop: '24px' }}>
              <Segmented
                options={[
                  { label: '1Y', value: '1Y' },
                  { label: '3Y', value: '3Y' },
                  { label: '5Y', value: '5Y' },
                  { label: 'Max', value: 'Max' },
                ]}
                value={stockViewRange}
                onChange={(value) => setStockViewRange(value)}
              />
            </div>
            {/* Stock Price Area Chart */}
            <div style={{ marginTop: '24px' }}>
              {stockPriceAreaConfig && Object.keys(stockPriceAreaConfig).length > 0 ? (
                <Area {...stockPriceAreaConfig} />
              ) : (
                <div>Loading stock price chart...</div>
              )}
            </div>
            {/* Volume Bar Chart */}
            <div style={{ marginTop: '24px' }}>
              {volumeBarChartConfig && Object.keys(volumeBarChartConfig).length > 0 ? (
                <Column {...volumeBarChartConfig} />
              ) : (
                <div>Loading volume chart...</div>
              )}
            </div>
            {/* Seasonals Chart */}
            <div style={{ marginTop: '24px' }}>
              <Card title="Seasonals" className="custom-card">
                <Line {...seasonalsChartConfig} />
              </Card>
            </div>
            {/* Peer Comparison */}
            <div style={{ marginTop: '28px' }}>
              <h4 style={{ marginBottom: '24px' }}>Peer Comparison</h4>
              <Row gutter={[16, 16]} justify="center" align="top">
                {allStockKPIs.map((kpi) => (
                  <Col flex="20%" key={kpi.airlineId}>
                    <Card
                      className={`custom-card ${kpi.airlineId === airlineId ? 'current-airline' : 'other-airline'}`}
                      size={kpi.airlineId === airlineId ? 'default' : 'small'}
                      style={{
                        padding: '0',
                        margin: '0',
                        cursor: kpi.airlineId !== airlineId ? 'pointer' : 'default',
                      }}
                      onClick={() => {
                        if (kpi.airlineId !== airlineId) {
                          navigate(`/airline/${kpi.airlineId}?tab=stock`);
                        }
                      }}
                    >
                      <Statistic
                        title={
                          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                            {`${kpi.nasdaqName} (${kpi.ticker})`}
                          </span>
                        }
                        value={`$${kpi.latestPrice ? kpi.latestPrice.toFixed(2) : 'N/A'}`}
                      />
                      <Statistic
                        title="1-Year Return"
                        value={formatReturn(kpi.oneYearReturn)}
                        valueStyle={{
                          color:
                            kpi.oneYearReturn === 'N/A'
                              ? 'inherit'
                              : kpi.oneYearReturn >= 0
                              ? 'green'
                              : 'red',
                        }}
                        prefix={
                          kpi.oneYearReturn === 'N/A'
                            ? null
                            : kpi.oneYearReturn >= 0
                            ? <ArrowUpOutlined />
                            : <ArrowDownOutlined />
                        }
                      />
                      <Statistic
                        title={`3-Year Return`}
                        value={formatReturn(kpi.threeYearReturn)}
                        valueStyle={{
                          color:
                            kpi.threeYearReturn === 'N/A'
                              ? 'inherit'
                              : kpi.threeYearReturn >= 0
                              ? 'green'
                              : 'red',
                        }}
                        prefix={
                          kpi.threeYearReturn === 'N/A'
                            ? null
                            : kpi.threeYearReturn >= 0
                            ? <ArrowUpOutlined />
                            : <ArrowDownOutlined />
                        }
                      />
                      <Statistic
                        title={`5-Year Return`}
                        value={formatReturn(kpi.fiveYearReturn)}
                        valueStyle={{
                          color:
                            kpi.fiveYearReturn === 'N/A'
                              ? 'inherit'
                              : kpi.fiveYearReturn >= 0
                              ? 'green'
                              : 'red',
                        }}
                        prefix={
                          kpi.fiveYearReturn === 'N/A'
                            ? null
                            : kpi.fiveYearReturn >= 0
                            ? <ArrowUpOutlined />
                            : <ArrowDownOutlined />
                        }
                      />
                      {kpi.airlineId !== airlineId && (
                        <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                          <ArrowsAltOutlined style={{ fontSize: '15px' }} />
                        </div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </>
      ),
    },
    {
      key: '3',
      label: 'Operating Statistics/Expenses',
      children: (
        <>
          {/* Operating Stats/Expenses Tab */}
          <div style={{ marginTop: '20px' }}>
            <Row gutter={16}>
              <Col>
                <Select
                  className="custom-card"
                  style={{ width: 200 }}
                  placeholder="Select Year"
                  value={operatingSelectedYear}
                  onChange={(value) => setOperatingSelectedYear(value)}
                >
                  <Option value="All">All Years</Option>
                  {availableOperatingYears.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Select
                  className="custom-card"
                  style={{ width: 200 }}
                  placeholder="Select Aircraft Category"
                  value={operatingSelectedCategory}
                  onChange={(value) => setOperatingSelectedCategory(value)}
                >
                  <Option value="All">All Categories</Option>
                  {availableAircraftCategories.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>
          {/* KPIs */}
          <div style={{ marginTop: '24px' }}>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic title="Aircraft Operating Expenses" value={formatNumber(operatingKPIs.totalAirOpExpenses)} prefix="$" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic title="Flying Operating Expenses" value={formatNumber(operatingKPIs.totalFlyOpExpenses)} prefix="$" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic title="Fuel & Oil Expense" value={formatNumber(operatingKPIs.totalFuelOilExpense)} prefix="$" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic title="Flight Maintenance Expense" value={formatNumber(operatingKPIs.totalFlightMaintenanceExpense)} prefix="$" />
                </Card>
              </Col>
            </Row>
          </div>
          {/* Second row of KPIs */}
          <div style={{ marginTop: '24px' }}>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic title="Operating Fleet" value={operatingKPIs.operatingFleet.toFixed(0)} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic title="Airborne Hours" value={formatNumber(operatingKPIs.airborneHours)} suffix="hours" />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic title="Aircraft Fuel (Gallons)" value={formatNumber(operatingKPIs.aircraftFuelGallons)} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} span={6}>
                <Card className="custom-card" size="small" style={{ padding: '0', margin: '0' }}>
                  <Statistic title="Departures per Aircraft" value={operatingKPIs.departuresPerAircraft.toFixed(2)} />
                </Card>
              </Col>
            </Row>
          </div>
          <Card className="custom-card" style={{ marginTop: '24px' }}>
            <div style={{ minHeight: '400px' }}>
              <Tabs defaultActiveKey="1" style={{ marginTop: '-16px' }} destroyInactiveTabPane={true} items={innerTabItems} />
            </div>
          </Card>
          {/* Fuel Statistics Component */}
          <FuelStatistics
            operatingData={operatingData}
            operatingDataExtended={operatingDataExtended}
            operatingSelectedCategory={operatingSelectedCategory}
          />
        </>
      ),
    },
  ];

  return (
    <PageContainer
      loading={loading}
      content={
        <>
          <img src={airlineInfo?.logo} alt={airlineInfo?.name} style={{ maxHeight: '65px', marginBottom: '10px' }} />
        </>
      }
    >
      <Tabs
        defaultActiveKey="1"
        activeKey={activeTabKey}
        onChange={(key) => setActiveTabKey(key)}
        destroyInactiveTabPane={true}
        items={tabItems}
      />
      {/* Modal for Enlarged Charts */}
      <Modal
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        width="90%"
        style={{ padding: 0 }}
        destroyOnClose={true}
      >
        {expandedChart && (
          <div style={{ padding: '24px' }}>
            {expandedChart === 'ASM' && (
              <Card className="custom-card" title="Available Seat Miles (ASM)" bordered={false}>
                <Column {...chartConfig('ASM', 430)} />
              </Card>
            )}
            {expandedChart === 'RPM' && (
              <Card className="custom-card" title="Revenue Passenger Miles (RPM)" bordered={false}>
                <Column {...chartConfig('RPM', 430)} />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default AirlineDashboard;
