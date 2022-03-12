export interface DateMeta {
  workday: boolean;
  holiday: boolean;
  weekend: boolean;
  vacation: boolean;
  today: boolean;
  future: boolean;
  past: boolean;
}

export interface TimeEntry {
  date: string;
  logged: number;
  balance: number | null;
  meta: DateMeta;
}

export interface Totals {
  total: number;
  entries?: TimeEntry[];
}
