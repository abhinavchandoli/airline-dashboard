import React, { useMemo } from 'react';
import { Line, Column, Pie } from '@ant-design/plots';
import { formatNumber } from '../../../utils/formatNumber';

/**
 * Helper functions to aggregate data
 */

// Filter data by selected year and quarter
function filterDataByTime(airlineData, balanceSheets, selectedYear, selectedQuarter) {
  const yearFilter = (d) =>
    (selectedYear === 'All' || d.YEAR === Number(selectedYear)) &&
    (selectedQuarter === 'All' || d.QUARTER === Number(selectedQuarter));

  const filteredAirlineData = airlineData.filter(yearFilter);
  const filteredBalanceSheets = balanceSheets.filter(yearFilter);

  return { filteredAirlineData, filteredBalanceSheets };
}

// Group data by year for time-series charts (we assume multiple years)
function groupByYear(dataArray) {
  const grouped = {};
  dataArray.forEach(d => {
    const year = d.YEAR?.toString() || 'Unknown';
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(d);
  });
  return grouped;
}

// Compute aggregates per year for airlineData
function computeAirlineYearlyMetrics(airlineData) {
  // For each year, sum up OP_REVENUES, NET_INCOME, OP_EXPENSES and compute margins
  const grouped = groupByYear(airlineData);
  const result = [];

  Object.keys(grouped).forEach(year => {
    const rows = grouped[year];
    const totalOpRevenues = rows.reduce((sum, r) => sum + (r.OP_REVENUES || 0), 0);
    const totalNetIncome = rows.reduce((sum, r) => sum + (r.NET_INCOME || 0), 0);
    const totalOpProfitLoss = rows.reduce((sum, r) => sum + (r.OP_PROFIT_LOSS || 0), 0);
    const totalOpExpenses = rows.reduce((sum, r) => sum + (r.OP_EXPENSES || 0), 0);

    const operatingMargin = totalOpRevenues !== 0 ? (totalOpProfitLoss / totalOpRevenues) * 100 : null;
    const netProfitMargin = totalOpRevenues !== 0 ? (totalNetIncome / totalOpRevenues) * 100 : null;

    result.push({
      year,
      totalOpRevenues,
      totalNetIncome,
      totalOpExpenses,
      operatingMargin,
      netProfitMargin
    });
  });

  // Sort by year
  result.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  return result;
}

// Compute balance sheet metrics per year
function computeBalanceSheetMetrics(balanceSheets, airlineData) {
  // We also need net income from airlineData for ROA and ROE
  const groupedBS = groupByYear(balanceSheets);
  const groupedAD = computeAirlineYearlyMetrics(airlineData);

  // Map airline metrics by year for easy lookup
  const adMap = {};
  groupedAD.forEach(d => {
    adMap[d.year] = d;
  });

  const result = [];

  Object.keys(groupedBS).forEach(year => {
    const rows = groupedBS[year];
    // Take the last quarter's data or average
    // For simplicity, just take the last one of the year
    const bsRecord = rows[rows.length - 1];

    const CURR_ASSETS = bsRecord?.CURR_ASSETS || 0;
    const CURR_LIABILITIES = bsRecord?.CURR_LIABILITIES || 0;
    const LIAB_SH_HLD_EQUITY = bsRecord?.LIAB_SH_HLD_EQUITY || 0;
    const SH_HLD_EQUIT_NET = bsRecord?.SH_HLD_EQUIT_NET || 0;
    const ASSETS = bsRecord?.ASSETS || 0;

    const airlineMetrics = adMap[year] || {};
    const totalNetIncome = airlineMetrics.totalNetIncome || 0;

    const currentRatio = (CURR_LIABILITIES !== 0) ? (CURR_ASSETS / CURR_LIABILITIES) : null;
    const debtToEquity = (SH_HLD_EQUIT_NET && SH_HLD_EQUIT_NET !== 0) 
      ? ((LIAB_SH_HLD_EQUITY - SH_HLD_EQUIT_NET) / SH_HLD_EQUIT_NET)
      : null;
    const roa = (ASSETS !== 0) ? (totalNetIncome / ASSETS) * 100 : null;
    const roe = (SH_HLD_EQUIT_NET && SH_HLD_EQUIT_NET !== 0) ? (totalNetIncome / SH_HLD_EQUIT_NET) * 100 : null;

    result.push({
      year,
      currentRatio,
      debtToEquity,
      roa,
      roe,
      ASSETS,
      LIAB_SH_HLD_EQUITY,
      SH_HLD_EQUIT_NET,
      CURR_ASSETS,
      CURR_LIABILITIES,
      record: bsRecord
    });
  });

  result.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  return result;
}

