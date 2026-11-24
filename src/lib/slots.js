import { DateTime } from 'luxon';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const SLOT_MINUTES = 30;
const DAYS_AHEAD = 14;

export function generateSlots(exec, now = DateTime.now()) {
  const slots = [];
  const firstDay = now.setZone(exec.timezone).startOf('day');

  for (let dayIndex = 0; dayIndex < DAYS_AHEAD; dayIndex += 1) {
    const day = firstDay.plus({ days: dayIndex });
    const dayKey = DAY_KEYS[day.weekday % 7];
    const window = exec.weeklyAvailability[dayKey];
    if (!window) continue;

    const [open, close] = window;
    let start = DateTime.fromISO(`${day.toISODate()}T${open}`, { zone: exec.timezone });
    const end = DateTime.fromISO(`${day.toISODate()}T${close}`, { zone: exec.timezone });

    while (start < end) {
      if (start > now.plus({ hours: 1 })) {
        slots.push(start.toUTC().toISO());
      }
      start = start.plus({ minutes: SLOT_MINUTES });
    }
  }

  return slots.sort();
}

export function nextFreeSlot(exec, booked = []) {
  const taken = new Set(booked.map((iso) => DateTime.fromISO(iso).toMillis()));
  return generateSlots(exec).find((iso) => !taken.has(DateTime.fromISO(iso).toMillis())) || null;
}

export function localTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function zoneLabel() {
  const now = DateTime.now();
  const offset = now.offsetNameShort || now.toFormat('ZZ');
  return `${localTimeZone()} (${offset})`;
}

function slotDateTime(iso) {
  return DateTime.fromISO(iso).toLocal();
}

export function formatSlotLong(iso) {
  return slotDateTime(iso).toFormat("cccc d LLLL 'at' HH:mm");
}

export function groupSlotsByDay(slots) {
  const days = new Map();

  for (const iso of slots) {
    const date = slotDateTime(iso).startOf('day');
    const key = date.toISODate();
    if (!days.has(key)) {
      days.set(key, { key, date, slots: [] });
    }
    days.get(key).slots.push(iso);
  }

  return [...days.values()].sort((a, b) => a.date.toMillis() - b.date.toMillis());
}


