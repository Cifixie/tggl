import formatISO from "date-fns/formatISO";
import parse from "date-fns/parse";
import isSameDay from "date-fns/isSameDay";
import isWeekend from "date-fns/isWeekend";
import isFuture from "date-fns/isFuture";
import isPast from "date-fns/isPast";
import isToday from "date-fns/isToday";
import _holidays from "../../holidays.json";
import _vacations from "../../vacations.json";
import { DateMeta } from "../interfaces/timeEntries";

const holidays = _holidays.map((holiday) => deserializeDate(holiday.date));
const vacations = _vacations.map((holiday) => deserializeDate(holiday.date));

export function getDateMeta(date: Date): DateMeta {
  const vacation = isVacation(date);
  const holiday = isHoliday(date);
  const weekend = isWeekend(date);
  return {
    holiday,
    weekend,
    vacation,
    future: isFuture(date),
    past: isPast(date),
    today: isToday(date),
    workday: !(holiday || vacation || weekend),
  };
}

export function isHoliday(date: Date) {
  return holidays.some((day) => isSameDay(day, date));
}
export function isVacation(date: Date) {
  return vacations.some((day) => isSameDay(day, date));
}

export function serializeDate(date: Date) {
  return formatISO(date, { representation: "date" });
}

export function deserializeDate(date: string) {
  return parse(date, "yyyy-MM-dd", Date.now());
}
