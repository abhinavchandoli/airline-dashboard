import React, { useMemo } from 'react';
import { Card, Tabs } from 'antd';
import { Line, Column, Pie } from '@ant-design/plots';
import { formatNumber } from '../../../utils/formatNumber';

// Helper functions
function groupByYear(dataArray) {
  const grouped = {};
  dataArray.forEach(d => {
    const year = d.YEAR?.toString() || 'Unknown';
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(d);
  });
  return grouped;
}

function computeAirlineYearlyMetrics(airlineData) {
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

  result.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  return result;
}

function computeBalanceSheetMetrics(balanceSheets, airlineData) {
  const groupedBS = groupByYear(balanceSheets);
  const yearlyAirlineMetrics = computeAirlineYearlyMetrics(airlineData);

  const adMap = {};
  yearlyAirlineMetrics.forEach(d => {
    adMap[d.year] = d;
  });

  const result = [];

  Object.keys(groupedBS).forEach(year => {
    const rows = groupedBS[year];
    // Take the last quarter of that year
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

function getBalanceSheetCompositionData(balanceSheetData) {
  if (!balanceSheetData || balanceSheetData.length === 0) return { assetsData: [], liabData: [], equityData: [] };

  const bs = balanceSheetData[balanceSheetData.length - 1];
  const assetsData = [
    { category: 'Current Assets', value: bs.CURR_ASSETS || 0 },
    { category: 'Property & Equipment Net', value: bs.PROP_EQUIP_NET || 0 },
    { category: 'Special Funds', value: bs.SPECIAL_FUNDS || 0 },
    { category: 'Other Assets', value: (bs.ASSETS || 0) - ((bs.CURR_ASSETS || 0) + (bs.PROP_EQUIP_NET || 0) + (bs.SPECIAL_FUNDS || 0)) }
  ];

  const liabData = [
    { category: 'Current Liabilities', value: bs.CURR_LIABILITIES || 0 },
    { category: 'Long Term Debt', value: bs.LONG_TERM_DEBT || 0 },
    { category: 'Non-Rec Liab', value: bs.NON_REC_LIAB || 0 },
    { category: 'Deferred Credits', value: bs.DEF_CREDITS || 0 },
  ];

  const equityData = [
    { category: 'Shareholder Equity', value: bs.SH_HLD_EQUIT_NET || 0 },
    { category: 'Capital Stock', value: bs.CAPITAL_STOCK || 0 },
    { category: 'Paid in Capital', value: bs.PAID_IN_CAPITAL || 0 },
    { category: 'Retained Earnings', value: bs.RET_EARNINGS || 0 }
  ];

  return { assetsData, liabData, equityData };
}

const FinancialBalanceSheetCharts = ({ airlineData, balanceSheets }) => {
  const yearlyAirlineMetrics = useMemo(() => computeAirlineYearlyMetrics(airlineData), [airlineData]);
  const bsMetrics = useMemo(() => computeBalanceSheetMetrics(balanceSheets, airlineData), [balanceSheets, airlineData]);
  const { assetsData, liabData, equityData } = useMemo(() => getBalanceSheetCompositionData(balanceSheets), [balanceSheets]);

  // Prepare Data Arrays
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

  const revExpData = [];
  yearlyAirlineMetrics.forEach(d => {
    revExpData.push({ year: d.year, type: 'Operating Revenues', value: d.totalOpRevenues });
    revExpData.push({ year: d.year, type: 'Operating Expenses', value: d.totalOpExpenses });
  });

  const assetsLiabData = bsMetrics.map(d => [
    { year: d.year, type: 'Total Assets', value: d.ASSETS },
    { year: d.year, type: 'Liab+Equity', value: d.LIAB_SH_HLD_EQUITY }
  ]).flat();

  const opProfitLossData = yearlyAirlineMetrics.map(d => ({
    year: d.year,
    value: d.totalOpRevenues - d.totalOpExpenses
  }));

  // Chart Configs with useMemo (similar to FuelStatistics)
  const netIncomeChartConfig = useMemo(() => ({
    data: yearlyAirlineMetrics,
    xField: 'year',
    yField: 'totalNetIncome',
    height: 400,
    style: {
      stroke: '#2892d7',
      shape:'smooth',
      lineWidth: 2,
    },
    axis: {
      y: {
        title: '($)',
        labelFormatter: formatNumber,
      }
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
  }), [yearlyAirlineMetrics]);

  const revExpChartConfig = useMemo(() => ({
    data: revExpData,
    xField: 'year',
    yField: 'value',
    seriesField: 'type',
    colorField:'type',
    axis: {
        y: {
          title: '($)',
          labelFormatter: formatNumber,
        }
      },
    stack: {
        groupBy: ['x', 'series'],
        series: false,
    },
    scale: { color: { range: ['#3C5488', '#4DBBD5'] } },
    height: 400,
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
  }), [revExpData]);

  const marginsChartConfig = useMemo(() => ({
    data: marginDualData,
    xField: 'year',
    yField: 'value',
    seriesField: 'metric',
    colorField:'metric',
    axis: {
        y: {
          title: '(%)',
          labelFormatter: formatNumber,
        }
      },
    scale: {
        color: {
          palette: ['#41b6c4', '#225ea8'],
        },
    },
    tooltip: {items: [{ channel: 'y', valueFormatter: '.2f'}] },
    height: 400,
    style: {
        shape: 'smooth',
        lineWidth: 2,
    },
  }), [marginDualData]);

  const ratioChartConfig = useMemo(() => ({
    data: ratioDualData,
    xField: 'year',
    yField: 'value',
    seriesField: 'metric',
    colorField:'metric',
    axis: {
        y: {
          title: 'Ratio',
          labelFormatter: formatNumber,
        }
      },
    scale: { color: { palette: 'Set2' } },
    tooltip: {items: [{ channel: 'y', valueFormatter: '.2f'}] },
    height: 400,
    style: {
        shape: 'smooth',
        lineWidth: 2,
    },
  }), [ratioDualData]);

  const roaRoeChartConfig = useMemo(() => ({
    data: returnDualData,
    xField: 'year',
    yField: 'value',
    seriesField: 'metric',
    colorField:'metric',
    axis: {
        y: {
          title: 'Return (%)',
          labelFormatter: formatNumber,
        }
      },
    scale: { color: { palette: 'Set2' } },
    tooltip: {items: [{ channel: 'y', valueFormatter: '.2f'}] },
    height: 400,
    style: {
        shape: 'smooth',
        lineWidth: 2,
    },
  }), [returnDualData]);

  const assetsPieChartConfig = useMemo(() => ({
    data: assetsData,
    angleField: 'value',
    colorField: 'category',
    radius:0.9,
    scale: { color: { palette: 'Set2' } },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
    height:400,

  }), [assetsData]);

  const liabPieChartConfig = useMemo(() => ({
    data: liabData,
    angleField: 'value',
    colorField: 'category',
    radius:0.9,
    scale: { color: { palette: 'Set2' } },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
    height:400,
  }), [liabData]);

  const equityPieChartConfig = useMemo(() => ({
    data: equityData,
    angleField: 'value',
    colorField: 'category',
    radius:0.9,
    scale: { color: { palette: 'Set2' } },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
    height:400,
  }), [equityData]);

  const assetsLiabChartConfig = useMemo(() => ({
    data: assetsLiabData,
    xField: 'year',
    yField: 'value',
    seriesField: 'type',
    tooltip:{ formatter: (item) => ({ name: item.type, value: formatNumber(item.value) }) },
    yAxis:{ title:'Amount ($)', labelFormatter: formatNumber },
    height:300,
  }), [assetsLiabData]);

  const opProfitLossChartConfig = useMemo(() => ({
    data: opProfitLossData,
    xField:'year',
    yField:'value',
    yAxis:{ title:'Op Profit/Loss ($)', labelFormatter: formatNumber },
    tooltip:{ formatter: (item) => ({ name:'Operating Profit/Loss', value: formatNumber(item.value) }) },
    height:300,
    smooth:true,
    point:{ size:4 },
  }), [opProfitLossData]);

  const tabItems = [
    {
      key: '1',
      label: 'Income & Profitability',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h4>Net Income</h4>
            <Line {...netIncomeChartConfig} />
          </div>
          <div>
            <h4>Operating Revenues vs Operating Expenses</h4>
            <Column {...revExpChartConfig} />
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Margins & Ratios',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h4>Operating & Net Profit Margins (%)</h4>
            <Line {...marginsChartConfig} />
          </div>
          <div>
            <h4>Current Ratio & Debt-to-Equity</h4>
            <Line {...ratioChartConfig} />
          </div>
          <div>
            <h4>ROA & ROE (%)</h4>
            <Line {...roaRoeChartConfig} />
          </div>
        </div>
      ),
    },
    {
        key: '3',
        label: 'Balance Sheet Composition',
        children: (
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'space-between' }}>
            <div style={{ flex: '1' }}>
              <h4>Assets Composition</h4>
              <Pie {...assetsPieChartConfig} />
            </div>
      
            <div style={{ flex: '1' }}>
              <h4>Liabilities Composition</h4>
              <Pie {...liabPieChartConfig} />
            </div>
      
            <div style={{ flex: '1' }}>
              <h4>Equity Composition</h4>
              <Pie {...equityPieChartConfig} />
            </div>
          </div>
        ),
      },      
    {
      key: '4',
      label: 'Assets vs Liab+Equity / Operating Profit/Loss',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h4>Assets vs Liabilities+Equity Over Time</h4>
            <Column {...assetsLiabChartConfig} />
          </div>
          <div>
            <h4>Operating Profit/Loss Over Time</h4>
            <Line {...opProfitLossChartConfig} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card className="custom-card" title="Financial Health" style={{ marginTop: '24px' }}>
      <Tabs
        defaultActiveKey="1"
        style={{ marginTop: '-16px' }}
        destroyInactiveTabPane={true}
        items={tabItems}
      />
    </Card>
  );
};

export default React.memo(FinancialBalanceSheetCharts);
