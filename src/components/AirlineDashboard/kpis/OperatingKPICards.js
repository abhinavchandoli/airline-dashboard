import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import useOperatingKPIs from '../../../hooks/useOperatingKPIs';
import { formatNumber } from '../../../utils/formatNumber';

const OperatingKPICards = ({ operatingKPIs }) => {
  return (
    <>
      <div style={{ marginTop: '24px' }}>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Aircraft Operating Expenses" value={formatNumber(operatingKPIs.totalAirOpExpenses)} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Flying Operating Expenses" value={formatNumber(operatingKPIs.totalFlyOpExpenses)} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Fuel & Oil Expense" value={formatNumber(operatingKPIs.totalFuelOilExpense)} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Flight Maintenance Expense" value={formatNumber(operatingKPIs.totalFlightMaintenanceExpense)} prefix="$" />
            </Card>
          </Col>
        </Row>
      </div>
      <div style={{ marginTop: '24px' }}>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Operating Fleet" value={operatingKPIs.operatingFleet.toFixed(0)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Airborne Hours" value={formatNumber(operatingKPIs.airborneHours)} suffix="hours" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Aircraft Fuel (Gallons)" value={formatNumber(operatingKPIs.aircraftFuelGallons)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Departures per Aircraft" value={operatingKPIs.departuresPerAircraft.toFixed(2)} />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default React.memo(OperatingKPICards);
