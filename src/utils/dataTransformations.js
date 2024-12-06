// dataTransformations.js
import Big from 'big.js';

/**
 * Maps short region codes to full region names.
 * Example: 'A' -> 'Atlantic'
 */
export const regionMap = {
  A: 'Atlantic',
  L: 'Latin America',
  D: 'Domestic',
  I: 'International',
  P: 'Pacific',
};

/**
 * Reverse mapping of region names to their codes.
 * Example: 'Atlantic' -> 'A'
 */
export const regionMapReverse = {
  Atlantic: 'A',
  'Latin America': 'L',
  Domestic: 'D',
  International: 'I',
  Pacific: 'P',
};

/**
 * Filters data by region and year.
 * 
 * @param {Array} data - The array of data objects.
 * @param {string} region - The selected region (e.g. 'All', 'Domestic', etc.).
 * @param {string} year - The selected year or 'All'.
 * @param {Object} regionMap - The mapping of region codes to region names.
 * @param {Object} regionMapReverse - The reverse mapping of region names to codes.
 * @returns {Array} - The filtered data.
 */
export function filterDataByRegionAndYear(data, region, year, regionMap, regionMapReverse) {
  return data.filter((item) => {
    const regionMatch = region === 'All' || regionMap[item.REGION] === region || item.REGION === regionMapReverse[region];
    const yearMatch = year === 'All' || item.YEAR?.toString() === year;
    return regionMatch && yearMatch;
  });
}

/**
 * Aggregates data by year for a given metric, summing all values for that year.
 * 
 * @param {Array} data - The array of data objects.
 * @param {string} metric - The metric (property name) to aggregate.
 * @returns {Array} - An array of objects { YEAR: string, value: number } sorted by year.
 */
export function aggregateByYear(data, metric) {
  const aggregated = {};
  data.forEach((item) => {
    const year = item.YEAR ? item.YEAR.toString() : null;
    if (!year) return;
    const value = Big(item[metric] || 0);
    if (!aggregated[year]) {
      aggregated[year] = Big(0);
    }
    aggregated[year] = aggregated[year].plus(value);
  });
  return Object.keys(aggregated)
    .map((year) => ({ YEAR: year, value: aggregated[year].toNumber() }))
    .sort((a, b) => Number(a.YEAR) - Number(b.YEAR));
}

/**
 * Aggregates data by year and quarter for a given metric.
 * Useful for stacked column charts by quarter.
 * 
 * @param {Array} data - The array of data objects.
 * @param {string} metric - The metric (property name) to aggregate.
 * @param {string} region - The selected region.
 * @param {Function} filterFunc - A filtering function if needed.
 * @returns {Array} - An array of objects { YEAR: string, QUARTER: string, value: number }.
 */
export function aggregateDataByYearAndQuarter(data, metric, region, regionMap, regionMapReverse) {
  const filteredData = filterDataByRegionAndYear(data, region, 'All', regionMap, regionMapReverse);

  const aggregated = {};
  filteredData.forEach((item) => {
    const year = item.YEAR ? item.YEAR.toString() : null;
    const quarterNumber = item.QUARTER;
    const quarter = quarterNumber ? `Q${quarterNumber}` : null;
    if (!year || !quarter) return;

    const key = `${year}-${quarter}`;
    const value = Big(item[metric] || 0);

    if (!aggregated[key]) {
      aggregated[key] = { YEAR: year, QUARTER: quarter, value: Big(0) };
    }
    aggregated[key].value = aggregated[key].value.plus(value);
  });

  const result = Object.values(aggregated)
    .map((item) => ({
      YEAR: item.YEAR,
      QUARTER: item.QUARTER,
      value: item.value.toNumber(),
    }))
    .sort((a, b) => {
      if (a.YEAR !== b.YEAR) {
        return Number(a.YEAR) - Number(b.YEAR);
      } else {
        return a.QUARTER.localeCompare(b.QUARTER);
      }
    });

  return result;
}

