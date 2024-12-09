import React, { useMemo, useState } from 'react';
import { Card, Checkbox } from 'antd';
import {DualAxes } from '@ant-design/plots';
import Big from 'big.js';

const METRICS = [
  { key: 'ASM', label: 'ASM' },
  { key: 'RPM', label: 'RPM' },
  { key: 'LOAD_FACTOR', label: 'Load Factor (%)' },
  { key: 'YIELD', label: 'Passenger Yield (¢/mile)' },
  { key: 'CASM', label: 'CASM (¢/ASM)' },
  { key: 'RASM', label: 'RASM (¢/ASM)' },
  { key: 'PRASM', label: 'PRASM (¢/ASM)' },
  { key: 'OP_REVENUES', label: 'Operating Revenues ($)' },
  { key: 'OP_EXPENSES', label: 'Operating Expenses ($)' },
  { key: 'TRANS_REV_PAX', label: 'Transport Revenue - Pax ($)' },
  { key: 'FUEL_FLY_OPS', label: 'Fuel Expense ($)' },
];

function formatNumber(val) {
  if (val >= 1e9) return (val/1e9).toFixed(2) + 'B';
  if (val >= 1e6) return (val/1e6).toFixed(2) + 'M';
  if (val >= 1e3) return (val/1e3).toFixed(2) + 'K';
  return val.toString();
}

function aggregateDataByYear(data, metric) {
  const aggregated = {};
  data.forEach(item => {
    const year = item.YEAR ? item.YEAR.toString() : null;
    if (!year) return;
    const value = Big(item[metric] || 0);
    if (!aggregated[year]) {
      aggregated[year] = Big(0);
    }
    aggregated[year] = aggregated[year].plus(value);
  });
  return Object.keys(aggregated).map(year => ({
    YEAR: year,
    metric,
    value: aggregated[year].toNumber(),
  })).sort((a,b) => Number(a.YEAR)-Number(b.YEAR));
}

function aggregateAverageStockPriceByYear(stockData) {
  const aggregated = {};
  stockData.forEach(item => {
    const date = new Date(item.Date);
    const year = date.getFullYear().toString();
    const adjClose = parseFloat(item['Adj Close'] || 0);
    if (!aggregated[year]) {
      aggregated[year] = { total: Big(0), count: 0 };
    }
    aggregated[year].total = aggregated[year].total.plus(adjClose);
    aggregated[year].count += 1;
  });

  return Object.keys(aggregated).map(year => ({
    YEAR: year,
    stockPrice: aggregated[year].count > 0 ? aggregated[year].total.div(aggregated[year].count).toNumber() : null,
  })).sort((a,b) => Number(a.YEAR)-Number(b.YEAR));
}

function aggregateYieldByYear(data) {
  const aggregated = {};
  data.forEach(item => {
    const year = item.YEAR ? item.YEAR.toString() : null;
    if (!year) return;
    const val = item.YIELD || 0;
    if(!aggregated[year]) {
      aggregated[year] = { total: 0, count: 0 };
    }
    aggregated[year].total += val;
    aggregated[year].count += 1;
  });
  return Object.keys(aggregated).map(year => ({
    YEAR: year,
    metric: 'YIELD',
    value: aggregated[year].count > 0 ? (aggregated[year].total / aggregated[year].count)*1e6 : 0,
  })).sort((a,b) => Number(a.YEAR)-Number(b.YEAR));
}

