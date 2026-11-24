const STORAGE_KEY = 'winme.bookings.v1';

export function getBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getBooking(id) {
  return getBookings().find((booking) => booking.id === id) || null;
}

export function saveBooking(booking) {
  try {
    const existing = getBookings().filter((item) => item.id !== booking.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...existing]));
  } catch {
    // Storage can be unavailable in private windows; the booking still succeeded.
  }
}

export function getLocalBookedSlots(execId) {
  return getBookings()
    .filter((booking) => booking.execId === execId)
    .map((booking) => booking.slot);
}

export function clearBookings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private windows.
  }
}

export function createBookingId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const suffix = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join('');
  return `WM-${suffix}`;
}
