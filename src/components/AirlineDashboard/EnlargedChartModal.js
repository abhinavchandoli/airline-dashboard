import React from 'react';
import { Modal, Card } from 'antd';
import { Column } from '@ant-design/plots';

import { aggregateDataByYearAndQuarter } from '../../utils/dataTransformations';
import { formatNumber } from '../../utils/formatNumber';

const EnlargedChartModal = ({ isModalVisible, expandedChart, onClose, airlineData }) => {
  const baseChartConfig = (metric) => ({
    data: aggregateDataByYearAndQuarter(airlineData, metric, 'All').sort((a, b) => b.YEAR - a.YEAR),
    xField: 'YEAR',
    yField: 'value',
    height: 430,
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
      tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] }
  });

  return (
    <Modal
      open={isModalVisible}
      footer={null}
      onCancel={onClose}
      width="90%"
      style={{ padding: 0 }}
      destroyOnClose
    >
      <div style={{ padding: '24px' }}>
        {expandedChart === 'ASM' && (
          <Card className="custom-card" title="Available Seat Miles (ASM)" bordered={false}>
            <Column {...baseChartConfig('ASM')} />
          </Card>
        )}
        {expandedChart === 'RPM' && (
          <Card className="custom-card" title="Revenue Passenger Miles (RPM)" bordered={false}>
            <Column {...baseChartConfig('RPM')} />
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default React.memo(EnlargedChartModal);
