import type { DayType, ShiftCalculationResult } from './types';

export function calculateHoursFromTimes(
  startTime: string,
  endTime: string
): number {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  // If end time is earlier, assume next day
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  const totalMs = end.getTime() - start.getTime();
  const totalMinutes = totalMs / (1000 * 60);

  return Math.max(0, totalMinutes / 60);
}

export function calculateShiftPay(
  hourlyRate: number,
  totalHours: number,
  dayType: DayType
): ShiftCalculationResult {
  const rates = getRates(dayType);

  const regularHours = Math.min(totalHours, 8);
  const firstOvertimeHours = Math.min(Math.max(totalHours - 8, 0), 2);
  const extraOvertimeHours = Math.max(totalHours - 10, 0);

  const regularPay = regularHours * hourlyRate * rates.regular;
  const firstOvertimePay = firstOvertimeHours * hourlyRate * rates.firstOvertime;
  const extraOvertimePay = extraOvertimeHours * hourlyRate * rates.extraOvertime;
  const totalPay = regularPay + firstOvertimePay + extraOvertimePay;

  return {
    totalHours,
    regularHours,
    firstOvertimeHours,
    extraOvertimeHours,
    regularPay,
    firstOvertimePay,
    extraOvertimePay,
    totalPay,
    isLongShift: totalHours > 12,
  };
}

function getRates(dayType: DayType) {
  switch (dayType) {
    case "regular":
      return { regular: 1, firstOvertime: 1.25, extraOvertime: 1.5 };
    case "rest":
      return { regular: 1.5, firstOvertime: 1.75, extraOvertime: 2 };
    case "holiday":
      return { regular: 1.5, firstOvertime: 1.75, extraOvertime: 2 };
    case "election":
      return { regular: 2, firstOvertime: 2.5, extraOvertime: 3 };
  }
}