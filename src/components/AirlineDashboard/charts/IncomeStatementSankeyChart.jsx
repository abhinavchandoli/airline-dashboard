// src/components/AirlineDashboard/charts/IncomeStatementSankeyChart.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Select, Card } from 'antd';
import { Sankey } from '@antv/g2plot';
import PropTypes from 'prop-types';
import { formatNumber } from '../../../utils/formatNumber';

const { Option } = Select;

const IncomeStatementSankeyChart = ({ airlineData, balanceSheets }) => {
  const [selectedYear, setSelectedYear] = useState('All');
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const sankeyInstance = useRef(null);

  // Prepare available years from 2001 to 2024
  const availableYears = Array.from({ length: 24 }, (_, i) => 2001 + i);

  // Function to process data for the Sankey chart
  const processData = () => {
    let filteredAirlineData = airlineData;
    let filteredBalanceSheets = balanceSheets;

    if (selectedYear !== 'All') {
      filteredAirlineData = airlineData.filter(item => item.YEAR === Number(selectedYear));
      filteredBalanceSheets = balanceSheets.filter(item => item.YEAR === Number(selectedYear));
    }

    // Aggregate AirlineData metrics
    const totalOpRevenues = filteredAirlineData.reduce((sum, row) => sum + (row.OP_REVENUES || 0), 0);
    const totalNetIncome = filteredAirlineData.reduce((sum, row) => sum + (row.NET_INCOME || 0), 0);
    const totalOpProfitLoss = filteredAirlineData.reduce((sum, row) => sum + (row.OP_PROFIT_LOSS || 0), 0);

    // For Balance Sheet, aggregate necessary fields
    const aggregatedBS = filteredBalanceSheets.reduce((acc, row) => {
      acc.CURR_ASSETS = (acc.CURR_ASSETS || 0) + (row.CURR_ASSETS || 0);
      acc.CURR_LIABILITIES = (acc.CURR_LIABILITIES || 0) + (row.CURR_LIABILITIES || 0);
      acc.ASSETS = (acc.ASSETS || 0) + (row.ASSETS || 0);
      acc.LIAB_SH_HLD_EQUITY = (acc.LIAB_SH_HLD_EQUITY || 0) + (row.LIAB_SH_HLD_EQUITY || 0);
      acc.SH_HLD_EQUIT_NET = (acc.SH_HLD_EQUIT_NET || 0) + (row.SH_HLD_EQUIT_NET || 0);
      return acc;
    }, {});

    // Define nodes
    const nodes = [
      { name: 'Total Operating Revenues' },
      { name: 'Operating Profit/Loss' },
      { name: 'Total Expenses' },
      { name: 'Net Income' },
      // You can add more detailed categories if needed
    ];

    // Define links
    const links = [
      { source: 'Total Operating Revenues', target: 'Operating Profit/Loss', value: totalOpProfitLoss },
      { source: 'Operating Profit/Loss', target: 'Total Expenses', value: totalOpProfitLoss },
      { source: 'Total Expenses', target: 'Net Income', value: totalNetIncome },
    ];

    return { nodes, links };
  };

  useEffect(() => {
    const { nodes, links } = processData();

    if (sankeyInstance.current) {
      sankeyInstance.current.changeData(links);
      return;
    }

    sankeyInstance.current = new Sankey(containerRef.current, {
      data: {
        nodes,
        links,
      },
      height: 500,
      width: containerRef.current ? containerRef.current.offsetWidth : 800,
      label: {
        formatter: (text, item) => {
          // Optionally format labels with values
          const link = links.find(l => l.source === item.name || l.target === item.name);
          if (link) {
            return `${text}\n$${formatNumber(link.value)}`;
          }
          return text;
        },
      },
      tooltip: {
        fields: ['source', 'target', 'value'],
        formatter: (datum) => ({
          name: `${datum.source} → ${datum.target}`,
          value: `$${formatNumber(datum.value)}`,
        }),
      },
      nodePadding: 10,
      nodeWidth: 30,
      layout: 'dagre',
      // Additional configurations as needed
    });

    sankeyInstance.current.render();

    // Cleanup on unmount
    return () => {
      if (sankeyInstance.current) {
        sankeyInstance.current.destroy();
      }
    };
  }, [selectedYear, airlineData, balanceSheets]);

  return (
    <Card title="Income Statement Sankey Chart" style={{ marginTop: '40px' }}>
      {/* Year Filter */}
      <div style={{ marginBottom: '20px' }}>
        <Select
          style={{ width: 200 }}
          value={selectedYear}
          onChange={value => setSelectedYear(value)}
        >
          <Option value="All">All Years</Option>
          {availableYears.map(year => (
            <Option key={year} value={year.toString()}>{year}</Option>
          ))}
        </Select>
      </div>

      {/* Sankey Chart Container */}
      <div ref={containerRef} />
    </Card>
  );
};

IncomeStatementSankeyChart.propTypes = {
  airlineData: PropTypes.array.isRequired,
  balanceSheets: PropTypes.array.isRequired,
};

export default IncomeStatementSankeyChart;
