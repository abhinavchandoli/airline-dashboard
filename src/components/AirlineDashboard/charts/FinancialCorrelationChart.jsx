import React, { useState, useMemo } from 'react';
import { Card, Checkbox } from 'antd';
import { DualAxes } from '@ant-design/plots';
import Big from 'big.js';

// Metrics to provide
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
    metric: metric,
    value: aggregated[year].toNumber(),
  })).sort((a,b) => Number(a.YEAR)-Number(b.YEAR));
}

function aggregateAverageStockPriceByYear(stockData) {
  // Aggregate daily stock prices into yearly average
  const aggregated = {};
  stockData.forEach(item => {
    const date = new Date(item.Date);
    const year = date.getFullYear().toString();
    const adjClose = parseFloat(item['Adj Close'] || 0);
    if (!aggregated[year]) {
      aggregated[year] = { total: Big(0), count: 0 };
    }
    aggregated[year].total = aggregated[year].total.plus(Big(adjClose));
    aggregated[year].count += 1;
  });

  return Object.keys(aggregated).map(year => ({
    YEAR: year,
    stockPrice: aggregated[year].count > 0 ? aggregated[year].total.div(aggregated[year].count).toNumber() : null,
  })).sort((a,b) => Number(a.YEAR)-Number(b.YEAR));
}

function aggregateYieldByYear(data) {
  // YIELD might be already per-mile cost, we just sum and average
  // Similar to other metrics, we do a simple average if multiple rows per year
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
    value: aggregated[year].count > 0 ? aggregated[year].total / aggregated[year].count * 1e6 : 0,
  })).sort((a,b) => Number(a.YEAR)-Number(b.YEAR));
}

const FinancialCorrelationChart = ({ airlineData, operatingData, stockData }) => {
  const [selectedMetrics, setSelectedMetrics] = useState(METRICS.map(m => m.key));

  // Aggregate metrics by year
  const asmData = useMemo(() => aggregateDataByYear(airlineData, 'ASM'), [airlineData]);
  const rpmData = useMemo(() => aggregateDataByYear(airlineData, 'RPM'), [airlineData]);
  const lfData = useMemo(() => {
    // LOAD_FACTOR = sum(RPM)/sum(ASM)*100
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
      value: yearMap[year].asm.eq(0) ? 0 : yearMap[year].rpm.div(yearMap[year].asm).times(100).toNumber(),
    })).sort((a,b) => Number(a.YEAR)-Number(b.YEAR));
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

  // Combine all metric data into one array
  const allMetricsData = useMemo(() => {
    return [
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
    ];
  }, [asmData, rpmData, lfData, yieldData, casmData, rasmData, prasmData, opRevData, opExpData, trpData, fuelData]);

  // Filter the metrics data based on selectedMetrics
  const filteredMetricsData = useMemo(() => {
    return allMetricsData.filter(d => selectedMetrics.includes(d.metric));
  }, [allMetricsData, selectedMetrics]);

  // DualAxes data setup:
  // Left data: stock price
  // Right data: selected metrics
  // NOTE: YEAR should be numeric or string consistent. We'll use string.
  const leftData = useMemo(() => stockYearlyData.filter(d => d.stockPrice !== null), [stockYearlyData]);
  const rightData = filteredMetricsData;

  const config = {
    data: [leftData, rightData],
    xField: 'YEAR',
    yField: ['stockPrice', 'value'],
    geometryOptions: [
      {
        geometry: 'line',
        seriesField: 'stockPrice', // Just one line, no need for seriesField
        color: '#fa8c16', // stock price line color
        smooth: true,
        lineStyle: { lineWidth: 2 },
      },
      {
        geometry: 'line',
        seriesField: 'metric',
        smooth: true,
        lineStyle: { lineWidth: 2 },
        // You can assign different colors using color callback if needed
      },
    ],
    yAxis: {
      stockPrice: {
        title: { text: 'Stock Price ($)' },
      },
      value: {
        title: { text: 'Metric Value' },
      },
    },
    tooltip: {
      shared: true,
      showCrosshairs: true,
    },
    legend: {
      position: 'top',
    },
    interactions: [{ type: 'legend-filter' }, { type: 'tooltip', enable: true }],
  };

  const allKeys = METRICS.map(m => m.key);

  return (
    <Card title="Correlation with Stock Price" style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Checkbox.Group
          options={METRICS.map(m => ({ label: m.label, value: m.key }))}
          value={selectedMetrics}
          onChange={(vals) => setSelectedMetrics(vals)}
        />
      </div>
      <DualAxes {...config} />
    </Card>
  );
};

export default FinancialCorrelationChart;
