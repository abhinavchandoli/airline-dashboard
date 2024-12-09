import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Select, Typography } from 'antd';
import { formatNumber } from '../../../utils/formatNumber';
import { DualAxes, Line, Column } from '@ant-design/plots';

const { Option } = Select;
const { Title } = Typography;

const FinancialBalanceSheetTab = ({ airlineData, balanceSheets, operatingData, operatingDataExtended, stockData }) => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedQuarter, setSelectedQuarter] = useState('All');

  const getAvailableYears = () => {
    const yearsSet = new Set([...airlineData.map(d => d.YEAR), ...balanceSheets.map(d => d.YEAR)]);
    return Array.from(yearsSet).filter(Boolean).sort((a, b) => a - b);
  };

  const getAvailableQuarters = () => [1, 2, 3, 4];

  const filterByYearQuarter = (data) => {
    return data.filter(item => {
      const yearMatch = selectedYear === 'All' || item.YEAR === Number(selectedYear);
      const quarterMatch = selectedQuarter === 'All' || item.QUARTER === Number(selectedQuarter);
      return yearMatch && quarterMatch;
    });
  };

  const filteredAirlineData = useMemo(() => filterByYearQuarter(airlineData), [airlineData, selectedYear, selectedQuarter]);
  const filteredBalanceSheets = useMemo(() => filterByYearQuarter(balanceSheets), [balanceSheets, selectedYear, selectedQuarter]);
  const filteredOperatingData = useMemo(() => filterByYearQuarter(operatingData), [operatingData, selectedYear, selectedQuarter]);
  const filteredOperatingDataExtended = useMemo(() => filterByYearQuarter(operatingDataExtended), [operatingDataExtended, selectedYear, selectedQuarter]);
  const filteredStockData = useMemo(() => filterByYearQuarter(stockData), [stockData, selectedYear, selectedQuarter]);

  // Helper functions to aggregate or transform data over time
  const aggregateByYearQuarter = (data, fields) => {
    // Combine YEAR and QUARTER to create a period label, e.g. "2020 Q1"
    // If QUARTER not relevant or "All" selected, we can just use Year.
    return data.map(d => {
      const period = selectedQuarter === 'All' ? d.YEAR.toString() : `${d.YEAR} Q${d.QUARTER}`;
      const entry = { period };
      fields.forEach(f => entry[f] = d[f] !== undefined && d[f] !== null ? d[f] : 0);
      return entry;
    });
  };

  // Compute Financial Ratios Over Time
  const mergedData = (() => {
    // We need a structure keyed by (YEAR, QUARTER) to merge airlineData & balanceSheets
    const keyFunc = (d) => (selectedQuarter === 'All') ? d.YEAR : `${d.YEAR}-${d.QUARTER}`;
    const map = new Map();

    filteredAirlineData.forEach(d => {
      map.set(keyFunc(d), { ...d });
    });

    filteredBalanceSheets.forEach(d => {
      const key = keyFunc(d);
      const existing = map.get(key) || {};
      map.set(key, { ...existing, ...d });
    });

    return Array.from(map.values()).sort((a, b) => {
      // Sort by YEAR, then QUARTER
      if (a.YEAR !== b.YEAR) return a.YEAR - b.YEAR;
      if (a.QUARTER && b.QUARTER) return a.QUARTER - b.QUARTER;
      return 0;
    });
  })();

  // Ratios: Operating Margin, Net Profit Margin, Current Ratio, Debt-to-Equity, ROA, ROE
  const ratioData = mergedData.map(d => {
    const period = selectedQuarter === 'All' ? d.YEAR.toString() : `${d.YEAR} Q${d.QUARTER}`;
    const opRevenues = d.OP_REVENUES || 0;
    const netIncome = d.NET_INCOME || 0;
    const opProfit = d.OP_PROFIT_LOSS || 0;
    const curAssets = d.CURR_ASSETS || 0;
    const curLiab = d.CURR_LIABILITIES || 0;
    const liabEquity = d.LIAB_SH_HLD_EQUITY || 0;
    const shEquity = d.SH_HLD_EQUIT_NET || 0;
    const assets = d.ASSETS || 0;

    const operatingMargin = opRevenues !== 0 ? (opProfit / opRevenues) * 100 : null;
    const netProfitMargin = opRevenues !== 0 ? (netIncome / opRevenues) * 100 : null;
    const currentRatio = (curLiab !== 0) ? curAssets / curLiab : null;
    const debtToEquity = (shEquity !== 0) ? ((liabEquity - shEquity) / shEquity) : null;
    const roa = (assets !== 0) ? (netIncome / assets) * 100 : null;
    const roe = (shEquity !== 0) ? (netIncome / shEquity) * 100 : null;

    return {
      period,
      opRevenues,
      netIncome,
      opProfit,
      operatingMargin,
      netProfitMargin,
      currentRatio,
      debtToEquity,
      roa,
      roe,
      assets,
      curAssets,
      curLiab,
      liabEquity,
      shEquity
    };
  });

  // Chart 1: Revenue vs Net Income (DualAxes)
  const revenueNetIncomeConfig = {
    data: [ratioData, ratioData],
    xField: 'period',
    yField: ['opRevenues', 'netIncome'],
    geometryOptions: [
      {
        geometry: 'line',
        color: '#3C5488',
        lineStyle: { lineWidth: 2 },
      },
      {
        geometry: 'line',
        color: '#E64B35',
        lineStyle: { lineWidth: 2 },
      },
    ],
    tooltip: {
      formatter: (datum) => {
        return { name: datum.seriesField === 'opRevenues' ? 'Operating Revenues' : 'Net Income', value: formatNumber(datum.value) };
      }
    },
    yAxis: {
      opRevenues: { label: { formatter: formatNumber }, title: { text: 'Operating Revenues ($)' } },
      netIncome: { label: { formatter: formatNumber }, title: { text: 'Net Income ($)' } },
    },
    legend: {
      custom: true,
      items: [
        { name: 'Operating Revenues', marker: { style: { fill: '#3C5488' } } },
        { name: 'Net Income', marker: { style: { fill: '#E64B35' } } },
      ],
    },
    height: 300,
  };

  // Function to create a simple line chart config
  const createLineConfig = (data, field, color, title) => ({
    data: data.map(d => ({ period: d.period, value: d[field] })),
    xField: 'period',
    yField: 'value',
    smooth: true,
    color: color,
    yAxis: {
      title: { text: title },
      label: { formatter: (v) => field.includes('Margin') || field === 'roa' || field === 'roe' ? `${v}%` : formatNumber(v) }
    },
    tooltip: {
      formatter: (datum) => {
        if (field.includes('Margin') || field === 'roa' || field === 'roe') {
          return { name: title, value: `${datum.value.toFixed(2)}%` };
        } else {
          return { name: title, value: datum.value ? formatNumber(datum.value) : 'N/A' };
        }
      }
    },
    height: 300,
  });

  // Chart 2: Operating Margin
  const operatingMarginConfig = createLineConfig(ratioData.filter(d => d.operatingMargin !== null), 'operatingMargin', '#4DBBD5', 'Operating Margin (%)');

  // Chart 3: Net Profit Margin
  const netProfitMarginConfig = createLineConfig(ratioData.filter(d => d.netProfitMargin !== null), 'netProfitMargin', '#00A087', 'Net Profit Margin (%)');

  // Chart 4: Current Ratio
  const currentRatioConfig = createLineConfig(ratioData.filter(d => d.currentRatio !== null), 'currentRatio', '#8B7CB3', 'Current Ratio');

  // Chart 5: Debt-to-Equity Ratio
  const debtToEquityConfig = createLineConfig(ratioData.filter(d => d.debtToEquity !== null), 'debtToEquity', '#E64B35', 'Debt-to-Equity Ratio');

  // Chart 6: Return on Assets (ROA)
  const roaConfig = createLineConfig(ratioData.filter(d => d.roa !== null), 'roa', '#3C5488', 'Return on Assets (%)');

  // Chart 7: Return on Equity (ROE)
  const roeConfig = createLineConfig(ratioData.filter(d => d.roe !== null), 'roe', '#F39B7F', 'Return on Equity (%)');

  // Chart 8: Asset Composition (Stacked Column)
  // We'll pick some major asset categories to stack: CURR_ASSETS, INVEST_SPEC_FUNDS, PROP_EQUIP_NET
  const assetCompositionData = filteredBalanceSheets.map(d => {
    const period = selectedQuarter === 'All' ? d.YEAR.toString() : `${d.YEAR} Q${d.QUARTER}`;
    return {
      period,
      'Current Assets': d.CURR_ASSETS || 0,
      'Prop & Equip Net': d.PROP_EQUIP_NET || 0,
      'Special Funds': d.INVEST_SPEC_FUNDS || 0,
    };
  });
  const assetStackData = [];
  assetCompositionData.forEach(d => {
    Object.keys(d).forEach(k => {
      if (k !== 'period') {
        assetStackData.push({ period: d.period, type: k, value: d[k] });
      }
    });
  });
  const assetStackConfig = {
    data: assetStackData,
    isStack: true,
    xField: 'period',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      label: { formatter: formatNumber },
      title: { text: 'Value ($)' },
    },
    legend: { position: 'top' },
    height: 300,
    tooltip: { formatter: datum => ({ name: datum.type, value: formatNumber(datum.value) }) }
  };

  // Chart 9: Liability Composition (Stacked Column)
  // We'll pick CURR_LIABILITIES, LONG_TERM_DEBT, NON_REC_LIAB from balance sheets
  const liabilityData = filteredBalanceSheets.map(d => {
    const period = selectedQuarter === 'All' ? d.YEAR.toString() : `${d.YEAR} Q${d.QUARTER}`;
    return {
      period,
      'Current Liabilities': d.CURR_LIABILITIES || 0,
      'Long Term Debt': d.LONG_TERM_DEBT || 0,
      'Non-Rec Liab': d.NON_REC_LIAB || 0,
    };
  });
  const liabilityStackData = [];
  liabilityData.forEach(d => {
    Object.keys(d).forEach(k => {
      if (k !== 'period') {
        liabilityStackData.push({ period: d.period, type: k, value: d[k] });
      }
    });
  });
  const liabilityStackConfig = {
    data: liabilityStackData,
    isStack: true,
    xField: 'period',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      label: { formatter: formatNumber },
      title: { text: 'Value ($)' },
    },
    legend: { position: 'top' },
    height: 300,
    tooltip: { formatter: datum => ({ name: datum.type, value: formatNumber(datum.value) }) }
  };

  // Chart 10: Operating Expenses (Salaries, Materials, Services) vs Revenue
  // From operatingDataExtended: SALARIES_BENEFITS, MATERIALS_TOTAL, SERVICES_TOTAL
  // We'll show OP_REVENUES (line) on one axis and these three as stacked columns
  const opExtData = filteredOperatingDataExtended.map(d => {
    const period = selectedQuarter === 'All' ? d.YEAR.toString() : `${d.YEAR} Q${d.QUARTER}`;
    return {
      period,
      Salaries: d.SALARIES_BENEFITS || 0,
      Materials: d.MATERIALS_TOTAL || 0,
      Services: d.SERVICES_TOTAL || 0,
    };
  });

  const revByPeriod = {};
  filteredAirlineData.forEach(d => {
    const period = selectedQuarter === 'All' ? d.YEAR.toString() : `${d.YEAR} Q${d.QUARTER}`;
    revByPeriod[period] = d.OP_REVENUES || 0;
  });

  const expensesStackData = [];
  opExtData.forEach(d => {
    const opRevenue = revByPeriod[d.period] || 0;
    Object.entries(d).forEach(([key, val]) => {
      if (key !== 'period') {
        expensesStackData.push({ period: d.period, type: key, value: val, revenue: opRevenue });
      }
    });
  });

  const expensesVsRevenueConfig = {
    data: [expensesStackData, expensesStackData],
    xField: 'period',
    yField: ['value', 'revenue'],
    geometryOptions: [
      {
        geometry: 'interval',
        isStack: true,
        seriesField: 'type',
        label: false,
      },
      {
        geometry: 'line',
        color: '#000',
        lineStyle: { lineWidth: 2 },
        label: false,
      },
    ],
    yAxis: {
      value: {
        title: { text: 'Expenses ($)' },
        label: { formatter: formatNumber },
      },
      revenue: {
        title: { text: 'Operating Revenue ($)' },
        label: { formatter: formatNumber },
      },
    },
    tooltip: { shared: true },
    height: 300,
  };

  // Chart 11: Stock Price vs Net Income
  // Merge stockData with ratioData by year (approx). We'll match by year only for simplicity.
  const stockMerged = [];
  // Create a map of netIncome by period
  const netIncomeMap = {};
  ratioData.forEach(d => { netIncomeMap[d.period] = d.netIncome; });

  filteredStockData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
  // Approximate period from date: we might just use year or nearest quarter
  filteredStockData.forEach(d => {
    const date = new Date(d.Date);
    const yr = date.getFullYear();
    // We try to find a ratioData entry with that year (and quarter if selected)
    // If quarter is all, just year:
    const possiblePeriod = selectedQuarter === 'All' ? yr.toString() : `${yr} Q1`; 
    // Just use year if "All"
    const ni = netIncomeMap[possiblePeriod] || 0;
    stockMerged.push({
      period: possiblePeriod,
      adjClose: d['Adj Close'] || 0,
      netIncome: ni,
    });
  });

  // Deduplicate periods in stockMerged by averaging if needed
  const stockFinalMap = {};
  stockMerged.forEach(d => {
    if (!stockFinalMap[d.period]) {
      stockFinalMap[d.period] = { period: d.period, adjCloseSum: d.adjClose, count: 1, netIncome: d.netIncome };
    } else {
      stockFinalMap[d.period].adjCloseSum += d.adjClose;
      stockFinalMap[d.period].count += 1;
    }
  });

  const stockFinalData = Object.values(stockFinalMap).map(d => ({
    period: d.period,
    adjClose: d.adjCloseSum / d.count,
    netIncome: d.netIncome,
  })).sort((a, b) => a.period.localeCompare(b.period));

  const stockVsIncomeConfig = {
    data: [stockFinalData, stockFinalData],
    xField: 'period',
    yField: ['adjClose', 'netIncome'],
    geometryOptions: [
      {
        geometry: 'line',
        color: '#4DBBD5',
        lineStyle: { lineWidth: 2 },
      },
      {
        geometry: 'line',
        color: '#E64B35',
        lineStyle: { lineWidth: 2, lineDash: [4,4] },
      },
    ],
    yAxis: {
      adjClose: { title: { text: 'Stock Price ($)' }, label: { formatter: formatNumber } },
      netIncome: { title: { text: 'Net Income ($)' }, label: { formatter: formatNumber } },
    },
    legend: {
      custom: true,
      items: [
        { name: 'Stock Price', marker: { style: { fill: '#4DBBD5' } } },
        { name: 'Net Income', marker: { style: { fill: '#E64B35' } } },
      ],
    },
    height: 300,
    tooltip: { shared: true },
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Filters */}
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

      {/* Charts */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card className="custom-card" size="small">
            <Title level={5}>Operating Revenues vs Net Income</Title>
            <DualAxes {...revenueNetIncomeConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Operating Margin Over Time</Title>
            <Line {...operatingMarginConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Net Profit Margin Over Time</Title>
            <Line {...netProfitMarginConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Current Ratio Over Time</Title>
            <Line {...currentRatioConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Debt-to-Equity Ratio Over Time</Title>
            <Line {...debtToEquityConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Return on Assets (ROA) Over Time</Title>
            <Line {...roaConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Return on Equity (ROE) Over Time</Title>
            <Line {...roeConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Asset Composition Over Time</Title>
            <Column {...assetStackConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Liability Composition Over Time</Title>
            <Column {...liabilityStackConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Operating Expenses (Salaries, Materials, Services) vs Revenue</Title>
            <DualAxes {...expensesVsRevenueConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card className="custom-card" size="small">
            <Title level={5}>Stock Price vs Net Income Over Time</Title>
            <DualAxes {...stockVsIncomeConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(FinancialBalanceSheetTab);
