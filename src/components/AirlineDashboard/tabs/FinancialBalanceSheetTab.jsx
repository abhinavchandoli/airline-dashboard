// FinancialBalanceSheetTab.jsx

import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Select } from 'antd';
import { formatNumber } from '../../../utils/formatNumber';
import FinancialBalanceSheetCharts from '../charts/FinancialBalanceSheetCharts';
import { pearsonCorrelation } from '../../../utils/statistics';
import { Heatmap } from '@ant-design/plots';

const { Option } = Select;

const FinancialBalanceSheetTab = ({ airlineData, balanceSheets, stockData, operatingData }) => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedQuarter, setSelectedQuarter] = useState('All');

  // Filter data for KPIs and charts based on airlineData and balanceSheets
  const filteredAirlineData = useMemo(() => {
    return airlineData.filter(item => {
      const yearMatch = selectedYear === 'All' || item.YEAR === Number(selectedYear);
      const quarterMatch = selectedQuarter === 'All' || item.QUARTER === Number(selectedQuarter);
      return yearMatch && quarterMatch;
    });
  }, [airlineData, selectedYear, selectedQuarter]);

  const filteredBalanceSheets = useMemo(() => {
    return balanceSheets.filter(item => {
      const yearMatch = selectedYear === 'All' || item.YEAR === Number(selectedYear);
      const quarterMatch = selectedQuarter === 'All' || item.QUARTER === Number(selectedQuarter);
      return yearMatch && quarterMatch;
    });
  }, [balanceSheets, selectedYear, selectedQuarter]);

  const totalOpRevenues = filteredAirlineData.reduce((sum, row) => sum + (row.OP_REVENUES || 0), 0);
  const totalNetIncome = filteredAirlineData.reduce((sum, row) => sum + (row.NET_INCOME || 0), 0);
  const totalOpProfitLoss = filteredAirlineData.reduce((sum, row) => sum + (row.OP_PROFIT_LOSS || 0), 0);

  const bsRecord = filteredBalanceSheets[filteredBalanceSheets.length - 1];

  const CURR_ASSETS = bsRecord?.CURR_ASSETS ?? null;
  const CURR_LIABILITIES = bsRecord?.CURR_LIABILITIES ?? null;
  const ASSETS = bsRecord?.ASSETS ?? null;
  const LIAB_SH_HLD_EQUITY = bsRecord?.LIAB_SH_HLD_EQUITY ?? null;
  const SH_HLD_EQUIT_NET = bsRecord?.SH_HLD_EQUIT_NET ?? null;

  const operatingMargin = (totalOpRevenues !== 0) ? (totalOpProfitLoss / totalOpRevenues) * 100 : 'N/A';
  const netProfitMargin = (totalOpRevenues !== 0) ? (totalNetIncome / totalOpRevenues) * 100 : 'N/A';
  const currentRatio = (CURR_LIABILITIES && CURR_LIABILITIES !== 0 && CURR_ASSETS) ? (CURR_ASSETS / CURR_LIABILITIES) : 'N/A';

  let debtToEquity = 'N/A';
  if (LIAB_SH_HLD_EQUITY && SH_HLD_EQUIT_NET && SH_HLD_EQUIT_NET !== 0) {
    debtToEquity = ((LIAB_SH_HLD_EQUITY - SH_HLD_EQUIT_NET) / SH_HLD_EQUIT_NET);
  }

  let roa = 'N/A';
  if (totalNetIncome && ASSETS && ASSETS !== 0) {
    roa = (totalNetIncome / ASSETS) * 100;
  }

  let roe = 'N/A';
  if (totalNetIncome && SH_HLD_EQUIT_NET && SH_HLD_EQUIT_NET !== 0) {
    roe = (totalNetIncome / SH_HLD_EQUIT_NET) * 100;
  }

  // -----------------------------
  // Correlation Section (Unfiltered by year/quarter)
  // -----------------------------
  const yearlyStockData = useMemo(() => {
    if (!stockData || stockData.length === 0) return [];

    const sorted = stockData.map(d => ({...d, Date: new Date(d.Date)})).sort((a,b) => a.Date - b.Date);
    const groupedByYear = {};

    sorted.forEach(d => {
      const y = d.Date.getFullYear().toString();
      if (!groupedByYear[y]) {
        groupedByYear[y] = [];
      }
      groupedByYear[y].push(d['Adj Close']);
    });

    return Object.keys(groupedByYear).map(year => {
      const prices = groupedByYear[year].map(Number).filter(Boolean);
      const avgPrice = prices.length > 0 ? prices.reduce((acc, val) => acc+val, 0)/prices.length : null;
      return { YEAR: year, stockPrice: avgPrice };
    });
  }, [stockData]);

  // Aggregate metrics from airlineData
  const yearlyAirlineMetrics = useMemo(() => {
    const groupedByYear = {};

    airlineData.forEach(d => {
      const y = d.YEAR ? d.YEAR.toString() : null;
      if (!y) return;

      if (!groupedByYear[y]) {
        groupedByYear[y] = {
          ASM: 0, RPM: 0, LOAD_FACTOR_SUM: 0, LOAD_FACTOR_COUNT:0,
          YIELD_SUM:0, YIELD_COUNT:0,
          CASM_SUM:0, CASM_COUNT:0,
          RASM_SUM:0, RASM_COUNT:0,
          PRASM_SUM:0, PRASM_COUNT:0,
          OP_REVENUES:0, OP_EXPENSES:0,
          TRANS_REV_PAX:0
        };
      }

      groupedByYear[y].ASM += (d.ASM || 0);
      groupedByYear[y].RPM += (d.RPM || 0);

      if (d.LOAD_FACTOR != null) {
        groupedByYear[y].LOAD_FACTOR_SUM += d.LOAD_FACTOR;
        groupedByYear[y].LOAD_FACTOR_COUNT += 1;
      }

      if (d.YIELD != null) {
        groupedByYear[y].YIELD_SUM += d.YIELD;
        groupedByYear[y].YIELD_COUNT += 1;
      }

      if (d.CASM != null) {
        groupedByYear[y].CASM_SUM += d.CASM;
        groupedByYear[y].CASM_COUNT += 1;
      }

      if (d.RASM != null) {
        groupedByYear[y].RASM_SUM += d.RASM;
        groupedByYear[y].RASM_COUNT += 1;
      }

      if (d.PRASM != null) {
        groupedByYear[y].PRASM_SUM += d.PRASM;
        groupedByYear[y].PRASM_COUNT += 1;
      }

      groupedByYear[y].OP_REVENUES += (d.OP_REVENUES || 0);
      groupedByYear[y].OP_EXPENSES += (d.OP_EXPENSES || 0);

      if (d.TRANS_REV_PAX != null) {
        groupedByYear[y].TRANS_REV_PAX += d.TRANS_REV_PAX;
      }
    });

    return Object.keys(groupedByYear).map(y => {
      const g = groupedByYear[y];
      const load_factor = g.LOAD_FACTOR_COUNT ? g.LOAD_FACTOR_SUM/g.LOAD_FACTOR_COUNT : null;
      const avg_yield = g.YIELD_COUNT ? g.YIELD_SUM/g.YIELD_COUNT : null;
      const avg_casm = g.CASM_COUNT ? g.CASM_SUM/g.CASM_COUNT : null;
      const avg_rasm = g.RASM_COUNT ? g.RASM_SUM/g.RASM_COUNT : null;
      const avg_prasm = g.PRASM_COUNT ? g.PRASM_SUM/g.PRASM_COUNT : null;

      return {
        YEAR: y,
        ASM: g.ASM || null,
        RPM: g.RPM || null,
        LOAD_FACTOR: load_factor,
        YIELD: avg_yield,
        CASM: avg_casm,
        RASM: avg_rasm,
        PRASM: avg_prasm,
        OP_REVENUES: g.OP_REVENUES || null,
        OP_EXPENSES: g.OP_EXPENSES || null,
        TRANS_REV_PAX: g.TRANS_REV_PAX || null
      };
    });
  }, [airlineData]);

  // Aggregate FUEL_FLY_OPS from operatingData by year
  const yearlyOpsData = useMemo(() => {
    const groupedByYear = {};

    operatingData.forEach(d => {
      const y = d.YEAR ? d.YEAR.toString() : null;
      if (!y) return;
      if (!groupedByYear[y]) {
        groupedByYear[y] = { FUEL_FLY_OPS: 0 };
      }
      groupedByYear[y].FUEL_FLY_OPS += (d.FUEL_FLY_OPS || 0);
    });

    return Object.keys(groupedByYear).map(y => ({
      YEAR: y,
      FUEL_FLY_OPS: groupedByYear[y].FUEL_FLY_OPS
    }));
  }, [operatingData]);

  // Merge airline metrics with ops data by YEAR
  const mergedMetrics = useMemo(() => {
    const opsMap = {};
    yearlyOpsData.forEach(o => { opsMap[o.YEAR] = o.FUEL_FLY_OPS; });

    return yearlyAirlineMetrics.map(m => ({
      ...m,
      FUEL_FLY_OPS: opsMap[m.YEAR] != null ? opsMap[m.YEAR] : null
    }));
  }, [yearlyAirlineMetrics, yearlyOpsData]);

  // Now merge with stock data by YEAR
  const mergedData = useMemo(() => {
    const stockMap = {};
    yearlyStockData.forEach(s => { stockMap[s.YEAR] = s.stockPrice; });

    return mergedMetrics
      .map(m => ({
        YEAR: m.YEAR,
        stockPrice: stockMap[m.YEAR] || null,
        ASM: m.ASM,
        RPM: m.RPM,
        LOAD_FACTOR: m.LOAD_FACTOR,
        YIELD: m.YIELD,
        CASM: m.CASM,
        RASM: m.RASM,
        PRASM: m.PRASM,
        FUEL_FLY_OPS: m.FUEL_FLY_OPS,
        OP_REVENUES: m.OP_REVENUES,
        OP_EXPENSES: m.OP_EXPENSES,
        TRANS_REV_PAX: m.TRANS_REV_PAX
      }))
      .filter(d => d.stockPrice !== null);
  }, [yearlyStockData, mergedMetrics]);

  const correlationMetrics = [
    'ASM', 'RPM', 'LOAD_FACTOR', 'YIELD', 'CASM', 'RASM', 'PRASM',
    'FUEL_FLY_OPS', 'OP_REVENUES', 'OP_EXPENSES', 'TRANS_REV_PAX'
  ];

  const correlations = useMemo(() => {
    if (mergedData.length < 2) return [];

    const stockArray = mergedData.map(d => d.stockPrice);
    return correlationMetrics.map(metric => {
      const metricArray = mergedData.map(d => d[metric]);
      if (metricArray.some(v => v == null)) {
        return {metric, correlation: null};
      } else {
        const corr = pearsonCorrelation(stockArray, metricArray);
        return {metric, correlation: corr};
      }
    });
  }, [mergedData]);

  const heatmapData = correlations.map(c => ({
    x: 'Stock Price',
    y: c.metric,
    value: c.correlation === null ? 0 : c.correlation
  }));

  const heatmapConfig = {
    data: heatmapData,
    xField: 'x',
    yField: 'y',
    colorField: 'value',
    color: ['#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850'],
    meta: {
      value: {
        alias: 'Correlation',
        formatter: (v) => v === null ? 'N/A' : v.toFixed(2)
      }
    },
    tooltip: {
      customItems: (items) => {
        return items.map(item => ({
          name: 'Correlation',
          value: item.data.value === null ? 'N/A' : item.data.value.toFixed(2)
        }));
      }
    },
    legend: {
      position: 'bottom'
    },
    height: 400,
    xAxis: {
      title: { text: '' },
    },
    yAxis: {
      title: { text: '' },
    },
  };

  const getAvailableYears = () => {
    const yearsSet = new Set(airlineData.map(d => d.YEAR));
    balanceSheets.forEach(d => yearsSet.add(d.YEAR));
    return Array.from(yearsSet).filter(Boolean).sort((a, b) => a - b);
  };

  const getAvailableQuarters = () => {
    return [1, 2, 3, 4];
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Filters for KPIs and Charts (still functional for KPIs/charts only) */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col>
          <Select
            className="custom-card"
            style={{ width: 150 }}
            placeholder="Select Year"
            value={selectedYear}
            onChange={val => setSelectedYear(val)}
          >
            <Option value="All">All Years</Option>
            {getAvailableYears().map(year => (
              <Option key={year} value={year.toString()}>{year}</Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            className="custom-card"
            style={{ width: 150 }}
            placeholder="Select Quarter"
            value={selectedQuarter}
            onChange={val => setSelectedQuarter(val)}
          >
            <Option value="All">All Quarters</Option>
            {getAvailableQuarters().map(q => (
              <Option key={q} value={q.toString()}>{`Q${q}`}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row gutter={24} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="custom-card" size="small">
            <Statistic title="Total Operating Revenue" value={totalOpRevenues ? `$${formatNumber(totalOpRevenues)}` : 'N/A'} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="custom-card" size="small">
            <Statistic title="Net Income" value={totalNetIncome ? `$${formatNumber(totalNetIncome)}` : 'N/A'} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="custom-card" size="small">
            <Statistic
              title="Operating Margin"
              value={operatingMargin === 'N/A' ? 'N/A' : operatingMargin.toFixed(2) + '%'}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="custom-card" size="small">
            <Statistic
              title="Net Profit Margin"
              value={netProfitMargin === 'N/A' ? 'N/A' : netProfitMargin.toFixed(2) + '%'}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '24px' }}>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic
                title="Current Ratio"
                value={currentRatio === 'N/A' ? 'N/A' : currentRatio.toFixed(2)}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic
                title="Debt-to-Equity Ratio"
                value={debtToEquity === 'N/A' ? 'N/A' : debtToEquity.toFixed(2)}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic
                title="Return on Assets (ROA)"
                value={roa === 'N/A' ? 'N/A' : roa.toFixed(2) + '%'}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic
                title="Return on Equity (ROE)"
                value={roe === 'N/A' ? 'N/A' : roe.toFixed(2) + '%'}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Existing Charts */}
      <FinancialBalanceSheetCharts airlineData={filteredAirlineData} balanceSheets={filteredBalanceSheets} />

      {/* Correlation Section */}
      <div style={{ marginTop: '24px' }}>
        <Card className="custom-card" title="Correlation with Stock Price">
          {mergedData.length < 2 ? (
            <p>Not enough data points to compute correlation.</p>
          ) : (
            <Heatmap {...heatmapConfig} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default React.memo(FinancialBalanceSheetTab);
