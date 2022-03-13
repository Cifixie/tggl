import { useEffect, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  format,
} from "date-fns";
import { DeserializedTimeEntry } from "./useTotals";
import * as d3 from "d3";
import prettyMS from "pretty-ms";
import { Popover } from "react-tiny-popover";
import styles from "../styles/Calendar.module.css";

const scale = d3.scaleThreshold(
  [-5 * 3600, -3 * 3600, -1 * 3600, 0 * 3600, 1 * 3600, 2 * 3600, 3 * 3600],
  [
    "#9b2226",
    "#ca6702",
    "#ee9b00ff",
    "#e9d8a6ff",
    "#94d2bd",
    "#0a9396",
    "#005f73",
  ]
);
const bad = "#ca6702";
const good = "#0a9396";

const getBackgroundColor = ({ meta, ...entry }: DeserializedTimeEntry) => {
  if (typeof entry.balance === "number") {
    if (entry.balance === 0 && meta.vacation) return "#C8C8C8";
    if (entry.balance === 0 && meta.holiday) return "#D0D0D0";
    if (entry.balance === 0 && meta.future) return "#F0F0F0";
    if (entry.balance === 0 && meta.weekend) return "#B8B8B8";
    return scale(entry.balance);
  }
  return "white";
};

interface CalendarProps {
  startDate: Date | number;
  endDate: Date | number;
  entries: DeserializedTimeEntry[];
}
function Calendar({
  entries,
  startDate = Date.now(),
  endDate = Date.now(),
}: CalendarProps) {
  const [isPopOverOpen, openPopOver] = useState<string | null>(null);
  const dateRange =
    startDate && endDate
      ? d3.timeDays(
          startOfWeek(startDate, { weekStartsOn: 1 }),
          endOfWeek(endDate, { weekStartsOn: 1 })
        )
      : [];
  const weekly = d3.rollups(
    dateRange,
    (dates) => {
      const items = dates.map((date) => {
        const entry = entries.find((b) => isSameDay(b.date, date));
        return { date, entry };
      });
      return {
        items,
        total: d3.sum(items, (d) => d?.entry?.balance ?? 0),
      };
    },
    (date) => format(date, "w", { weekStartsOn: 1 })
  );

  return (
    <section className={styles.calendar}>
      <div style={{ display: "contents" }}>
        <div className={styles.cell}></div>
        <div className={styles.cell}>Ma</div>
        <div className={styles.cell}>Ti</div>
        <div className={styles.cell}>Ke</div>
        <div className={styles.cell}>To</div>
        <div className={styles.cell}>Pe</div>
        <div className={styles.cell}>la</div>
        <div className={styles.cell}>su</div>
        <div className={styles.cell}>Total</div>
      </div>
      {weekly.map(([weekNumber, { items, total }]) => {
        return (
          <div key={weekNumber} className={styles.row}>
            <div className={styles.cell}>{weekNumber}</div>
            {items.map(({ date, entry }) => {
              const backgroundColor = entry
                ? getBackgroundColor(entry)
                : "white";
              return (
                <Popover
                  key={date.toISOString()}
                  isOpen={isPopOverOpen === date.toISOString()}
                  positions={["top", "bottom", "left", "right"]} // preferred positions by priority
                  content={
                    <div className={styles.item}>
                      <dl className={styles.popOverDetailsList}>
                        <dt>Logged hours</dt>
                        <dd>
                          {prettyMS(1000 * (entry?.logged ?? 0), {
                            colonNotation: true,
                          })}
                        </dd>
                        <dt>balance</dt>
                        <dd
                          style={{
                            color: (entry?.balance ?? 0) < 0 ? bad : good,
                          }}
                        >
                          {entry?.balance
                            ? prettyMS(1000 * (entry?.balance ?? 0))
                            : null}
                        </dd>
                        {entry?.meta ? (
                          <>
                            <dt>Meta</dt>
                            <dd>
                              {Object.entries(entry?.meta)
                                .filter(([, value]) => value)
                                .map(([key]) => key)
                                .join(", ")}
                            </dd>
                          </>
                        ) : null}
                      </dl>
                    </div>
                  }
                >
                  <div
                    onMouseOver={() => {
                      if (entry?.meta && !entry.meta.future) {
                        openPopOver(date.toISOString());
                      }
                    }}
                    onMouseLeave={() => openPopOver(null)}
                    className={styles.cell}
                    style={{
                      backgroundColor,
                    }}
                  >
                    {date.getDate()}
                  </div>
                </Popover>
              );
            })}
            <div className={styles.totalCell}>
              {prettyMS(total * 1000, { unitCount: 2 })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default Calendar;
