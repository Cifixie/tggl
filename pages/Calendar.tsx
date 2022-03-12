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

interface CalendarProps {
  dates: Date[];
  entries: DeserializedTimeEntry[];
}
function Calendar({ entries, dates }: CalendarProps) {
  const [isPopOverOpen, openPopOver] = useState<string | null>(null);
  const now = Date.now();

  const weekly = d3.rollups(
    dates,
    (dates) => {
      const items = dates.map((date) => {
        const balance = entries.find((b) => isSameDay(b.date, date));
        return { time: date, ...balance };
      });
      return {
        items,
        total: d3.sum(items, (d) => d.balance ?? 0),
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
            {items.map(({ time, balance, logged, meta }) => {
              const background = meta?.vacation
                ? "gray"
                : balance !== null && balance !== undefined
                ? scale(balance)
                : "white";
              return (
                <Popover
                  key={time.toISOString()}
                  isOpen={isPopOverOpen === time.toISOString()}
                  positions={["top", "bottom", "left", "right"]} // preferred positions by priority
                  content={
                    <div className={styles.item}>
                      <dl className={styles.popOverDetailsList}>
                        <dt>logged</dt>
                        <dd>
                          {prettyMS(1000 * (logged ?? 0), {
                            colonNotation: true,
                          })}
                        </dd>
                        <dt>balance</dt>
                        <dd>
                          {balance ? prettyMS(1000 * (balance ?? 0)) : null}
                        </dd>
                      </dl>
                    </div>
                  }
                >
                  <div
                    onMouseOver={
                      logged ? () => openPopOver(time.toISOString()) : undefined
                    }
                    onMouseLeave={() => openPopOver(null)}
                    className={styles.cell}
                    style={{
                      background,
                    }}
                  >
                    {time.getDate()}
                  </div>
                </Popover>
              );
            })}
            <div className={styles.cell}>{prettyMS(total * 1000)}</div>
          </div>
        );
      })}
    </section>
  );
}

export default Calendar;
