// server/api/holidays.get.ts
import { defineEventHandler, getQuery } from "h3";
import ICAL from "ical.js"; // npm i ical.js

const GOOGLE_ICAL_URL =
  "https://calendar.google.com/calendar/ical/en.indonesian%23holiday@group.v.calendar.google.com/public/basic.ics";

/**
 * 1️⃣  Ambil libur nasional dari Google iCal
 * 2️⃣  Gabungkan dengan libur khusus (saat ini kosong)
 * 3️⃣  Kembalikan JSON: { year: 2025, holidays: ["2025-01-01", …] }
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const year = Number(query.year) || new Date().getFullYear();

  // ---------- 1️⃣  Fetch iCal ----------
  const raw = await fetch(GOOGLE_ICAL_URL).then((r) => {
    if (!r.ok) throw new Error(`iCal fetch error ${r.status}`);
    return r.text();
  });

  // ---------- 2️⃣  Parse iCal ----------
  const jcal = ICAL.parse(raw);
  const comp = new ICAL.Component(jcal);
  const events = comp.getAllSubcomponents("vevent");

const national = events
  .map((ev) => new ICAL.Event(ev))
  .filter((ev) => ev.startDate.year === year)
  .map((ev) => {
    const d = ev.startDate.toJSDate();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });


  // ---------- 3️⃣  Libur khusus (sementara kosong) ----------
  const custom: string[] = []; // nanti bisa ambil dari DB

  // ---------- 4️⃣  Gabungkan ----------
  const merged = Array.from(new Set([...national, ...custom]))
    .filter((d) => d.startsWith(String(year))) // pastikan tahun sama
    .sort();

  // ---------- 5️⃣  Return ----------
  return { year, holidays: merged };
});
