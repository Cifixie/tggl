// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import { addDays } from "date-fns";
import { Totals } from "../../../interfaces/timeEntries";
import { ApiTimeEntriesTotals } from "../../../interfaces/tggl";
import {
  serializeDate,
  deserializeDate,
  getDateMeta,
} from "../../../utils/date";

const workspace = "1557980";
const basePath = `https://track.toggl.com/reports/api/v3/workspace/${workspace}/search`;

function createHeaders(headers = new Headers()) {
  headers.append("Content-Type", "application/json");
  headers.append(
    "Authorization",
    "Basic ZDk3YmJkM2Q1NGRkNTY1ZTM2NTcxZTA5NjljZjMwYjA6YXBpX3Rva2Vu"
  );
  return headers;
}

function initPostRequest(body: string, headers?: any) {
  return {
    method: "POST",
    headers: createHeaders(headers),
    body,
  };
}

function createBody(startTime: Date, endTime: Date, withGraph: boolean) {
  return JSON.stringify({
    start_date: serializeDate(startTime),
    end_date: serializeDate(endTime),
    with_graph: withGraph,
    collapse: true,
  });
}

function parseQuery(query: Record<string, string | string[]>) {
  return {
    startTime: deserializeDate(query.start_date as string),
    endTime: deserializeDate(query.end_date as string),
    withGraph: query.with_graph === "true",
  };
}

const workdayInSeconds = 27000;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Totals>
) {
  const { startTime, endTime, withGraph } = parseQuery(req.query);

  fetch(
    basePath + "/time_entries/totals",
    initPostRequest(createBody(startTime, endTime, withGraph))
  )
    .then((r) => r.json() as Promise<ApiTimeEntriesTotals>)
    .then((json) => ({
      total: json.seconds,
      entries: json.graph?.map(({ seconds }, i) => {
        const date = addDays(startTime, i);
        const meta = getDateMeta(date);
        const expected = meta.workday && !meta.future ? workdayInSeconds : 0;
        return {
          date: serializeDate(date),
          logged: seconds,
          balance: seconds - expected,
          expected,
          meta,
        };
      }),
    }))
    .then(res.status(200).json)
    .catch((e) => res.status(500).json(e));
}