/**
 * Aggregates load factor by year. Load factor is RPM/ASM * 100.
 * 
 * @param {Array} data - The airline data.
 * @param {string} region - The selected region.
 * @returns {Array} - An array of { YEAR: string, value: number } representing load factor per year.
 */
export function aggregateLoadFactorByYear(data, region) {
  const filteredData = filterDataByRegionAndYear(data, region, 'All', regionMap, regionMapReverse);

  const aggregated = {};
  filteredData.forEach((item) => {
    const year = item.YEAR ? item.YEAR.toString() : null;
    if (!year) return;

    const asm = Big(item.ASM || 0);
    const rpm = Big(item.RPM || 0);

    if (!aggregated[year]) {
      aggregated[year] = { totalASM: Big(0), totalRPM: Big(0) };
    }

    aggregated[year].totalASM = aggregated[year].totalASM.plus(asm);
    aggregated[year].totalRPM = aggregated[year].totalRPM.plus(rpm);
  });

  return Object.keys(aggregated)
    .map((year) => {
      const { totalASM, totalRPM } = aggregated[year];
      const loadFactor = totalASM.eq(0) ? 0 : totalRPM.div(totalASM).times(100).toNumber();
      return {
        YEAR: year,
        value: loadFactor,
      };
    })
    .sort((a, b) => Number(a.YEAR) - Number(b.YEAR));
}

/**
 * Aggregates CASM vs RASM by year.
 * CASM and RASM may need scaling depending on source data.
 * 
 * @param {Array} data - The airline data.
 * @param {string} region - The selected region.
 * @returns {Array} - An array of objects { YEAR: string, value: number, type: 'CASM'|'RASM' }
 */
export function aggregateCASMvsRASMByYear(data, region) {
  const filteredData = data.filter((item) => {
    const regionMatch = region === 'All' || regionMap[item.REGION] === region;
    return regionMatch;
  });

  const aggregated = {};
  filteredData.forEach((item) => {
    const year = item.YEAR ? item.YEAR.toString() : null;
    if (!year) return;

    const casm = Big(item.CASM || 0).times(1e6);
    const rasm = Big(item.RASM || 0).times(1e6);

    if (!aggregated[year]) {
      aggregated[year] = { totalCASM: Big(0), totalRASM: Big(0) };
    }
    aggregated[year].totalCASM = aggregated[year].totalCASM.plus(casm);
    aggregated[year].totalRASM = aggregated[year].totalRASM.plus(rasm);
  });

  return Object.keys(aggregated)
    .flatMap((year) => {
      const { totalCASM, totalRASM } = aggregated[year];
      return [
        { YEAR: year, value: totalCASM.toNumber(), type: 'CASM' },
        { YEAR: year, value: totalRASM.toNumber(), type: 'RASM' },
      ];
    })
    .sort((a, b) => Number(a.YEAR) - Number(b.YEAR));
}

/**
 * Aggregates Yield by year.
 * Yield may need to be scaled depending on the original unit.
 * 
 * @param {Array} data - The airline data.
 * @param {string} region - The selected region.
 * @returns {Array} - { YEAR: string, value: number } representing average yield scaled to cents per mile.
 */
export function aggregateYieldByYear(data, region) {
  const filteredData = data.filter((item) => {
    const regionMatch = region === 'All' || item.REGION === regionMapReverse[region];
    return regionMatch;
  });

  const aggregated = {};
  filteredData.forEach((item) => {
    const year = item.YEAR ? item.YEAR.toString() : null;
    if (!year) return;

    const yieldValue = item.YIELD || 0;
    if (!aggregated[year]) {
      aggregated[year] = { totalYield: 0, count: 0 };
    }
    aggregated[year].totalYield += yieldValue;
    aggregated[year].count += 1;
  });

  return Object.keys(aggregated)
    .map((year) => {
      const { totalYield, count } = aggregated[year];
      const averageYield = count ? totalYield / count : 0;

      // Scale the yield to cents per mile if needed
      const scaledYield = averageYield * 1e6;

      return {
        YEAR: year,
        value: scaledYield,
      };
    })
    .sort((a, b) => Number(a.YEAR) - Number(b.YEAR));
}
