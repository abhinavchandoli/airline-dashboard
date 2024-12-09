import React from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { Card } from 'antd';

const IncomeStatementSankeyChart = ({ data }) => {
  // Process data to fit Nivo Sankey's format
  const sankeyData = {
    nodes: [],
    links: [],
  };

  const nodeMap = {};

  // Helper function to add nodes and get their index
  const addNode = (name) => {
    if (!(name in nodeMap)) {
      nodeMap[name] = sankeyData.nodes.length;
      sankeyData.nodes.push({ id: name });
    }
    return nodeMap[name];
  };

  // Define categories for revenues and expenses
  const revenueCategories = [
    'TRANS_REV_PAX',
    'MAIL_REV',
    'TRANS_REVENUE',
    'OP_REVENUES',
    // Add other revenue fields as needed
  ];

  const expenseCategories = [
    'SALARIES',
    'MAINTENANCE',
    'OPERATING_EXPENSES',
    'INTEREST_EXPENSES',
    'DEPRECIATION',
    // Add other expense fields as needed
  ];

  // Aggregate revenues and expenses
  const totalRevenues = revenueCategories.reduce((sum, key) => sum + (data[key] || 0), 0);
  const totalExpenses = expenseCategories.reduce((sum, key) => sum + (data[key] || 0), 0);
  const netIncome = data.NET_INCOME || 0;

  // Define nodes
  addNode('Total Revenues');
  revenueCategories.forEach((key) => addNode(key));
  addNode('Total Expenses');
  expenseCategories.forEach((key) => addNode(key));
  addNode('Net Income');

  // Define links from Total Revenues to individual revenue streams
  revenueCategories.forEach((key) => {
    if (data[key]) {
      sankeyData.links.push({
        source: 'Total Revenues',
        target: key,
        value: data[key],
      });
    }
  });

  // Define links from individual revenue streams to Total Revenues (reverse flow for visualization)
  revenueCategories.forEach((key) => {
    if (data[key]) {
      sankeyData.links.push({
        source: key,
        target: 'Total Revenues',
        value: data[key],
      });
    }
  });

  // Define links from Total Revenues to Total Expenses
  sankeyData.links.push({
    source: 'Total Revenues',
    target: 'Total Expenses',
    value: totalExpenses,
  });

  // Define links from Total Expenses to individual expense categories
  expenseCategories.forEach((key) => {
    if (data[key]) {
      sankeyData.links.push({
        source: 'Total Expenses',
        target: key,
        value: data[key],
      });
    }
  });

  // Define links from individual expense categories to Total Expenses (reverse flow for visualization)
  expenseCategories.forEach((key) => {
    if (data[key]) {
      sankeyData.links.push({
        source: key,
        target: 'Total Expenses',
        value: data[key],
      });
    }
  });

  // Define links from Total Expenses to Net Income
  sankeyData.links.push({
    source: 'Total Expenses',
    target: 'Net Income',
    value: netIncome,
  });

  // Define links from Net Income to Total Revenues (reverse flow for visualization)
  sankeyData.links.push({
    source: 'Net Income',
    target: 'Total Revenues',
    value: netIncome,
  });

  return (
    <Card title="Income Statement Sankey Chart" style={{ marginTop: '24px' }}>
      <div style={{ height: '500px' }}>
        <ResponsiveSankey
          data={sankeyData}
          margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
          align="justify"
          colors={{ scheme: 'category10' }}
          nodeOpacity={1}
          nodeHoverOpacity={1}
          nodeHoverOthersOpacity={0.7}
          nodeWidth={15}
          nodePadding={10}
          nodeBorderWidth={2}
          nodeBorderColor={{
            from: 'color',
            modifiers: [['darker', 0.8]],
          }}
          linkOpacity={0.5}
          linkHoverOpacity={0.6}
          enableLinkGradient={true}
          labelPosition="inside"
          labelOrientation="horizontal"
          labelPadding={16}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
          animate={true}
          motionStiffness={140}
          motionDamping={13}
        />
      </div>
    </Card>
  );
};

export default IncomeStatementSankeyChart;