// Prepare data for composition charts (Assets, Liabilities, Equity)
function getBalanceSheetCompositionData(balanceSheetData) {
  // Take last available record (or specific year/quarter if filtering)
  if (!balanceSheetData || balanceSheetData.length === 0) return { assetsData: [], liabData: [], equityData: [] };

  const bs = balanceSheetData[balanceSheetData.length - 1]; 

  // Breakdown Assets (just a few major categories for illustration)
  const assetsData = [
    { category: 'Current Assets', value: bs.CURR_ASSETS || 0 },
    { category: 'Property & Equipment Net', value: bs.PROP_EQUIP_NET || 0 },
    { category: 'Special Funds', value: bs.SPECIAL_FUNDS || 0 },
    { category: 'Other Assets', value: (bs.ASSETS || 0) - ((bs.CURR_ASSETS || 0) + (bs.PROP_EQUIP_NET || 0) + (bs.SPECIAL_FUNDS || 0)) }
  ];

  // Breakdown Liabilities (just a few categories)
  const liabData = [
    { category: 'Current Liabilities', value: bs.CURR_LIABILITIES || 0 },
    { category: 'Long Term Debt', value: bs.LONG_TERM_DEBT || 0 },
    { category: 'Non-Rec Liab', value: bs.NON_REC_LIAB || 0 },
    { category: 'Deferred Credits', value: bs.DEF_CREDITS || 0 },
  ];

  // Equity breakdown
  const equityData = [
    { category: 'Shareholder Equity', value: bs.SH_HLD_EQUIT_NET || 0 },
    { category: 'Capital Stock', value: bs.CAPITAL_STOCK || 0 },
    { category: 'Paid in Capital', value: bs.PAID_IN_CAPITAL || 0 },
    { category: 'Retained Earnings', value: bs.RET_EARNINGS || 0 }
  ];

  return { assetsData, liabData, equityData };
}

/**
 * Chart Configurations
 */

// Simple line chart config generator for single metrics over time
function lineChartConfig(data, xField, yField, yTitle, labelFormatter = formatNumber) {
  return {
    data,
    xField,
    yField,
    height: 300,
    yAxis: {
      title: { text: yTitle },
      label: { formatter: labelFormatter },
    },
    tooltip: {
      formatter: (item) => ({ name: yTitle, value: formatNumber(item[yField]) }),
    },
    point: { size: 4 },
    smooth: true,
  };
}

// Dual line chart config for comparing two metrics
function dualLineChartConfig(data, xField, metrics, yTitles) {
  // metrics: [{ yField: 'operatingMargin', name: 'Operating Margin (%)' }, ...]
  return {
    data,
    xField,
    yField: metrics[0].yField,
    height: 300,
    seriesField: 'metric',
    meta: {
      value: { formatter: formatNumber }
    },
    legend: {
      position: 'top-right'
    },
    tooltip: {
      formatter: (item) => ({ name: item.metric, value: formatNumber(item.value) })
    },
    encode: {
      x: xField,
      y: 'value',
      color: 'metric'
    },
    geometryOptions: metrics.map(m => ({
      geometry: 'line',
      seriesField: 'metric',
      smooth: true,
      lineStyle: { lineWidth: 2 },
    })),
    // We'll preprocess data to a common structure
  };
}

// Pie chart config for composition
function pieChartConfig(data, title) {
  return {
    data,
    angleField: 'value',
    colorField: 'category',
    radius: 0.9,
    label: {
      type: 'outer',
      formatter: (item) => `${item.category}: ${formatNumber(item.value)}`,
    },
    tooltip: {
      formatter: (item) => ({ name: item.category, value: formatNumber(item.value) })
    },
    title: {
      visible: true,
      text: title,
    },
    interactions: [{ type: 'element-active' }],
    height: 300,
  };
}

/**
 * Main Component
 */

