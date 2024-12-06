// useOperatingKPIs.js
import { useMemo } from 'react';
import Big from 'big.js';

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

export default function useOperatingKPIs(operatingData, operatingSelectedYear, operatingSelectedCategory) {
  return useMemo(() => {
    if (!operatingData || operatingData.length === 0) {
      return {
        totalAirOpExpenses: Big(0),
        totalFlyOpExpenses: Big(0),
        totalFuelOilExpense: Big(0),
        totalFlightMaintenanceExpense: Big(0),
        operatingFleet: 0,
        airborneHours: Big(0),
        aircraftFuelGallons: Big(0),
        departuresPerAircraft: 0,
      };
    }

    const filteredData = operatingData.filter((item) => {
      const yearMatch = operatingSelectedYear === 'All' || item.YEAR?.toString() === operatingSelectedYear;
      const categoryMatch = operatingSelectedCategory === 'All' || item.AIRCRAFT_CATEGORIZATION === operatingSelectedCategory;
      return yearMatch && categoryMatch;
    });

    let totalAirOpExpenses = Big(0);
    let totalFlyOpExpenses = Big(0);
    let totalFuelOilExpense = Big(0);
    let totalFlightMaintenanceExpense = Big(0);
    let totalAirDaysEquip = Big(0);
    let totalHoursAirborne = Big(0);
    let totalAircraftFuelGallons = Big(0);
    let totalRevAircraftDepPerf = Big(0);

    const yearsSet = new Set();

    filteredData.forEach((item) => {
      totalAirOpExpenses = totalAirOpExpenses.plus(Big(item.TOT_AIR_OP_EXPENSES || 0));
      totalFlyOpExpenses = totalFlyOpExpenses.plus(Big(item.TOT_FLY_OPS || 0));
      const fuelFlyOps = Big(item.FUEL_FLY_OPS || 0);
      const oilFlyOps = Big(item.OIL_FLY_OPS || 0);
      totalFuelOilExpense = totalFuelOilExpense.plus(fuelFlyOps.plus(oilFlyOps));
      totalFlightMaintenanceExpense = totalFlightMaintenanceExpense.plus(Big(item.TOT_DIR_MAINT || 0));

      const airDaysEquip = Big(item.AIR_DAYS_EQUIP_810 || 0);
      const year = item.YEAR;
      yearsSet.add(year);
      totalAirDaysEquip = totalAirDaysEquip.plus(airDaysEquip);

      totalHoursAirborne = totalHoursAirborne.plus(Big(item.HOURS_AIRBORNE_650 || 0));
      totalAircraftFuelGallons = totalAircraftFuelGallons.plus(Big(item.AIRCRAFT_FUELS_921 || 0));
      totalRevAircraftDepPerf = totalRevAircraftDepPerf.plus(Big(item.REV_ACRFT_DEP_PERF_510 || 0));
    });

    let totalDaysInYears = 0;
    yearsSet.forEach((year) => {
      totalDaysInYears += getDaysInYear(year);
    });

    const operatingFleet = totalDaysInYears === 0 ? 0 : totalAirDaysEquip.div(totalDaysInYears).toNumber();
    const departuresPerAircraft = operatingFleet === 0 ? 0 : totalRevAircraftDepPerf.div(operatingFleet).toNumber();

    return {
      totalAirOpExpenses,
      totalFlyOpExpenses,
      totalFuelOilExpense,
      totalFlightMaintenanceExpense,
      operatingFleet,
      airborneHours: totalHoursAirborne,
      aircraftFuelGallons: totalAircraftFuelGallons,
      departuresPerAircraft,
    };
  }, [operatingData, operatingSelectedYear, operatingSelectedCategory]);
}
