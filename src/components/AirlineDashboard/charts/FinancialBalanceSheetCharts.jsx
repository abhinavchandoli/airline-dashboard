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
    revExpData.push({ year: d.year, metric: 'Operating Revenues', value: d.totalOpRevenues });
    revExpData.push({ year: d.year, metric: 'Operating Expenses', value: d.totalOpExpenses });
  });

  // Tabs configuration using items
  const tabItems = [
    {
      key: '1',
      label: 'Income & Profitability',
      children: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3>Net Income Over Time</h3>
            <Line
              data={yearlyAirlineMetrics}
              xField="year"
              yField="totalNetIncome"
              height={300}
              yAxis={{ title: { text: 'Net Income ($)' }, label: { formatter: formatNumber } }}
              tooltip={{ formatter: (item) => ({ name: 'Net Income', value: formatNumber(item.totalNetIncome) })}}
              smooth
              point={{ size:4 }}
            />
          </div>
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
      ),
    },
    {
      key: '2',
      label: 'Margins & Ratios',
      children: (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h3>Operating & Net Profit Margins (%)</h3>
              <Line
                data={marginDualData}
                xField="year"
                yField="value"
                seriesField="metric"
                yAxis={{ title: { text: 'Margin (%)' } }}
                tooltip={{ formatter: (item) => ({ name: item.metric, value: item.value.toFixed(2) + '%' }) }}
                height={300}
                smooth
                point={{ size:4 }}
              />
            </div>
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
                smooth
                point={{ size:4 }}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h3>ROA & ROE (%)</h3>
            <Line
              data={returnDualData}
              xField="year"
              yField="value"
              seriesField="metric"
              tooltip={{ formatter: (item) => ({ name: item.metric, value: item.value.toFixed(2) + '%' }) }}
              yAxis={{ title: { text: 'Return (%)' } }}
              height={300}
              smooth
              point={{ size:4 }}
            />
          </div>
        </>
      ),
    },
    {
      key: '3',
      label: 'Balance Sheet Composition',
      children: (
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'space-between' }}>
          <div style={{ flex: '1' }}>
            <h3>Assets Composition</h3>
            <Pie
              data={assetsData}
              angleField="value"
              colorField="category"
              radius={0.9}
              label={{ type: 'outer', formatter: (item) => `${item.category}: ${formatNumber(item.value)}` }}
              tooltip={{ formatter: (item) => ({ name: item.category, value: formatNumber(item.value) })}}
              height={300}
              interactions={[{ type: 'element-active' }]}
            />
          </div>

          <div style={{ flex: '1' }}>
            <h3>Liabilities Composition</h3>
            <Pie
              data={liabData}
              angleField="value"
              colorField="category"
              radius={0.9}
              label={{ type: 'outer', formatter: (item) => `${item.category}: ${formatNumber(item.value)}` }}
              tooltip={{ formatter: (item) => ({ name: item.category, value: formatNumber(item.value) })}}
              height={300}
              interactions={[{ type: 'element-active' }]}
            />
          </div>

          <div style={{ flex: '1' }}>
            <h3>Equity Composition</h3>
            <Pie
              data={equityData}
              angleField="value"
              colorField="category"
              radius={0.9}
              label={{ type: 'outer', formatter: (item) => `${item.category}: ${formatNumber(item.value)}` }}
              tooltip={{ formatter: (item) => ({ name: item.category, value: formatNumber(item.value) })}}
              height={300}
              interactions={[{ type: 'element-active' }]}
            />
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: 'Assets vs Liab+Equity / Operating Profit/Loss',
      children: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
          <div>
            <h3>Operating Profit/Loss Over Time</h3>
            <Line
              data={yearlyAirlineMetrics.map(d => ({
                year: d.year,
                value: d.totalOpRevenues - d.totalOpExpenses
              }))}
              xField="year"
              yField="value"
              yAxis={{ title: { text: 'Op Profit/Loss ($)' }, label: { formatter: formatNumber } }}
              tooltip={{ formatter: (item) => ({ name: 'Operating Profit/Loss', value: formatNumber(item.value) }) }}
              height={300}
              smooth
              point={{ size:4 }}
            />
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