export default function FinancialCorrelationChart({ airlineData, operatingData, stockData }) {
  const [selectedMetrics, setSelectedMetrics] = useState(METRICS.map(m => m.key));

  const asmData = useMemo(() => aggregateDataByYear(airlineData, 'ASM'), [airlineData]);
  const rpmData = useMemo(() => aggregateDataByYear(airlineData, 'RPM'), [airlineData]);

  const lfData = useMemo(() => {
    const yearMap = {};
    airlineData.forEach(item => {
      const year = item.YEAR ? item.YEAR.toString() : null;
      if (!year) return;
      if (!yearMap[year]) { yearMap[year] = { asm: Big(0), rpm: Big(0) }; }
      yearMap[year].asm = yearMap[year].asm.plus(item.ASM||0);
      yearMap[year].rpm = yearMap[year].rpm.plus(item.RPM||0);
    });
    return Object.keys(yearMap).map(year => ({
      YEAR: year,
      metric: 'LOAD_FACTOR',
      value: yearMap[year].asm.eq(0)?0:yearMap[year].rpm.div(yearMap[year].asm).times(100).toNumber()
    })).sort((a,b)=>Number(a.YEAR)-Number(b.YEAR));
  }, [airlineData]);

  const yieldData = useMemo(() => aggregateYieldByYear(airlineData), [airlineData]);
  const casmData = useMemo(() => aggregateDataByYear(airlineData, 'CASM').map(d => ({...d, value: d.value*1e6})), [airlineData]);
  const rasmData = useMemo(() => aggregateDataByYear(airlineData, 'RASM').map(d => ({...d, value: d.value*1e6})), [airlineData]);
  const prasmData = useMemo(() => aggregateDataByYear(airlineData, 'PRASM').map(d => ({...d, value: d.value*1e6})), [airlineData]);
  const opRevData = useMemo(() => aggregateDataByYear(airlineData, 'OP_REVENUES'), [airlineData]);
  const opExpData = useMemo(() => aggregateDataByYear(airlineData, 'OP_EXPENSES'), [airlineData]);
  const trpData = useMemo(() => aggregateDataByYear(airlineData, 'TRANS_REV_PAX'), [airlineData]);
  const fuelData = useMemo(() => aggregateDataByYear(operatingData, 'FUEL_FLY_OPS'), [operatingData]);
  const stockYearlyData = useMemo(() => aggregateAverageStockPriceByYear(stockData), [stockData]);

  const allMetricsData = useMemo(()=>[
    ...asmData,
    ...rpmData,
    ...lfData,
    ...yieldData,
    ...casmData,
    ...rasmData,
    ...prasmData,
    ...opRevData,
    ...opExpData,
    ...trpData,
    ...fuelData,
  ],[asmData,rpmData,lfData,yieldData,casmData,rasmData,prasmData,opRevData,opExpData,trpData,fuelData]);

  const filteredMetricsData = useMemo(()=>{
    return allMetricsData.filter(d=>selectedMetrics.includes(d.metric));
  }, [allMetricsData, selectedMetrics]);

  // Merge stock and metric data into a single dataset
  // We'll have YEAR, stockPrice, metric, value
  // stockPrice rows won't have metric/value and metric rows won't have stockPrice
  const mergedData = useMemo(()=>{
    const yearSet = new Set();
    stockYearlyData.forEach(d=>yearSet.add(d.YEAR));
    filteredMetricsData.forEach(d=>yearSet.add(d.YEAR));

    const finalArr = [];
    // Add stock data rows
    stockYearlyData.forEach(d => {
      finalArr.push({
        YEAR: d.YEAR,
        stockPrice: d.stockPrice,
      });
    });
    // Add metrics data rows
    filteredMetricsData.forEach(d => {
      finalArr.push({
        YEAR: d.YEAR,
        metric: d.metric,
        value: d.value,
      });
    });
    return finalArr.sort((a,b)=>Number(a.YEAR)-Number(b.YEAR));
  },[stockYearlyData, filteredMetricsData]);

  const correlationChartConfig = useMemo(()=>({
    data: mergedData,
    xField: 'YEAR',
    height: 400,
    scale: { y: { nice: false } },
    children: [
      {
        // Stock price line
        type: 'line',
        yField:'stockPrice',
        style: {
          stroke: 'black',
          shape:'smooth',
          lineWidth: 3,
        },
        axis:{
          y:{
            title:'Stock Price ($)',
            style:{titleFill:'black'},
            labelFormatter: formatNumber,
          },
        },
      },
      {
        // Metrics lines
        type:'line',
        yField:'value',
        seriesField:'metric',
        style:{
          lineWidth:2,
          shape:'smooth',
        },
        axis:{
          y:{
            position:'right',
            title:'Metric Value',
            style:{titleFill:'#4DBBD5'},
            labelFormatter: formatNumber,
          },
        },
      },
    ],
    tooltip: {
      items: [{ channel: 'y', valueFormatter: formatNumber}],
    },
  }),[mergedData]);

  return (
    <Card title="Correlation with Stock Price" style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Checkbox.Group
          options={METRICS.map(m => ({ label: m.label, value: m.key }))}
          value={selectedMetrics}
          onChange={(vals) => setSelectedMetrics(vals)}
        />
      </div>
      <DualAxes {...correlationChartConfig} />
    </Card>
  );
}
