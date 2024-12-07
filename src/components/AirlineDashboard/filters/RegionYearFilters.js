import React from 'react';
import { Row, Col, Select } from 'antd';
const { Option } = Select;

const RegionYearFilters = ({ chartSelectedRegion, setChartSelectedRegion, airlineData }) => {
  const getAvailableRegions = () => {
    if (!airlineData || airlineData.length === 0) return [];
    const regionSet = new Set(airlineData.map((item) => item.REGION));
    return Array.from(regionSet);
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <Row gutter={16}>
        <Col>
          <Select
            className="custom-card"
            style={{ width: 200 }}
            placeholder="Select Region"
            value={chartSelectedRegion}
            onChange={setChartSelectedRegion}
          >
            <Option value="All">All Regions</Option>
            {getAvailableRegions().map((regionName) => (
              <Option key={regionName} value={regionName}>
                {regionName}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(RegionYearFilters);
