// src/components/AirlineDashboard/tabs/TrafficCapacityRevenueTab.jsx
import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Table } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import { Column, Line } from '@ant-design/plots';

import RegionYearFilters from '../filters/RegionYearFilters';
import KPIFilters from '../kpis/KPIFilters';
import KPICards from '../kpis/KPICards';
import useKPIs from '../../../hooks/useKPIs';
import {
  aggregateDataByYearAndQuarter,
  aggregateByYear,
  aggregateLoadFactorByYear,
  aggregateCASMvsRASMByYear,
  aggregateYieldByYear,
  filterDataByRegionAndYear,
  regionMap,
  regionMapReverse,
} from '../../../utils/dataTransformations';
import { formatNumber } from '../../../utils/formatNumber';
import '../../AirlineDashboard.css';

import { InfoCircleOutlined, FullscreenOutlined } from '@ant-design/icons';

const TrafficCapacityRevenueTab = ({ airlineData, handleEnlargeClick }) => {
  const [kpiSelectedRegion, setKpiSelectedRegion] = useState('All');
  const [kpiSelectedYear, setKpiSelectedYear] = useState('All');
  const [chartSelectedRegion, setChartSelectedRegion] = useState('All');

  const kpis = useKPIs(airlineData, kpiSelectedRegion, kpiSelectedYear);

  const getStackedColumnChartConfig = (metric) => ({
    data: aggregateDataByYearAndQuarter(airlineData, metric, chartSelectedRegion, regionMap, regionMapReverse).sort((a, b) => b.YEAR - a.YEAR),
    xField: 'YEAR',
    yField: 'value',
    seriesField: 'QUARTER',
    colorField: 'QUARTER',
    stack: {
      groupBy: ['x', 'series'],
      series: false,
    },
    scale: { color: { range: ['#8B7CB3', '#00A087', '#3C5488', '#4DBBD5'] } },
    slider: {
      x: {
        values: [0.0, 0.3],
      },
    },
    axis: {
      x: {
        title: 'Year',
      },
      y: {
        title: '$',
        labelFormatter: formatNumber,
      },
    },
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: {
      items: [{ channel: 'y', valueFormatter: formatNumber }],
    },
  });

  const transRevPaxChartConfig = useMemo(() => getStackedColumnChartConfig('TRANS_REV_PAX'), [chartSelectedRegion, airlineData]);
  const OpRevenueChartConfig = useMemo(() => getStackedColumnChartConfig('OP_REVENUES'), [chartSelectedRegion, airlineData]);
  const opExpensesChartConfig = useMemo(() => getStackedColumnChartConfig('OP_EXPENSES'), [chartSelectedRegion, airlineData]);

  const loadFactorData = useMemo(() => aggregateLoadFactorByYear(airlineData, chartSelectedRegion, regionMap, regionMapReverse), [chartSelectedRegion, airlineData]);
  const loadFactorChartConfig = {
    data: loadFactorData,
    xField: 'YEAR',
    yField: 'value',
    height: 400,
    style: {
      stroke: '#2892d7',
      shape: 'smooth',
      lineWidth: 2,
    },
    axis: {
      y: {
        title: '(%)',
      },
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: '.2f' }] },
  };

  const casmRasmData = useMemo(() => aggregateCASMvsRASMByYear(airlineData, chartSelectedRegion, regionMap, regionMapReverse), [chartSelectedRegion, airlineData]);
  const casmRasmChartConfig = {
    data: casmRasmData,
    xField: 'YEAR',
    yField: 'value',
    colorField: 'type',
    shapeField: 'smooth',
    scale: {
      color: {
        palette: ['#41b6c4', '#225ea8'],
      },
    },
    style: {
      shape: 'smooth',
      lineWidth: 2,
    },
    height: 400,
    padding: 'auto',
    axis: {
      y: { title: '¢ per ASM' },
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: '.2f' }] },
  };

  const yieldData = useMemo(() => aggregateYieldByYear(airlineData, chartSelectedRegion, regionMap, regionMapReverse), [chartSelectedRegion, airlineData]);
  const yieldChartConfig = {
    data: yieldData,
    xField: 'YEAR',
    yField: 'value',
    height: 400,
    style: {
      stroke: '#2892d7',
      shape: 'smooth',
      lineWidth: 2,
    },
    axis: {
      y: {
        title: '¢ per mile',
      },
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: '.2f' }] },
  };

  const asmData = useMemo(() => aggregateDataByYearAndQuarter(airlineData, 'ASM', chartSelectedRegion, regionMap, regionMapReverse), [chartSelectedRegion, airlineData]);
  const rpmData = useMemo(() => aggregateDataByYearAndQuarter(airlineData, 'RPM', chartSelectedRegion, regionMap, regionMapReverse), [chartSelectedRegion, airlineData]);

  const asmChartConfig = {
    data: asmData.sort((a, b) => b.YEAR - a.YEAR),
    xField: 'YEAR',
    yField: 'value',
    colorField: 'QUARTER',
    seriesField: 'QUARTER',
    stack: {
      groupBy: ['x', 'series'],
      series: false,
    },
    scale: { color: { range: ['#8B7CB3', '#00A087', '#3C5488', '#4DBBD5'] } },
    slider: {
      x: {
        values: [0.0, 0.2],
      },
    },
    padding: 'auto',
    axis: {
      x: {
        title: 'Year',
        rotate: -45,
      },
      y: {
        title: 'Miles',
        labelFormatter: formatNumber,
      },
    },
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
    height: 400,
  };

  const rpmChartConfig = {
    data: rpmData.sort((a, b) => b.YEAR - a.YEAR),
    xField: 'YEAR',
    yField: 'value',
    colorField: 'QUARTER',
    seriesField: 'QUARTER',
    stack: {
      groupBy: ['x', 'series'],
      series: false,
    },
    scale: { color: { range: ['#8B7CB3', '#00A087', '#3C5488', '#4DBBD5'] } },
    slider: {
      x: {
        values: [0.0, 0.2],
      },
    },
    padding: 'auto',
    axis: {
      x: {
        title: 'Year',
        rotate: -45,
      },
      y: {
        title: 'Miles',
        labelFormatter: formatNumber,
      },
    },
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
    height: 400,
  };

  const getLast5YearsData = (metric) => {
    const data = aggregateByYear(filterDataByRegionAndYear(airlineData, chartSelectedRegion, 'All', regionMap, regionMapReverse), metric);
    return data
      .sort((a, b) => b.YEAR - a.YEAR)
      .slice(0, 5)
      .map((item) => ({ ...item, key: item.YEAR }));
  };

  const getLast5YearsLoadFactorData = () =>
    loadFactorData
      .slice()
      .sort((a, b) => b.YEAR - a.YEAR)
      .slice(0, 5)
      .map((item) => ({ ...item, key: item.YEAR }));

  const getLast5YearsYieldData = () =>
    yieldData
      .slice()
      .sort((a, b) => b.YEAR - a.YEAR)
      .slice(0, 5)
      .map((item) => ({ ...item, key: item.YEAR }));

  const tableColumns = (metric) => [
    {
      title: 'Year',
      dataIndex: 'YEAR',
      key: 'YEAR',
    },
    {
      title: metric,
      dataIndex: 'value',
      key: 'value',
      render: (text) => {
        if (metric.includes('Yield')) {
          return `${text.toFixed(4)}`;
        } else if (metric.includes('Load Factor')) {
          return `${text.toFixed(2)}%`;
        } else {
          return formatNumber(text);
        }
      },
    },
  ];

  return (
    <>
      <KPIFilters
        kpiSelectedRegion={kpiSelectedRegion}
        setKpiSelectedRegion={setKpiSelectedRegion}
        kpiSelectedYear={kpiSelectedYear}
        setKpiSelectedYear={setKpiSelectedYear}
        airlineData={airlineData}
      />
      <KPICards kpis={kpis} />

      <RegionYearFilters
        chartSelectedRegion={chartSelectedRegion}
        setChartSelectedRegion={setChartSelectedRegion}
        airlineData={airlineData}
      />

      <GridContent>
        {/* Transport Revenue - Passengers */}
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card title="Transport Revenue - Passengers ($)" className="custom-card">
              <Column {...transRevPaxChartConfig} />
            </Card>
          </Col>
        </Row>

        {/* Operating Revenue */}
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card title="Operating Revenue ($)" className="custom-card">
              <Column {...OpRevenueChartConfig} />
            </Card>
          </Col>
        </Row>

        {/* ASM */}
        <Row gutter={24} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card
              className="custom-card"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Available Seat Miles (ASM)</span>
                  <div>
                    <InfoCircleOutlined style={{ marginRight: 16 }} />
                    <FullscreenOutlined style={{ cursor: 'pointer' }} onClick={() => handleEnlargeClick('ASM')} />
                  </div>
                </div>
              }
            >
              <Column {...asmChartConfig} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="ASM - Last 5 Years" className="custom-card">
              <Table columns={tableColumns('ASM')} dataSource={getLast5YearsData('ASM')} pagination={false} />
            </Card>
          </Col>
        </Row>

        {/* RPM */}
        <Row gutter={24} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card
              className="custom-card"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Revenue Passenger Miles (RPM)</span>
                  <div>
                    <InfoCircleOutlined style={{ marginRight: 16 }} />
                    <FullscreenOutlined style={{ cursor: 'pointer' }} onClick={() => handleEnlargeClick('RPM')} />
                  </div>
                </div>
              }
            >
              <Column {...rpmChartConfig} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="RPM - Last 5 Years" className="custom-card">
              <Table columns={tableColumns('RPM')} dataSource={getLast5YearsData('RPM')} pagination={false} />
            </Card>
          </Col>
        </Row>

        {/* Load Factor */}
        <Row gutter={24} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Load Factor (%)" className="custom-card">
              <Line {...loadFactorChartConfig} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Load Factor - Last 5 Years" className="custom-card">
              <Table columns={tableColumns('Load Factor (%)')} dataSource={getLast5YearsLoadFactorData()} pagination={false} />
            </Card>
          </Col>
        </Row>

        {/* CASM vs RASM */}
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card className="custom-card" title="CASM vs RASM (¢ per ASM)">
              <Line {...casmRasmChartConfig} />
            </Card>
          </Col>
        </Row>

        {/* Yield */}
        <Row gutter={24} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Passenger Yield (¢ per mile)" className="custom-card">
              <Line {...yieldChartConfig} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Passenger Yield - Last 5 Years" className="custom-card">
              <Table columns={tableColumns('Yield (¢ per mile)')} dataSource={getLast5YearsYieldData()} pagination={false} />
            </Card>
          </Col>
        </Row>

        {/* Operating Expenses */}
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card className="custom-card" title="Operating Expenses ($)">
              <Column {...opExpensesChartConfig} />
            </Card>
          </Col>
        </Row>
      </GridContent>
    </>
  );
};

export default React.memo(TrafficCapacityRevenueTab);
