import React from 'react';
import { Column } from '@ant-design/plots';
import Big from 'big.js';
import { formatNumber } from '../../../utils/formatNumber';

const expenseCategories = {
  crew: {
    columns: {
      'PILOT_FLY_OPS': 'Pilots And Copilots',
      'TRAIN_FLY_OPS': 'Trainees And Instructors',
      'PERS_EXP_FLY_OPS': 'Personnel Expenses',
      'BENEFITS_FLY_OPS': 'Employee Benefits And Pensions',
      'PAY_TAX_FLY_OPS': 'Taxes-Payroll',
    },
    title: 'Expenses on Crew',
  },
  fuelOil: {
    columns: {
      'FUEL_FLY_OPS': 'Aircraft Fuel',
      'OIL_FLY_OPS': 'Aircraft Oil',
    },
    title: 'Fuel & Oil',
  },
  maintenance: {
    columns: {
      'AIRFRAME_LABOR': 'Labor-Airframes',
      'ENGINE_LABOR': 'Labor-Aircraft Engines',
      'AIRFRAME_REPAIR': 'Airframe Repairs',
      'ENGINE_REPAIRS': 'Aircraft Engine Repairs',
      'AP_MT_BURDEN': 'Burden',
    },
    title: 'Direct Maintenance',
  },
  materials: {
    columns: {
      'AIRFRAME_MATERIALS': 'Airframes',
      'ENGINE_MATERIALS': 'Aircraft Engines',
    },
    title: 'Materials',
  },
  depreciation: {
    columns: {
      'AIRFRAME_DEP': 'Airframes',
      'ENGINE_DEP': 'Aircraft Engines',
      'PARTS_DEP': 'Airframe Parts',
      'ENG_PARTS_DEP': 'Aircraft Engine Parts',
      'OTH_FLT_EQUIP_DEP': 'Other Flight Equipment',
    },
    title: 'Depreciation',
  },
};

const aggregateOperatingExpensesByYear = (operatingData, columns, operatingSelectedCategory) => {
  const filteredData = operatingData.filter((item) => {
    const categoryMatch = operatingSelectedCategory === 'All' || item.AIRCRAFT_CATEGORIZATION === operatingSelectedCategory;
    const year = item.YEAR ? item.YEAR : null;
    const yearMatch = year && year >= 2001 && year <= 2024;
    return categoryMatch && yearMatch;
  });

  const aggregated = {};

  filteredData.forEach((item) => {
    const year = item.YEAR ? item.YEAR.toString() : null;
    if (!year) return;

    if (!aggregated[year]) {
      aggregated[year] = {};
      Object.keys(columns).forEach((col) => {
        aggregated[year][col] = Big(0);
      });
    }

    Object.keys(columns).forEach((col) => {
      aggregated[year][col] = aggregated[year][col].plus(Big(item[col] || 0));
    });
  });

  const result = [];
  Object.keys(aggregated).forEach((year) => {
    Object.keys(columns).forEach((col) => {
      result.push({
        year: year,
        type: columns[col],
        value: aggregated[year][col].toNumber(),
      });
    });
  });

  result.sort((a, b) => Number(a.year) - Number(b.year));
  return result;
};

const getChartConfig = (data) => ({
  data: data.slice().reverse(),
  xField: 'year',
  yField: 'value',
  colorField: 'type',
  seriesField: 'type',
  slider: {
    x: {
      values: [0.0, 0.3],
    },
  },
  axis: {
    y: {
      title: 'Expenses ($)',
      labelFormatter: formatNumber,
    },
  },
  stack: {
    groupBy: ['x', 'series'],
    series: false,
  },
  scale: { color: { range: ['#E64B35', '#8B7CB3', '#00A087', '#3C5488', '#4DBBD5'] } },
  height: 400,
  legend: {
    position: 'top-right',
  },
  style: {
    radiusTopLeft: 8,
    radiusTopRight: 8,
    radiusBottomLeft: 8,
    radiusBottomRight: 8,
  },
  tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber }] },
});

const OperatingExpensesCharts = {
  getInnerTabItems: (operatingData, operatingSelectedCategory) => {
    const crewData = aggregateOperatingExpensesByYear(operatingData, expenseCategories.crew.columns, operatingSelectedCategory);
    const fuelOilData = aggregateOperatingExpensesByYear(operatingData, expenseCategories.fuelOil.columns, operatingSelectedCategory);
    const maintenanceData = aggregateOperatingExpensesByYear(operatingData, expenseCategories.maintenance.columns, operatingSelectedCategory);
    const materialsData = aggregateOperatingExpensesByYear(operatingData, expenseCategories.materials.columns, operatingSelectedCategory);
    const depreciationData = aggregateOperatingExpensesByYear(operatingData, expenseCategories.depreciation.columns, operatingSelectedCategory);

    return [
      {
        key: '1',
        label: expenseCategories.crew.title,
        children: <Column {...getChartConfig(crewData)} />,
      },
      {
        key: '2',
        label: expenseCategories.fuelOil.title,
        children: <Column {...getChartConfig(fuelOilData)} />,
      },
      {
        key: '3',
        label: expenseCategories.maintenance.title,
        children: <Column {...getChartConfig(maintenanceData)} />,
      },
      {
        key: '4',
        label: expenseCategories.materials.title,
        children: <Column {...getChartConfig(materialsData)} />,
      },
      {
        key: '5',
        label: expenseCategories.depreciation.title,
        children: <Column {...getChartConfig(depreciationData)} />,
      },
    ];
  },
};

export default OperatingExpensesCharts;
