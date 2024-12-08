import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Select } from 'antd';
import { formatNumber } from '../../../utils/formatNumber';

const { Option } = Select;

const FinancialBalanceSheetTab = ({ airlineData, balanceSheets }) => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedQuarter, setSelectedQuarter] = useState('All');

  const getAvailableYears = () => {
    const yearsSet = new Set(airlineData.map(d => d.YEAR));
    balanceSheets.forEach(d => yearsSet.add(d.YEAR));
    return Array.from(yearsSet).filter(Boolean).sort((a, b) => a - b);
  };

  const getAvailableQuarters = () => {
    // Quarters are typically 1-4
    return [1, 2, 3, 4];
  };

  const filteredAirlineData = useMemo(() => {
    return airlineData.filter(item => {
      const yearMatch = selectedYear === 'All' || item.YEAR === Number(selectedYear);
      const quarterMatch = selectedQuarter === 'All' || item.QUARTER === Number(selectedQuarter);
      return yearMatch && quarterMatch;
    });
  }, [airlineData, selectedYear, selectedQuarter]);

  const filteredBalanceSheets = useMemo(() => {
    const bs = balanceSheets.filter(item => {
      const yearMatch = selectedYear === 'All' || item.YEAR === Number(selectedYear);
      const quarterMatch = selectedQuarter === 'All' || item.QUARTER === Number(selectedQuarter);
      return yearMatch && quarterMatch;
    });
    return bs;
  }, [balanceSheets, selectedYear, selectedQuarter]);

  // Aggregate AirlineData metrics
  const totalOpRevenues = filteredAirlineData.reduce((sum, row) => sum + (row.OP_REVENUES || 0), 0);
  const totalNetIncome = filteredAirlineData.reduce((sum, row) => sum + (row.NET_INCOME || 0), 0);
  const totalOpProfitLoss = filteredAirlineData.reduce((sum, row) => sum + (row.OP_PROFIT_LOSS || 0), 0);

  // For Balance Sheet, take the first record if available
  const bsRecord = filteredBalanceSheets[0];
  
  // Extract needed values from Balance Sheet record
  const CURR_ASSETS = bsRecord?.CURR_ASSETS ?? null;
  const CURR_LIABILITIES = bsRecord?.CURR_LIABILITIES ?? null;
  const ASSETS = bsRecord?.ASSETS ?? null;
  const LIAB_SH_HLD_EQUITY = bsRecord?.LIAB_SH_HLD_EQUITY ?? null;
  const SH_HLD_EQUIT_NET = bsRecord?.SH_HLD_EQUIT_NET ?? null;

  // Compute KPIs
  const operatingMargin = (totalOpRevenues !== 0) ? (totalOpProfitLoss / totalOpRevenues) * 100 : 'N/A';
  const netProfitMargin = (totalOpRevenues !== 0) ? (totalNetIncome / totalOpRevenues) * 100 : 'N/A';
  const currentRatio = (CURR_LIABILITIES && CURR_LIABILITIES !== 0 && CURR_ASSETS) ? (CURR_ASSETS / CURR_LIABILITIES) : 'N/A';

  // Debt-to-Equity Ratio: (LIAB_SH_HLD_EQUITY - SH_HLD_EQUIT_NET) / SH_HLD_EQUIT_NET
  let debtToEquity = 'N/A';
  if (LIAB_SH_HLD_EQUITY && SH_HLD_EQUIT_NET && SH_HLD_EQUIT_NET !== 0) {
    debtToEquity = ( (LIAB_SH_HLD_EQUITY - SH_HLD_EQUIT_NET) / SH_HLD_EQUIT_NET );
  }

  // ROA = NET_INCOME / ASSETS
  let roa = 'N/A';
  if (totalNetIncome && ASSETS && ASSETS !== 0) {
    roa = (totalNetIncome / ASSETS) * 100;
  }

  // ROE = NET_INCOME / SH_HLD_EQUIT_NET
  let roe = 'N/A';
  if (totalNetIncome && SH_HLD_EQUIT_NET && SH_HLD_EQUIT_NET !== 0) {
    roe = (totalNetIncome / SH_HLD_EQUIT_NET) * 100;
  }

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

      {/* KPI Cards */}
      <Row gutter={24}>
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
    </div>
  );
};

export default React.memo(FinancialBalanceSheetTab);
