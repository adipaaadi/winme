import { createBookingId, getLocalBookedSlots } from './bookings';
import { generateSlots } from './slots';
import { getExecutive } from '../data/executives';

const endpoint = (import.meta.env.VITE_APPS_SCRIPT_URL || '').trim();

export const isDemoMode = !endpoint;

export class ApiError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function demoMeetLink() {
  const letters = 'abcdefghijkmnopqrstuvwxyz';
  const pick = (count) =>
    Array.from({ length: count }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  return `https://meet.google.com/${pick(3)}-${pick(4)}-${pick(3)}`;
}

// A fixed hash per executive and slot makes demo availability look lived-in
// without changing between reloads.
function demoTakenSlots(exec, localSlots) {
  const mine = new Set(localSlots.map((iso) => Date.parse(iso)));

  return generateSlots(exec).filter((iso) => {
    if (mine.has(Date.parse(iso))) return false;

    const key = `${exec.id}|${iso}`;
    let hash = 2166136261;
    for (let index = 0; index < key.length; index += 1) {
      hash ^= key.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % 100 < 25;
  });
}

async function post(payload) {
  // Apps Script does not handle CORS preflights, so the body goes as text/plain.
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ApiError('The booking service could not be reached. Please try again.', 'NETWORK');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('The booking service returned an unexpected response.', 'BAD_RESPONSE');
  }

  if (!data.ok) {
    throw new ApiError(data.error || 'Something went wrong. Please try again.', data.code);
  }

  return data;
}

export async function getBookedSlots(execId) {
  if (isDemoMode) {
    const exec = getExecutive(execId);
    if (!exec) return [];

    const local = getLocalBookedSlots(execId);
    return [...local, ...demoTakenSlots(exec, local)];
  }

  const url = new URL(endpoint);
  url.searchParams.set('action', 'booked');
  url.searchParams.set('execId', execId);

  let response;
  try {
    response = await fetch(url.toString());
  } catch {
    throw new ApiError('We could not load availability. Please try again.', 'NETWORK');
  }

  if (!response.ok) {
    throw new ApiError('We could not load availability. Please try again.', 'NETWORK');
  }

  const data = await response.json();
  if (!data.ok) {
    throw new ApiError(data.error || 'We could not load availability.', 'BAD_RESPONSE');
  }

  return Array.isArray(data.booked) ? data.booked : [];
}

export async function createBooking(details) {
  if (isDemoMode) {
    await wait(600);
    return { ok: true, bookingId: createBookingId(), meetLink: demoMeetLink() };
  }

  const data = await post({ type: 'booking', ...details });
  return data;
}

export async function submitExecInterest(details) {
  if (isDemoMode) {
    await wait(900);
    return { ok: true };
  }

  return post({ type: 'exec_interest', ...details });
}
