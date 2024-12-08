// src/utils/dataTransformations.js
import Big from 'big.js';

/**
 * Maps short region codes to full region names.
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
 * region can be 'All' or full region name (e.g. 'Domestic').
 * If region is a full region name, we convert it using regionMapReverse.
 * If region is 'All', we accept all regions.
 */
export function filterDataByRegionAndYear(data, region, year, regionMap, regionMapReverse) {
  return data.filter((item) => {
    const regionMatch =
      region === 'All' ||
      regionMap[item.REGION] === region ||
      (regionMapReverse[region] && item.REGION === regionMapReverse[region]);

    const yearMatch = year === 'All' || (item.YEAR && item.YEAR.toString() === year);
    return regionMatch && yearMatch;
  });
}

/**
 * Aggregates data by year for a given metric.
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

  return Object.values(aggregated)
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
}

/**
 * Aggregates load factor by year. Load factor = RPM/ASM * 100.
 */
export function aggregateLoadFactorByYear(data, region, regionMap, regionMapReverse) {
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
 */
export function aggregateCASMvsRASMByYear(data, region, regionMap, regionMapReverse) {
  const filteredData = filterDataByRegionAndYear(data, region, 'All', regionMap, regionMapReverse);

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
 * Aggregates Yield by year and converts it to cents per mile.
 */
export function aggregateYieldByYear(data, region, regionMap, regionMapReverse) {
  const filteredData = filterDataByRegionAndYear(data, region, 'All', regionMap, regionMapReverse);

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
      const scaledYield = averageYield * 1e6;

      return {
        YEAR: year,
        value: scaledYield,
      };
    })
    .sort((a, b) => Number(a.YEAR) - Number(b.YEAR));
}
