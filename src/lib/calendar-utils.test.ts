import { describe, expect, it } from "vitest";
import { differenceInCalendarDays } from "date-fns";
import { Timestamp } from "firebase/firestore";
import {
  capitalize,
  gridDays,
  groupEventsByDay,
  isDayInCurrentMonth,
  sortEvents,
  visibleRange,
} from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/types";

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: "e1",
    title: "Evento",
    date: Timestamp.fromDate(new Date(2026, 1, 10, 9, 0)),
    ...overrides,
  };
}

describe("visibleRange", () => {
  it("restituisce il mese intero per la vista mese", () => {
    const { start, end } = visibleRange(
      "month",
      new Date(2026, 7, 15) // agosto 2026
    );
    expect(start.getMonth()).toBe(7);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(7);
    expect(end.getDate()).toBe(31);
  });

  it("restituisce la settimana (Lun-Dom) per la vista settimana", () => {
    const anchor = new Date(2026, 7, 15); // sabato 15 agosto 2026
    const { start, end } = visibleRange("week", anchor);
    expect(start.getDay()).toBe(1); // lunedì
    expect(end.getDay()).toBe(0); // domenica
    expect(differenceInCalendarDays(end, start)).toBe(6);
  });
});

describe("gridDays", () => {
  it("vista mese: 42 celle (6 settimane)", () => {
    const days = gridDays("month", new Date(2026, 7, 1));
    expect(days).toHaveLength(42);
  });

  it("vista settimana: 7 celle", () => {
    const days = gridDays("week", new Date(2026, 7, 15));
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1);
  });
});

describe("isDayInCurrentMonth", () => {
  it("riconosce i giorni fuori mese", () => {
    const anchor = new Date(2026, 7, 1);
    expect(isDayInCurrentMonth(new Date(2026, 7, 10), anchor)).toBe(true);
    expect(isDayInCurrentMonth(new Date(2026, 6, 31), anchor)).toBe(false);
  });
});

describe("groupEventsByDay", () => {
  it("raggruppa per giorno in formato yyyy-MM-dd", () => {
    const a = event({ id: "a", date: Timestamp.fromDate(new Date(2026, 7, 3, 10)) });
    const b = event({ id: "b", date: Timestamp.fromDate(new Date(2026, 7, 3, 18)) });
    const c = event({ id: "c", date: Timestamp.fromDate(new Date(2026, 7, 4, 8)) });
    const map = groupEventsByDay([a, b, c]);
    expect(map["2026-08-03"]).toHaveLength(2);
    expect(map["2026-08-04"]).toHaveLength(1);
  });
});

describe("sortEvents", () => {
  it("mette prima gli eventi tutto il giorno, poi per orario", () => {
    const afternoon = event({
      id: "p",
      allDay: false,
      startTime: "18:00",
      endTime: "20:00",
    });
    const morning = event({
      id: "m",
      allDay: false,
      startTime: "09:00",
    });
    const allDay = event({ id: "a", allDay: true });
    expect(sortEvents([afternoon, morning, allDay].map((e) => e))).toEqual([
      allDay,
      morning,
      afternoon,
    ]);
  });
});

describe("capitalize", () => {
  it("capitalizza la prima lettera", () => {
    expect(capitalize("agosto 2026")).toBe("Agosto 2026");
    expect(capitalize("A")).toBe("A");
  });
});