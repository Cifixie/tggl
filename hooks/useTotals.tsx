import { Dispatch, SetStateAction, useCallback, useState } from "react";
import useSWR from "swr";
import { stringify } from "qs";
import { Totals, TimeEntry } from "../interfaces/timeEntries";
import { serializeDate, deserializeDate } from "../utils/date";

interface Dates {
  start_date: Date;
  end_date: Date;
}

const fetcher = (...args: Parameters<typeof fetch>) => {
  return fetch(...args).then((res) => res.json());
};

const format = ({ end_date, start_date }: Dates) => {
  return stringify(
    { end_date, start_date, with_graph: true },
    {
      addQueryPrefix: true,
      serializeDate,
    }
  );
};

type UseState<T> = Dispatch<SetStateAction<T>>;

export interface DeserializedTimeEntry extends Omit<TimeEntry, "date"> {
  date: Date;
}

function useTotals(): [
  totals: DeserializedTimeEntry[],
  dates: Dates | null,
  setDates: UseState<Dates | null>
] {
  const [dates, setDates] = useState<Dates | null>(null);
  const { data } = useSWR<Totals>(
    dates ? `/api/time_entries/totals${format(dates)}` : null,
    fetcher
  );

  const deserialized =
    data?.entries?.map((d) => ({
      ...d,
      date: deserializeDate(d.date),
    })) ?? [];

  return [deserialized, dates, setDates];
}

export default useTotals;
