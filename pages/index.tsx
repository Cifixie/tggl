import Head from "next/head";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import type { NextPage } from "next";
import useTotals from "../hooks/useTotals";
import * as d3 from "d3";
import Calendar from "../sections/Calendar";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [totals, dates, setDates] = useTotals();

  useEffect(() => {
    const date = new Date().setMonth(month);
    setDates({
      start_date: startOfMonth(date),
      end_date: endOfMonth(date),
    });
  }, [setDates, month]);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <select
          value={month}
          onChange={(e) => {
            setMonth(parseInt(e.target.value, 10));
          }}
        >
          <option value="0">Tammi</option>
          <option value="1">Helmi</option>
          <option value="2">Maalis</option>
          <option value="3">Huhti</option>
          <option value="4">Touko</option>
          <option value="5">Kesä</option>
          <option value="6">Heinä</option>
          <option value="7">Elo</option>
          <option value="8">Syys</option>
          <option value="9">Loka</option>
          <option value="10">Marras</option>
          <option value="11">joulu</option>
        </select>
        <button
          onClick={() => {
            setMonth(subMonths(now, 1).getMonth());
          }}
        >
          Last Month
        </button>
        <button
          onClick={() => {
            setMonth(now.getMonth());
          }}
        >
          This Month
        </button>
      </main>
      <section>
        {dates?.start_date ? (
          <h2>{format(dates?.start_date, "MMMM")}</h2>
        ) : null}
        <h3>Hours</h3>
        <table>
          <thead>
            <tr>
              <th>Expected</th>
              <th>Logged</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{(d3.sum(totals, (t) => t.expected) / 3600).toFixed(2)}</td>
              <td>{(d3.sum(totals, (t) => t.logged) / 3600).toFixed(2)}</td>
              <td>{(d3.sum(totals, (t) => t.balance) / 3600).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <hr />
      </section>
      {dates?.start_date && dates?.end_date && (
        <Calendar
          entries={totals}
          startDate={dates.start_date}
          endDate={dates.end_date}
        />
      )}
      <ul>
        {totals
          .filter((t) => t.meta.holiday || t.meta.vacation)
          .map((t) => {
            const meta = Object.entries(t.meta).reduce((days, [key, value]) => {
              if (value) return days.concat(key);
              return days;
            }, [] as string[]);

            return (
              <li key={t.date.toISOString()}>
                <strong>{format(t.date, "dd.MM.yyyy")}</strong>
                <span>{meta.join(", ")}</span>
              </li>
            );
          })}
      </ul>
      <section id="chart"></section>
    </div>
  );
};

export default Home;
