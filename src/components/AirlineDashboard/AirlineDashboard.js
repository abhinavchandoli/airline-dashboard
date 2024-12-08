// AirlineDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Tabs, Spin } from 'antd';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useAirlineData from '../../hooks/useAirlineData';
import airlines from '../../data/airlines';

import TrafficCapacityRevenueTab from './tabs/TrafficCapacityRevenueTab';
import StockPerformanceTab from './tabs/StockPerformanceTab';
import OperatingStatisticsTab from './tabs/OperatingStatisticsTab';
import FinancialBalanceSheetTab from './tabs/FinancialBalanceSheetTab'; // import the new tab
import EnlargedChartModal from './EnlargedChartModal';


const AirlineDashboard = () => {
  const { airlineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab');

  const {
    loading,
    airlineData,
    operatingData,
    operatingDataExtended,
    stockData,
    allStockKPIs,
    stockKPIs,
    balanceSheets,
  } = useAirlineData(airlineId);

  const [activeTabKey, setActiveTabKey] = useState(initialTab === 'stock' ? '2' : '1');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expandedChart, setExpandedChart] = useState(null);

  const airlineInfo = airlines.find((a) => a.id === airlineId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [airlineId]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (activeTabKey === '1') {
      queryParams.delete('tab');
    } else if (activeTabKey === '2') {
      queryParams.set('tab', 'stock');
    }
    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString(),
      },
      { replace: true }
    );
  }, [activeTabKey, navigate, location.pathname, location.search]);

  const handleEnlargeClick = useCallback((chartKey) => {
    setExpandedChart(chartKey);
    setIsModalVisible(true);
  }, []);

  const tabItems = [
    {
      key: '1',
      label: 'Traffic, Capacity, and Revenue by Region',
      children: <TrafficCapacityRevenueTab airlineData={airlineData} handleEnlargeClick={handleEnlargeClick} />,
    },
    {
      key: '2',
      label: 'Stock Performance',
      children: <StockPerformanceTab airlineId={airlineId} airlineInfo={airlineInfo} stockData={stockData} allStockKPIs={allStockKPIs} stockKPIs={stockKPIs} navigate={navigate} />,
    },
    {
      key: '3',
      label: 'Operating Statistics/Expenses',
      children: <OperatingStatisticsTab operatingData={operatingData} operatingDataExtended={operatingDataExtended} />,
    },
    {
      key: '4',
      label: 'Financial & Balance Sheet',
      children: <FinancialBalanceSheetTab airlineData={airlineData} balanceSheets={balanceSheets} />,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PageContainer
      loading={loading}
      content={<img src={airlineInfo?.logo} alt={airlineInfo?.name} style={{ maxHeight: '65px', marginBottom: '10px' }} />}
    >
      <Tabs
        defaultActiveKey="1"
        activeKey={activeTabKey}
        onChange={(key) => setActiveTabKey(key)}
        destroyInactiveTabPane
        items={tabItems}
      />
      <EnlargedChartModal
        isModalVisible={isModalVisible}
        expandedChart={expandedChart}
        onClose={() => setIsModalVisible(false)}
        airlineData={airlineData}
      />
    </PageContainer>
  );
};

export default AirlineDashboard;
