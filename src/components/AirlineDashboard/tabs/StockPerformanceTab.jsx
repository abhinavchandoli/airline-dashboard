import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Segmented } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Area, Column, Line } from '@ant-design/plots';

import { formatNumber } from '../../../utils/formatNumber';
import { formatReturn, getStockChartData, getSeasonalData } from '../charts/stockChartHelpers';
import '../../AirlineDashboard.css';
import airlines from '../../../data/airlines'; // Import airlines data to access forecast images

const StockPerformanceTab = ({ airlineId, airlineInfo, stockData, allStockKPIs, stockKPIs, navigate }) => {
  const [stockViewRange, setStockViewRange] = useState('Max');

  const stockChartData = useMemo(() => getStockChartData(stockData, stockViewRange), [stockData, stockViewRange]);
  const { seasonalChartData, years } = useMemo(() => getSeasonalData(stockData), [stockData]);

  // Retrieve the current airline's forecast image path
  const currentAirline = airlines.find((airline) => airline.id === airlineId);
  const forecastImagePath = currentAirline ? `/${currentAirline.id}-forecast.png` : null;

  const stockPriceAreaConfig = {
    data: stockChartData,
    xField: 'date',
    yField: 'price',
    smooth: true,
    axis: {
      x: {
        title: 'Date',
        labelSpacing: 6,
        style: { labelTransform: 'rotate(90deg)' },
      },
      y: {
        title: 'Price',
      },
    },
    style: {
      fill: 'linear-gradient(-90deg, #41b6c4 0%, #225ea8 100%)',
    },
    height: 400,
  };

  const volumeBarData = stockChartData.map((item, index) => {
    const prevPrice = index > 0 ? stockChartData[index - 1].price : item.price;
    return { ...item, priceChange: item.price - prevPrice };
  });

  const volumeBarChartConfig = {
    data: volumeBarData,
    xField: 'date',
    yField: 'volume',
    colorField: 'priceChange',
    scale: {
      color: ({ priceChange }) => {
        if (priceChange > 0) {
          return 'green';
        } else if (priceChange < 0) {
          return 'red';
        } else {
          return 'gray';
        }
      },
    },
    style: {
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomLeft: 8,
      radiusBottomRight: 8,
    },
    tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
    height: 200,
  };

  const seasonalsChartConfig = {
    data: seasonalChartData,
    xField: 'month',
    yField: 'price',
    seriesField: 'year',
    scale: { color: { palette: 'Set2' } },
    meta: {
      year: {
        values: years,
      },
    },
    axis: {
      x: {
        title: 'Month',
      },
      y: {
        title: 'Price',
      },
    },
    colorField: 'year',
    shapeField: 'smooth',
    xAxis: {
      title: {
        text: 'Month',
      },
      label: {
        formatter: (val) => {
          const monthNames = [
            '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          ];
          return monthNames[parseInt(val, 10)];
        },
      },
    },
    yAxis: {
      label: {
        formatter: (value) => `$${value.toFixed(2)}`,
      },
    },
    height: 400,
    smooth: true,
    line: {
      style: {
        lineWidth: 2,
        strokeWidth: 1,
      },
    },
  };

  // Handler for view switch
  const handleViewChange = (value) => {
    setStockViewRange(value);
  };

  return (
    <>
      <div style={{ marginTop: '5px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#000' }}>
          {airlineInfo?.nasdaqName} ({airlineInfo?.ticker})
        </h2>
      </div>
      <div style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]} justify="start" align="top">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic
                title={`Nasdaq Price (as of ${stockKPIs.latestDate})`}
                value={`$${stockKPIs.latestPrice ? stockKPIs.latestPrice.toFixed(2) : 'N/A'}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic
                title="1-Year Return"
                value={formatReturn(stockKPIs.oneYearReturn)}
                valueStyle={{
                  color:
                    stockKPIs.oneYearReturn === 'N/A'
                      ? 'inherit'
                      : stockKPIs.oneYearReturn >= 0
                      ? 'green'
                      : 'red',
                }}
                prefix={
                  stockKPIs.oneYearReturn === 'N/A'
                    ? null
                    : stockKPIs.oneYearReturn >= 0
                    ? <ArrowUpOutlined />
                    : <ArrowDownOutlined />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic
                title="3-Year Return"
                value={formatReturn(stockKPIs.threeYearReturn)}
                valueStyle={{
                  color:
                    stockKPIs.threeYearReturn === 'N/A'
                      ? 'inherit'
                      : stockKPIs.threeYearReturn >= 0
                      ? 'green'
                      : 'red',
                }}
                prefix={
                  stockKPIs.threeYearReturn === 'N/A'
                    ? null
                    : stockKPIs.threeYearReturn >= 0
                    ? <ArrowUpOutlined />
                    : <ArrowDownOutlined />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="custom-card" size="small">
              <Statistic
                title="5-Year Return"
                value={formatReturn(stockKPIs.fiveYearReturn)}
                valueStyle={{
                  color:
                    stockKPIs.fiveYearReturn === 'N/A'
                      ? 'inherit'
                      : stockKPIs.fiveYearReturn >= 0
                      ? 'green'
                      : 'red',
                }}
                prefix={
                  stockKPIs.fiveYearReturn === 'N/A'
                    ? null
                    : stockKPIs.fiveYearReturn >= 0
                    ? <ArrowUpOutlined />
                    : <ArrowDownOutlined />
                }
              />
            </Card>
          </Col>
        </Row>
        <div style={{ marginTop: '24px' }}>
          <Segmented
            options={['1Y', '3Y', '5Y', 'Max', 'Forecast']} // Added 'Forecast' option
            value={stockViewRange}
            onChange={handleViewChange}
          />
        </div>
        <div style={{ marginTop: '24px' }}>
          {stockViewRange !== 'Forecast' ? (
            // Render charts for other options
            <>
              <Area {...stockPriceAreaConfig} />
              <Column {...volumeBarChartConfig} />
              <Card title="Seasonals" className="custom-card">
                <Line {...seasonalsChartConfig} />
              </Card>
            </>
          ) : (
            // Render forecast image when 'Forecast' is selected
            forecastImagePath ? (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={forecastImagePath}
                  alt={`${airlineInfo?.nasdaqName} Forecast`}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                {/* Disclaimer Under Forecast Image */}
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>
                    Disclaimer: Stock price predictions are for informational purposes only
                    and should not be considered financial advice. Past performance does
                    not guarantee future results.
                  </span>
                </div>
              </div>
            ) : (
              <p>Forecast image not available.</p>
            )
          )}
        </div>
        <div style={{ marginTop: '28px' }}>
          <h4 style={{ marginBottom: '24px' }}>Peer Comparison</h4>
          <Row gutter={[16, 16]} justify="center" align="top">
            {allStockKPIs.map((kpi) => (
              <Col flex="20%" key={kpi.airlineId}>
                <Card
                  className={`custom-card ${kpi.airlineId === airlineId ? 'current-airline' : 'other-airline'}`}
                  size={kpi.airlineId === airlineId ? 'default' : 'small'}
                  style={{ padding: '0', margin: '0', cursor: kpi.airlineId !== airlineId ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (kpi.airlineId !== airlineId) {
                      navigate(`/airline/${kpi.airlineId}?tab=stock`);
                    }
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                        {`${kpi.nasdaqName} (${kpi.ticker})`}
                      </span>
                    }
                    value={`$${kpi.latestPrice ? kpi.latestPrice.toFixed(2) : 'N/A'}`}
                  />
                  <Statistic
                    title="1-Year Return"
                    value={formatReturn(kpi.oneYearReturn)}
                    valueStyle={{
                      color:
                        kpi.oneYearReturn === 'N/A'
                          ? 'inherit'
                          : kpi.oneYearReturn >= 0
                          ? 'green'
                          : 'red',
                    }}
                    prefix={
                      kpi.oneYearReturn === 'N/A'
                        ? null
                        : kpi.oneYearReturn >= 0
                        ? <ArrowUpOutlined />
                        : <ArrowDownOutlined />
                    }
                  />
                  <Statistic
                    title="3-Year Return"
                    value={formatReturn(kpi.threeYearReturn)}
                    valueStyle={{
                      color:
                        kpi.threeYearReturn === 'N/A'
                          ? 'inherit'
                          : kpi.threeYearReturn >= 0
                          ? 'green'
                          : 'red',
                    }}
                    prefix={
                      kpi.threeYearReturn === 'N/A'
                        ? null
                        : kpi.threeYearReturn >= 0
                        ? <ArrowUpOutlined />
                        : <ArrowDownOutlined />
                    }
                  />
                  <Statistic
                    title="5-Year Return"
                    value={formatReturn(kpi.fiveYearReturn)}
                    valueStyle={{
                      color:
                        kpi.fiveYearReturn === 'N/A'
                          ? 'inherit'
                          : kpi.fiveYearReturn >= 0
                          ? 'green'
                          : 'red',
                    }}
                    prefix={
                      kpi.fiveYearReturn === 'N/A'
                        ? null
                        : kpi.fiveYearReturn >= 0
                        ? <ArrowUpOutlined />
                        : <ArrowDownOutlined />
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </>
  );
};

export default React.memo(StockPerformanceTab);
