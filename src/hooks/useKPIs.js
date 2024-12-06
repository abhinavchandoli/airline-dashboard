// useKPIs.js
import { useMemo } from 'react';
import Big from 'big.js';
import { filterDataByRegionAndYear } from '../utils/dataTransformations';

export default function useKPIs(airlineData, kpiSelectedRegion, kpiSelectedYear, regionMap, regionMapReverse) {
  return useMemo(() => {
    if (!airlineData || airlineData.length === 0) {
      return {
        departures: 0,
        distance: 0,
        passengers: 0,
        loadFactor: 0,
        transRevPax: 0,
        opExpenses: 0,
        opRevenue: 0,
        airTime: 0,
      };
    }

    const filteredData = filterDataByRegionAndYear(airlineData, kpiSelectedRegion, kpiSelectedYear, regionMap, regionMapReverse);

    let totalDepartures = Big(0);
    let totalDistance = Big(0);
    let totalPassengers = Big(0);
    let totalASM = Big(0);
    let totalRPM = Big(0);
    let totalTransRevPax = Big(0);
    let totalOpExpenses = Big(0);
    let totalRevenue = Big(0);
    let totalAirTime = Big(0);

    filteredData.forEach((item) => {
      totalDepartures = totalDepartures.plus(Big(item.DEPARTURES_PERFORMED));
      totalDistance = totalDistance.plus(Big(item.DISTANCE));
      totalPassengers = totalPassengers.plus(Big(item.PASSENGERS));
      totalASM = totalASM.plus(Big(item.ASM));
      totalRPM = totalRPM.plus(Big(item.RPM));
      totalTransRevPax = totalTransRevPax.plus(Big(item.TRANS_REV_PAX || 0));
      totalOpExpenses = totalOpExpenses.plus(Big(item.OP_EXPENSES || 0));
      totalRevenue = totalRevenue.plus(Big(item.OP_REVENUES || 0));
      totalAirTime = totalAirTime.plus(Big(item.AIR_TIME || 0));
    });

    const avgLoadFactor = totalASM.eq(0) ? 0 : totalRPM.div(totalASM).times(100).toNumber();

    return {
      departures: totalDepartures,
      distance: totalDistance,
      passengers: totalPassengers,
      loadFactor: Number(avgLoadFactor.toFixed(2)),
      transRevPax: totalTransRevPax,
      opExpenses: totalOpExpenses,
      opRevenue: totalRevenue,
      airTime: totalAirTime,
    };
  }, [airlineData, kpiSelectedRegion, kpiSelectedYear, regionMap, regionMapReverse]);
}
