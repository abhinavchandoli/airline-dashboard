import React, { useMemo, useState } from 'react';
import { Card, Select } from 'antd';
import { DualAxes } from '@ant-design/plots';
import Big from 'big.js';
import { formatNumber } from '../../../utils/formatNumber';

const { Option } = Select;

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
  const [selectedMetric, setSelectedMetric] = useState('ASM'); // default is ASM

  // Aggregate data for all metrics
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

  // Filter data to only the selected metric
  const selectedMetricData = useMemo(() => {
    return allMetricsData.filter(d => d.metric === selectedMetric);
  }, [allMetricsData, selectedMetric]);

  // Find intersection of years: we only plot years present in both stock data and metric data
  const intersectionData = useMemo(() => {
    const stockYears = new Set(stockYearlyData.map(d => d.YEAR));
    const metricYears = new Set(selectedMetricData.map(d => d.YEAR));

    // intersection of both sets
    const intersectYears = [...stockYears].filter(y => metricYears.has(y));

    // For intersection years, build final array with both stockPrice and metric value
    const finalArr = [];
    // We'll find the corresponding stockPrice for that year
    // and the corresponding metric value
    intersectYears.forEach(year => {
      const stockEntry = stockYearlyData.find(s => s.YEAR === year);
      const metricEntry = selectedMetricData.find(m => m.YEAR === year);
      finalArr.push({
        YEAR: year,
        stockPrice: stockEntry ? stockEntry.stockPrice : null,
        value: metricEntry ? metricEntry.value : null,
        metric: selectedMetric
      });
    });

    return finalArr.sort((a,b) => Number(a.YEAR)-Number(b.YEAR));
  }, [stockYearlyData, selectedMetricData, selectedMetric]);

  const correlationChartConfig = useMemo(() => ({
    data: [intersectionData, intersectionData],
    xField: 'YEAR',
    yField: ['stockPrice', 'value'],
    height: 400,
    geometryOptions: [
      {
        geometry: 'line',
        smooth: true,
        color: 'black',
        lineStyle: { lineWidth: 3 },
      },
      {
        geometry: 'line',
        smooth: true,
        seriesField: 'metric',
        lineStyle: { lineWidth: 2 },
      },
    ],
    meta: {
      stockPrice: {
        alias: 'Stock Price ($)',
        formatter: formatNumber,
      },
      value: {
        alias: 'Metric Value',
        formatter: formatNumber,
      }
    },
    yAxis: {
      stockPrice: {
        title: { text: 'Stock Price ($)' },
        label: { formatter: formatNumber },
      },
      value: {
        title: { text: selectedMetric === 'LOAD_FACTOR' ? 'Load Factor (%)' : 'Metric Value' },
        label: { formatter: formatNumber },
      }
    },
    tooltip: {
      shared: true,
      showCrosshairs: true,
    },
  }), [intersectionData, selectedMetric]);

  return (
    <Card title="Correlation with Stock Price" style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Select
          style={{ width: 300 }}
          placeholder="Select a Metric"
          value={selectedMetric}
          onChange={(val) => setSelectedMetric(val)}
        >
          {METRICS.map(m => <Option key={m.key} value={m.key}>{m.label}</Option>)}
        </Select>
      </div>
      <DualAxes {...correlationChartConfig} />
    </Card>
  );
}
