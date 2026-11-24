import { DateTime } from 'luxon';

function escapeText(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function utcStamp(date) {
  return date.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
}

export function buildIcs(booking) {
  const start = DateTime.fromISO(booking.slot).toUTC();
  const end = start.plus({ minutes: 30 });

  const questions = (booking.questions || []).map((question) => `- ${question}`).join('\n');
  const description = [
    `WinMe advice call with ${booking.execName}.`,
    'Thirty minutes, advice only. No outcomes are guaranteed.',
    booking.goal ? `\nYour goal:\n${booking.goal}` : '',
    questions ? `\nQuestions to bring:\n${questions}` : '',
    booking.meetLink ? `\nJoin: ${booking.meetLink}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WinMe//Advice calls//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@winme.demo`,
    `DTSTAMP:${utcStamp(DateTime.now())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeText(`WinMe: 30 minutes with ${booking.execName}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(booking.meetLink || 'Google Meet')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return `${lines.join('\r\n')}\r\n`;
}

export function downloadIcs(booking) {
  const blob = new Blob([buildIcs(booking)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `winme-${booking.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
