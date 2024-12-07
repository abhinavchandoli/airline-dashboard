// FuelStatistics.js

import React, { useMemo } from 'react';
import { Card, Tabs } from 'antd';
import { Line, Column, DualAxes } from '@ant-design/plots';
import { formatNumber } from '../../utils/formatNumber';
import Big from 'big.js';

const FuelStatistics = React.memo(
  ({ operatingData, operatingDataExtended, operatingSelectedCategory }) => {
    // Aggregate Fuel Data By Year
    const aggregateFuelDataByYear = useMemo(() => {
      const filteredData = operatingData.filter((item) => {
        const categoryMatch =
          operatingSelectedCategory === 'All' ||
          item.AIRCRAFT_CATEGORIZATION === operatingSelectedCategory;
        const year = item.YEAR ? item.YEAR : null;
        const yearMatch = year && year >= 2001 && year <= 2024;
        return categoryMatch && yearMatch;
      });

      const aggregated = {};

      filteredData.forEach((item) => {
        const year = item.YEAR ? item.YEAR.toString() : null;
        if (!year) return;

        if (!aggregated[year]) {
          aggregated[year] = {
            fuelGallons: Big(0),
            fuelExpense: Big(0),
          };
        }

        aggregated[year].fuelGallons = aggregated[year].fuelGallons.plus(
          Big(item.AIRCRAFT_FUELS_921 || 0)
        );
        aggregated[year].fuelExpense = aggregated[year].fuelExpense.plus(
          Big(item.FUEL_FLY_OPS || 0)
        );
      });

      const result = Object.keys(aggregated)
        .map((year) => ({
          year,
          fuelGallons: aggregated[year].fuelGallons.toNumber(),
          fuelExpense: aggregated[year].fuelExpense.toNumber(),
        }))
        .sort((a, b) => Number(a.year) - Number(b.year));

      return result;
    }, [operatingData, operatingSelectedCategory]);

    // Calculate Price Per Gallon
    const calculatePricePerGallon = useMemo(() => {
      const data = aggregateFuelDataByYear;

      const result = data.map((item) => ({
        year: item.year,
        pricePerGallon:
          item.fuelGallons === 0 ? 0 : item.fuelExpense / item.fuelGallons,
      }));

      return result;
    }, [aggregateFuelDataByYear]);

    // Aggregate Fuel Expense By Year
    const aggregateFuelExpenseByYear = useMemo(() => {
      const filteredData = operatingData.filter((item) => {
        const year = item.YEAR ? item.YEAR.toString() : null;
        const yearMatch = year && year >= 2001 && year <= 2024;
        return yearMatch;
      });

      const aggregated = {};

      filteredData.forEach((item) => {
        const year = item.YEAR ? item.YEAR.toString() : null;
        if (!year) return;

        if (!aggregated[year]) {
          aggregated[year] = Big(0);
        }

        aggregated[year] = aggregated[year].plus(Big(item.FUEL_FLY_OPS || 0));
      });

      return aggregated;
    }, [operatingData]);

    // Aggregate Operating Expense By Year
    const aggregateOperatingExpenseByYear = useMemo(() => {
      const filteredData = operatingDataExtended.filter((item) => {
        const year = item.YEAR ? item.YEAR.toString() : null;
        const yearMatch = year && year >= 2001 && year <= 2024;
        return yearMatch;
      });

      const aggregated = {};

      filteredData.forEach((item) => {
        const year = item.YEAR ? item.YEAR.toString() : null;
        if (!year) return;

        if (!aggregated[year]) {
          aggregated[year] = Big(0);
        }

        aggregated[year] = aggregated[year].plus(Big(item.OP_EXPENSE || 0));
      });

      return aggregated;
    }, [operatingDataExtended]);

    // Calculate Fuel Expense Percentage
    const calculateFuelExpensePercentage = useMemo(() => {
      const fuelExpenses = aggregateFuelExpenseByYear;
      const operatingExpenses = aggregateOperatingExpenseByYear;

      const years = Object.keys(fuelExpenses).filter(
        (year) => operatingExpenses[year]
      );

      const result = years.map((year) => {
        const fuelExpense = fuelExpenses[year];
        const operatingExpense = operatingExpenses[year];

        const percentage = operatingExpense.eq(0)
          ? 0
          : fuelExpense.div(operatingExpense).times(100).toNumber();

        return {
          year,
          percentage,
        };
      });

      // Sort by year
      result.sort((a, b) => Number(a.year) - Number(b.year));

      return result;
    }, [aggregateFuelExpenseByYear, aggregateOperatingExpenseByYear]);

    // Calculate Fuel Expense Per ASM
    const calculateFuelExpensePerASM = useMemo(() => {
      const filteredData = operatingData.filter((item) => {
        const categoryMatch =
          operatingSelectedCategory === 'All' ||
          item.AIRCRAFT_CATEGORIZATION === operatingSelectedCategory;
        const year = item.YEAR ? item.YEAR.toString() : null;
        const yearMatch = year && year >= 2001 && year <= 2024;
        return categoryMatch && yearMatch;
      });

      const aggregated = {};

      filteredData.forEach((item) => {
        const year = item.YEAR ? item.YEAR.toString() : null;
        if (!year) return;

        if (!aggregated[year]) {
          aggregated[year] = {
            fuelExpense: Big(0),
            asm: Big(0),
          };
        }

        aggregated[year].fuelExpense = aggregated[year].fuelExpense.plus(
          Big(item.FUEL_FLY_OPS || 0)
        );
        aggregated[year].asm = aggregated[year].asm.plus(
          Big(item.AVL_SEAT_MILES_320 || 0)
        );
      });

      const result = Object.keys(aggregated).map((year) => {
        const { fuelExpense, asm } = aggregated[year];
        const expensePerASM = asm.eq(0) ? 0 : fuelExpense.div(asm).toNumber();

        return {
          year,
          expensePerASM,
        };
      });

      // Sort by year
      result.sort((a, b) => Number(a.year) - Number(b.year));

      return result;
    }, [operatingData, operatingSelectedCategory]);

    // Aggregate Enplaned Pax By Year
    const aggregateEnplanedPaxByYear = useMemo(() => {
      const filteredData = operatingDataExtended.filter((item) => {
        const year = item.YEAR ? item.YEAR.toString() : null;
        const yearMatch = year && year >= 2001 && year <= 2024;
        return yearMatch;
      });

      const aggregated = {};

      filteredData.forEach((item) => {
        const year = item.YEAR ? item.YEAR.toString() : null;
        if (!year) return;

        if (!aggregated[year]) {
          aggregated[year] = Big(0);
        }

        aggregated[year] = aggregated[year].plus(
          Big(item.REV_PAX_ENP_110 || 0)
        );
      });

      return aggregated;
    }, [operatingDataExtended]);

    // Calculate Fuel Expense Per Pax
    const calculateFuelExpensePerPax = useMemo(() => {
      const fuelExpenses = aggregateFuelExpenseByYear;
      const enplanedPax = aggregateEnplanedPaxByYear;

      const years = Object.keys(fuelExpenses).filter(
        (year) => enplanedPax[year]
      );

      const result = years.map((year) => {
        const fuelExpense = fuelExpenses[year];
        const enplanedPassengers = enplanedPax[year];

        const ExpensePerEnpPax = enplanedPassengers.eq(0)
          ? 0
          : fuelExpense.div(enplanedPassengers).toNumber();

        return {
          year,
          ExpensePerEnpPax,
        };
      });

      // Sort by year
      result.sort((a, b) => Number(a.year) - Number(b.year));

      return result;
    }, [aggregateFuelExpenseByYear, aggregateEnplanedPaxByYear]);

    // Prepare Chart Configurations
    const fuelData = aggregateFuelDataByYear;

    const fuelExpenseGallonsChartConfig = useMemo(
      () => ({
        data: fuelData,
        xField: 'year',
        height: 400,
        scale: { y: { nice: false } },
        children:[
          {
            type:'line',
            yField:'fuelExpense',
            style: {
              stroke: 'black',
              shape:'smooth',
              lineWidth: 3,
            },
            axis:{
              y:{title:'Expense ($)',
                style:{titleFill:'black'},
                labelFormatter: formatNumber,
              },
            },
          },
          {
            type:'interval',
            yField:'fuelGallons',
            colorField:'#4DBBD5',
      
            style:{
              fillOpacity:0.5,
              radiusTopLeft: 8,
              radiusTopRight: 8,
              radiusBottomLeft: 8,
              radiusBottomRight: 8,
            },
            axis:{
              y:{
                position:'right',
                title:'Gallons',
                style:{titleFill:'#4DBBD5'},
                labelFormatter: formatNumber,
              },
            },
          },
        ],
        tooltip: { items: [{ channel: 'y', valueFormatter: formatNumber}] },
      }),
      [fuelData]
    );

    const pricePerGallonData = calculatePricePerGallon;

    const pricePerGallonChartConfig = useMemo(
      () => ({
        data: pricePerGallonData,
        xField: 'year',
        yField: 'pricePerGallon',
        height: 400,
        style: {
          stroke: '#2892d7',
          shape:'smooth',
          lineWidth: 2,
        },
        axis: {
          y: {
            title: 'Price Per Gallon ($)',
          },
        },
        tooltip: {items: [{ channel: 'y', valueFormatter: '.2f'}] },
      }),
      [pricePerGallonData]
    );

    const fuelExpensePercentageData = calculateFuelExpensePercentage;

    const fuelExpensePercentageChartConfig = useMemo(
      () => ({
        data: fuelExpensePercentageData,
        xField: 'year',
        yField: 'percentage',
        height: 400,
        axis: {
          y: {
            title: '(%)',
          },
        },
        colorField:'#4DBBD5',
        style: {
          radiusTopLeft: 8,
          radiusTopRight: 8,
          radiusBottomLeft: 8,
          radiusBottomRight: 8,
        },
        tooltip: {items: [{ channel: 'y', valueFormatter: '.2f'}] },
      }),
      [fuelExpensePercentageData]
    );

    const fuelExpensePerASMData = calculateFuelExpensePerASM;

    const fuelExpensePerASMChartConfig = useMemo(
      () => ({
        data: fuelExpensePerASMData,
        xField: 'year',
        yField: 'expensePerASM',
        height: 400,
        style: {
          stroke: '#2892d7',
          shape:'smooth',
          lineWidth: 3,
        },
        axis: {
          y: {
            title: '($)',
          },
        },
        tooltip: {items: [{ channel: 'y', valueFormatter: '.3f'}] },
      }),
      [fuelExpensePerASMData]
    );

    const fuelExpensePerPaxData = calculateFuelExpensePerPax;

    const fuelExpensePerPaxChartConfig = useMemo(
      () => ({
        data: fuelExpensePerPaxData,
        xField: 'year',
        yField: 'ExpensePerEnpPax',
        height: 400,
        style: {
          stroke: '#2892d7',
          shape:'smooth',
          lineWidth: 3,
        },
        axis: {
          y: {
            title: '($)',
          },
        },
        tooltip: {items: [{ channel: 'y', valueFormatter: '.2f',name: ''}] },
      }),
      [fuelExpensePerPaxData]
    );

    const tabItems = [
      {
        key: '1',
        label: 'Fuel Expense vs Fuel Gallons',
        children: <DualAxes {...fuelExpenseGallonsChartConfig} />,
      },
      {
        key: '2',
        label: 'Price per Gallon of Fuel',
        children: <Line {...pricePerGallonChartConfig} />,
      },
      {
        key: '3',
        label: '% of Total Operating Expense',
        children: <Column {...fuelExpensePercentageChartConfig} />,
      },
      {
        key: '4',
        label: 'Fuel Expense per ASM',
        children: <Line {...fuelExpensePerASMChartConfig} />,
      },
      {
        key: '5',
        label: 'Fuel Expense per Enplaned Passenger',
        children: <Line {...fuelExpensePerPaxChartConfig} />,
      },
    ];

    return (
      <Card className="custom-card" title="Fuel" style={{ marginTop: '24px' }}>
        <Tabs
          defaultActiveKey="1"
          style={{ marginTop: '-16px' }}
          destroyInactiveTabPane={true}
          items={tabItems}
        />
      </Card>
    );
  }
);

export default FuelStatistics;
