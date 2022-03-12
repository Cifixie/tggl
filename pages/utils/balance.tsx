import { DateMeta } from "../interfaces/timeEntries";

const workdayInSeconds = 27000;

export function countBalance(seconds: number, meta: DateMeta) {
  if (meta.future) return seconds;
  if (meta.workday) return seconds - workdayInSeconds;
  return seconds;
}
