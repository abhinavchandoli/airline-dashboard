export const formatReturn = (value) => {
  if (value === 'N/A' || value === null || value === undefined) {
    return 'N/A';
  } else {
    return `${value.toFixed(2)}%`;
  }
};

export const getStockChartData = (stockData, stockViewRange) => {
  if (!stockData || stockData.length === 0) return [];
  const endDate = new Date();
  let startDate;

  switch (stockViewRange) {
    case '1Y':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case '3Y':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 3);
      break;
    case '5Y':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 5);
      break;
    case 'Max':
      startDate = null;
      break;
    default:
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const filteredData = stockData
    .filter((item) => {
      const date = new Date(item.Date);
      if (startDate) {
        return date >= startDate && date <= endDate;
      } else {
        return date <= endDate;
      }
    })
    .map((item) => {
      const date = new Date(item.Date);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return {
        date: `${year}-${month}-${day}`,
        price: parseFloat(item['Adj Close']),
        volume: parseInt(item.Volume, 10),
      };
    });

  filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
  return filteredData;
};

export const getSeasonalData = (stockData) => {
  if (!stockData || stockData.length === 0) return { seasonalChartData: [], years: [] };

  const endDate = new Date();
  const startYear = endDate.getFullYear() - 3;
  const startDate = new Date(startYear, 0, 1);

  const filteredData = stockData
    .filter((item) => {
      const date = new Date(item.Date);
      const year = date.getFullYear();
      return date >= startDate && date <= endDate && year >= 2020;
    })
    .map((item) => ({
      date: item.Date,
      price: parseFloat(item['Adj Close']),
    }));

  filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

  const dataByYearMonth = {};
  filteredData.forEach((item) => {
    const date = new Date(item.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;
    if (!dataByYearMonth[key]) {
      dataByYearMonth[key] = { total: 0, count: 0, year, month };
    }
    dataByYearMonth[key].total += item.price;
    dataByYearMonth[key].count += 1;
  });

  const seasonalChartData = [];
  Object.values(dataByYearMonth).forEach((item) => {
    seasonalChartData.push({
      month: item.month,
      price: item.total / item.count,
      year: item.year.toString(),
    });
  });

  const years = [...new Set(seasonalChartData.map((item) => item.year))].sort((a, b) => a - b);

  return { seasonalChartData, years };
};