const FinancialBalanceSheetCharts = ({ airlineData, balanceSheets, selectedYear, selectedQuarter }) => {
  // Filter data based on year and quarter selection
  const { filteredAirlineData, filteredBalanceSheets } = useMemo(() => 
    filterDataByTime(airlineData, balanceSheets, selectedYear, selectedQuarter)
  , [airlineData, balanceSheets, selectedYear, selectedQuarter]);

  const yearlyAirlineMetrics = useMemo(() => computeAirlineYearlyMetrics(filteredAirlineData), [filteredAirlineData]);
  const bsMetrics = useMemo(() => computeBalanceSheetMetrics(filteredBalanceSheets, filteredAirlineData), [filteredBalanceSheets, filteredAirlineData]);
  const { assetsData, liabData, equityData } = useMemo(() => getBalanceSheetCompositionData(filteredBalanceSheets), [filteredBalanceSheets]);

  // Prepare data for dual line charts (operatingMargin vs netProfitMargin)
  const marginDualData = [];
  yearlyAirlineMetrics.forEach(d => {
    if (d.operatingMargin !== null) {
      marginDualData.push({ year: d.year, metric: 'Operating Margin (%)', value: d.operatingMargin });
    }
    if (d.netProfitMargin !== null) {
      marginDualData.push({ year: d.year, metric: 'Net Profit Margin (%)', value: d.netProfitMargin });
    }
  });

  const ratioDualData = [];
  bsMetrics.forEach(d => {
    if (d.currentRatio !== null) {
      ratioDualData.push({ year: d.year, metric: 'Current Ratio', value: d.currentRatio });
    }
    if (d.debtToEquity !== null) {
      ratioDualData.push({ year: d.year, metric: 'Debt-to-Equity', value: d.debtToEquity });
    }
  });

  const returnDualData = [];
  bsMetrics.forEach(d => {
    if (d.roa !== null) {
      returnDualData.push({ year: d.year, metric: 'ROA (%)', value: d.roa });
    }
    if (d.roe !== null) {
      returnDualData.push({ year: d.year, metric: 'ROE (%)', value: d.roe });
    }
  });

  // Operating Revenues vs Expenses line chart
  const revExpData = [];
  yearlyAirlineMetrics.forEach(d => {
    revExpData.push({ year: d.year, metric: 'Operating Revenues', value: d.totalOpRevenues });
    revExpData.push({ year: d.year, metric: 'Operating Expenses', value: d.totalOpExpenses });
  });

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 1. Net Income Over Time */}
        <div>
          <h3>Net Income Over Time</h3>
          <Line {...lineChartConfig(yearlyAirlineMetrics, 'year', 'totalNetIncome', 'Net Income ($)')} />
        </div>

        {/* 2. Operating Revenues vs Operating Expenses */}
        <div>
          <h3>Operating Revenues vs Operating Expenses</h3>
          <Column
            data={revExpData}
            xField="year"
            yField="value"
            seriesField="metric"
            legend={{ position: 'top' }}
            tooltip={{ formatter: (item) => ({ name: item.metric, value: formatNumber(item.value) }) }}
            height={300}
            yAxis={{ title: { text: 'Amount ($)' }, label: { formatter: formatNumber } }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 3. Operating Margin and Net Profit Margin Over Time */}
        <div>
          <h3>Operating & Net Profit Margins (%)</h3>
          <Line
            data={marginDualData}
            xField="year"
            yField="value"
            seriesField="metric"
            yAxis={{ title: { text: 'Margin (%)' } }}
            tooltip={{ formatter: (item) => ({ name: item.metric, value: `${item.value.toFixed(2)}%` }) }}
            height={300}
          />
        </div>

        {/* 4. Current Ratio & Debt-to-Equity Over Time */}
        <div>
          <h3>Current Ratio & Debt-to-Equity</h3>
          <Line
            data={ratioDualData}
            xField="year"
            yField="value"
            seriesField="metric"
            tooltip={{ formatter: (item) => ({ name: item.metric, value: formatNumber(item.value) }) }}
            yAxis={{ title: { text: 'Ratio' }, label: { formatter: formatNumber } }}
            height={300}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 5. Return on Assets (ROA) & Return on Equity (ROE) Over Time */}
        <div>
          <h3>ROA & ROE (%)</h3>
          <Line
            data={returnDualData}
            xField="year"
            yField="value"
            seriesField="metric"
            tooltip={{ formatter: (item) => ({ name: item.metric, value: `${item.value.toFixed(2)}%` }) }}
            yAxis={{ title: { text: 'Return (%)' } }}
            height={300}
          />
        </div>

        {/* 6. Composition of Assets */}
        <div>
          <h3>Composition of Assets</h3>
          <Pie {...pieChartConfig(assetsData, 'Assets Composition')} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 7. Composition of Liabilities */}
        <div>
          <h3>Composition of Liabilities</h3>
          <Pie {...pieChartConfig(liabData, 'Liabilities Composition')} />
        </div>

        {/* 8. Composition of Equity */}
        <div>
          <h3>Composition of Equity</h3>
          <Pie {...pieChartConfig(equityData, 'Equity Composition')} />
        </div>
      </div>

      {/* Add two more charts to reach at least 10 charts total */}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 9. Assets vs Liab+Equity Over Time (Check balance) */}
        <div>
          <h3>Assets vs Liabilities+Equity Over Time</h3>
          <Column
            data={bsMetrics.map(d => [
              { year: d.year, type: 'Total Assets', value: d.ASSETS },
              { year: d.year, type: 'Liab+Equity', value: d.LIAB_SH_HLD_EQUITY }
            ]).flat()}
            xField="year"
            yField="value"
            seriesField="type"
            tooltip={{ formatter: (item) => ({ name: item.type, value: formatNumber(item.value) }) }}
            yAxis={{ title: { text: 'Amount ($)' }, label: { formatter: formatNumber } }}
            height={300}
          />
        </div>

        {/* 10. Operating Profit Loss Over Time (From airlineData) */}
        <div>
          <h3>Operating Profit/Loss Over Time</h3>
          <Line
            data={yearlyAirlineMetrics.map(d => ({ year: d.year, value: d.totalOpRevenues - d.totalOpExpenses }))}
            xField="year"
            yField="value"
            yAxis={{ title: { text: 'Op Profit/Loss ($)' }, label: { formatter: formatNumber } }}
            tooltip={{ formatter: (item) => ({ name: 'Operating Profit/Loss', value: formatNumber(item.value) }) }}
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(FinancialBalanceSheetCharts);
