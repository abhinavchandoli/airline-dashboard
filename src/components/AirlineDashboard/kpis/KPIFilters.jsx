// src/components/AirlineDashboard/kpis/KPIFilters.jsx
import React from 'react';
import { Row, Col, Select } from 'antd';
import { regionMap } from '../../../utils/dataTransformations';
const { Option } = Select;

const KPIFilters = ({ kpiSelectedRegion, setKpiSelectedRegion, kpiSelectedYear, setKpiSelectedYear, airlineData }) => {
  const getAvailableYears = () => {
    if (!airlineData || airlineData.length === 0) {
      return [];
    }
    const yearsSet = new Set(
      airlineData
        .filter((item) => item.YEAR !== undefined && item.YEAR !== null)
        .map((item) => item.YEAR.toString())
    );
    return Array.from(yearsSet).sort((a, b) => a - b);
  };

  const getAvailableRegions = () => {
    if (!airlineData || airlineData.length === 0) return [];
    const regionSet = new Set(airlineData.map((item) => item.REGION));
    return Array.from(regionSet)
      .map((code) => regionMap[code])
      .filter((name) => !!name);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <Row gutter={16}>
        <Col>
          <Select
            className="custom-card"
            style={{ width: 200 }}
            placeholder="Select Region"
            value={kpiSelectedRegion}
            onChange={setKpiSelectedRegion}
          >
            <Option value="All">All Regions</Option>
            {getAvailableRegions().map((regionName) => (
              <Option key={regionName} value={regionName}>
                {regionName}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            className="custom-card"
            style={{ width: 200 }}
            placeholder="Select Year"
            value={kpiSelectedYear}
            onChange={setKpiSelectedYear}
          >
            <Option value="All">All Years</Option>
            {getAvailableYears().map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(KPIFilters);
