import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent } from "@/types";

export type CalendarView = "month" | "week";

export function visibleRange(
  view: CalendarView,
  anchor: Date
): { start: Date; end: Date } {
  if (view === "week") {
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    return { start, end: endOfWeek(anchor, { weekStartsOn: 1 }) };
  }
  return {
    start: startOfMonth(anchor),
    end: endOfMonth(anchor),
  };
}

export function gridDays(view: CalendarView, anchor: Date): Date[] {
  if (view === "week") {
    return eachDayOfInterval(visibleRange("week", anchor));
  }
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function isDayInCurrentMonth(d: Date, anchor: Date): boolean {
  return isSameMonth(d, anchor);
}

export function groupEventsByDay(
  events: CalendarEvent[]
): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};
  for (const e of events) {
    const key = format(e.date.toDate(), "yyyy-MM-dd");
    (map[key] ??= []).push(e);
  }
  return map;
}

export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    if (Boolean(a.allDay) !== Boolean(b.allDay)) {
      return a.allDay ? -1 : 1;
    }
    return (a.startTime || "").localeCompare(b.startTime || "");
  });
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}