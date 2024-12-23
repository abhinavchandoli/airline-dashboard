import React from 'react';
import { Card, Statistic, Row, Col, Progress } from 'antd';
import { formatNumber } from '../../../utils/formatNumber';

const KPICards = ({ kpis }) => {
  return (
    <>
      <div style={{ marginTop: '24px' }}>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Total Departures" value={formatNumber(kpis.departures)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Total Distance Traveled" value={formatNumber(kpis.distance)} suffix=" miles" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Passengers Transported" value={formatNumber(kpis.passengers)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Average Load Factor" value={`${kpis.loadFactor}%`} />
              <Progress
                percent={parseFloat(kpis.loadFactor)}
                strokeColor={{
                  '0%': '#41b6c4',
                  '100%': '#225ea8',
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
      <div style={{ marginTop: '24px' }}>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Transport Revenues - Passenger" value={formatNumber(kpis.transRevPax)} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Operating Expenses" value={formatNumber(kpis.opExpenses)} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Operating Revenue" value={formatNumber(kpis.opRevenue)} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic title="Total Air Time" value={formatNumber(kpis.airTime)} suffix=" hours" />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default React.memo(KPICards);
