import React from 'react';
import { Row, Col, Select } from 'antd';
const { Option } = Select;

const OperatingFilters = ({
  operatingSelectedYear, setOperatingSelectedYear,
  operatingSelectedCategory, setOperatingSelectedCategory,
  operatingData
}) => {

  const availableOperatingYears = React.useMemo(() => {
    if (!operatingData || operatingData.length === 0) return [];
    const yearsSet = new Set(
      operatingData
        .filter((item) => item.YEAR !== undefined && item.YEAR !== null)
        .map((item) => item.YEAR.toString())
    );
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [operatingData]);

  const availableAircraftCategories = React.useMemo(() => {
    if (!operatingData || operatingData.length === 0) return [];
    const categoriesSet = new Set(
      operatingData
        .filter((item) => item.AIRCRAFT_CATEGORIZATION)
        .map((item) => item.AIRCRAFT_CATEGORIZATION)
    );
    return Array.from(categoriesSet);
  }, [operatingData]);

  return (
    <div style={{ marginTop: '20px' }}>
      <Row gutter={16}>
        <Col>
          <Select
            className="custom-card"
            style={{ width: 200 }}
            placeholder="Select Year"
            value={operatingSelectedYear}
            onChange={setOperatingSelectedYear}
          >
            <Option value="All">All Years</Option>
            {availableOperatingYears.map((year) => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            className="custom-card"
            style={{ width: 200 }}
            placeholder="Select Aircraft Category"
            value={operatingSelectedCategory}
            onChange={setOperatingSelectedCategory}
          >
            <Option value="All">All Categories</Option>
            {availableAircraftCategories.map((category) => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(OperatingFilters);
