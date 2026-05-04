export type DayType = "regular" | "rest" | "holiday" | "election";

export type InputMode = "manual" | "time";

export type ShiftCalculationResult = {
  totalHours: number;
  regularHours: number;
  firstOvertimeHours: number;
  extraOvertimeHours: number;
  regularPay: number;
  firstOvertimePay: number;
  extraOvertimePay: number;
  totalPay: number;
  isLongShift: boolean;
};