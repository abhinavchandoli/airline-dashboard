import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { formatNumber } from '../../../utils/formatNumber';
import FinancialBalanceSheetCharts from '../charts/FinancialBalanceSheetCharts';

const FinancialBalanceSheetTab = ({ airlineData, balanceSheets }) => {
  // Aggregate KPIs over all data (no filters)
  const totalOpRevenues = airlineData.reduce((sum, row) => sum + (row.OP_REVENUES || 0), 0);
  const totalNetIncome = airlineData.reduce((sum, row) => sum + (row.NET_INCOME || 0), 0);
  const totalOpProfitLoss = airlineData.reduce((sum, row) => sum + (row.OP_PROFIT_LOSS || 0), 0);

  const bsRecord = balanceSheets[balanceSheets.length - 1];
  
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

  return (
    <div style={{ marginTop: '20px' }}>
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

      <Row gutter={24} style={{ marginBottom: '24px' }}>
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

      {/* Tabbed charts */}
      <FinancialBalanceSheetCharts airlineData={airlineData} balanceSheets={balanceSheets} />
    </div>
  );
};

export default React.memo(FinancialBalanceSheetTab);
