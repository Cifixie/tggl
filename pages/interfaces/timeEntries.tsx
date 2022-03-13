export interface DateMeta {
  workday: boolean;
  holiday: boolean;
  weekend: boolean;
  vacation: boolean;
  today: boolean;
  future: boolean;
}

export interface TimeEntry {
  date: string;
  logged: number;
  expected: number;
  balance: number;
  meta: DateMeta;
}

export interface Totals {
  total: number;
  entries?: TimeEntry[];
}
