import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import OperatingFilters from '../filters/OperatingFilters';
import OperatingKPICards from '../kpis/OperatingKPICards';
import useOperatingKPIs from '../../../hooks/useOperatingKPIs';
import OperatingExpensesCharts from '../charts/OperatingExpensesCharts';
import FuelStatistics from '../../FuelStatistics/FuelStatistics';
import '../../AirlineDashboard.css';

const OperatingStatisticsTab = ({ operatingData, operatingDataExtended }) => {
  const [operatingSelectedYear, setOperatingSelectedYear] = useState('All');
  const [operatingSelectedCategory, setOperatingSelectedCategory] = useState('All');

  const operatingKPIs = useOperatingKPIs(operatingData, operatingSelectedYear, operatingSelectedCategory);

  const innerTabItems = OperatingExpensesCharts.getInnerTabItems(operatingData, operatingSelectedCategory);

  return (
    <>
      <OperatingFilters
        operatingSelectedYear={operatingSelectedYear}
        setOperatingSelectedYear={setOperatingSelectedYear}
        operatingSelectedCategory={operatingSelectedCategory}
        setOperatingSelectedCategory={setOperatingSelectedCategory}
        operatingData={operatingData}
      />

      <OperatingKPICards operatingKPIs={operatingKPIs} />

      <Card className="custom-card" style={{ marginTop: '24px' }}>
        <div style={{ minHeight: '400px' }}>
          <Tabs defaultActiveKey="1" style={{ marginTop: '-16px' }} destroyInactiveTabPane items={innerTabItems} />
        </div>
      </Card>

      <FuelStatistics
        operatingData={operatingData}
        operatingDataExtended={operatingDataExtended}
        operatingSelectedCategory={operatingSelectedCategory}
      />
    </>
  );
};

export default React.memo(OperatingStatisticsTab);
