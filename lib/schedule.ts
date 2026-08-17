import type { DayId, ScheduleDay } from "./types";

/** Fixed weekday order and labels — these can never be changed by the client. */
export const WEEKDAYS: { day: DayId; label: string }[] = [
  { day: "monday", label: "MÅN" },
  { day: "tuesday", label: "TIS" },
  { day: "wednesday", label: "ONS" },
  { day: "thursday", label: "TOR" },
  { day: "friday", label: "FRE" },
  { day: "saturday", label: "LÖR" },
  { day: "sunday", label: "SÖN" },
];

export const ACTIVITY_MAX = 60;

/** Format one "HH:MM" endpoint: whole hours drop the minutes ("12:00" → "12"). */
export function formatHour(time: string): string {
  const [h, m] = time.split(":");
  const hour = Number(h);
  return m === "00" ? String(hour) : `${hour}:${m}`;
}

/** Right-hand column text for a day: "Stängt" or e.g. "12–18" / "12:30–16". */
export function formatRange(d: ScheduleDay): string {
  if (d.closed || !d.opensAt || !d.closesAt) return "Stängt";
  return `${formatHour(d.opensAt)}–${formatHour(d.closesAt)}`;
}

/**
 * Validate a draft schedule. Returns a map of dayId → Swedish error message
 * for every day that fails. An empty map means the schedule is valid.
 */
export function validateSchedule(days: ScheduleDay[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const d of days) {
    if (d.description.length > ACTIVITY_MAX) {
      errors[d.day] = `Aktivitetstexten får vara högst ${ACTIVITY_MAX} tecken.`;
      continue;
    }
    if (d.closed) continue;
    if (!d.opensAt || !d.closesAt) {
      errors[d.day] = "Ange både öppnings- och stängningstid när dagen är öppen.";
      continue;
    }
    if (d.opensAt >= d.closesAt) {
      errors[d.day] = "Öppningstiden måste vara före stängningstiden.";
    }
  }
  return errors;
}
