/**
 * WinMe backend — Google Apps Script web app bound to a Google Sheet.
 *
 * Setup is documented in README.md. The short version:
 * 1. Create a Sheet with "Bookings" and "ExecInterest" tabs.
 * 2. Create an Apps Script project, paste this file, enable the Calendar advanced service.
 * 3. Set SHEET_ID, CALENDAR_ID and EXEC_DEMO_EMAIL below.
 * 4. Deploy as a web app: execute as me, access: anyone.
 */

const SHEET_ID = 'PASTE_YOUR_SHEET_ID';
const CALENDAR_ID = 'primary';
const EXEC_DEMO_EMAIL = 'your-spare-address@example.com';

const BOOKINGS_SHEET = 'Bookings';
const INTEREST_SHEET = 'ExecInterest';
const BOOKINGS_HEADERS = [
  'id',
  'createdAt',
  'execId',
  'slot',
  'name',
  'email',
  'role',
  'goal',
  'questions',
  'meetLink',
];
const INTEREST_HEADERS = ['createdAt', 'name', 'email', 'role', 'company', 'linkedin', 'service'];
const ALLOWED_ROLES = ['Student', 'Job seeker', 'Founder'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      fail_('VALIDATION', 'No request body received.');
    }

    // The frontend sends text/plain so the browser skips a CORS preflight that
    // Apps Script cannot answer.
    const data = JSON.parse(e.postData.contents);

    if (data.type === 'booking') {
      return json_(handleBooking_(data));
    }
    if (data.type === 'exec_interest') {
      return json_(handleExecInterest_(data));
    }

    fail_('VALIDATION', 'Unknown request type.');
  } catch (error) {
    return json_({ ok: false, code: error.code || 'ERROR', error: error.message });
  }
}

// Run this once from the editor to trigger the Google consent flow for both services.
function authorize() {
  SpreadsheetApp.openById(SHEET_ID).getName();
  Calendar.CalendarList.list({ maxResults: 1 });
  return 'Authorized';
}

function doGet(e) {
  try {
    const action = (e.parameter || {}).action;

    if (action === 'booked') {
      const execId = String(e.parameter.execId || '').trim();
      if (!execId) fail_('VALIDATION', 'Missing execId.');

      const sheet = getSheet_(BOOKINGS_SHEET, BOOKINGS_HEADERS);
      const rows = sheet.getDataRange().getValues().slice(1);
      const booked = rows
        .filter((row) => String(row[2]) === execId && row[3])
        .map((row) => safeIso_(row[3]))
        .filter(Boolean);

      return json_({ ok: true, booked: booked });
    }

    return json_({ ok: true, service: 'winme' });
  } catch (error) {
    return json_({ ok: false, code: error.code || 'ERROR', error: error.message });
  }
}

function handleBooking_(data) {
  const execId = requireText_(data.execId, 'Executive', 80);
  const execName = String(data.execName || execId).trim().slice(0, 80);
  const slot = requireText_(data.slot, 'Slot', 40);
  const name = requireText_(data.name, 'Name', 80);
  const email = requireEmail_(data.email);
  const role = requireText_(data.role, 'Role', 40);
  const goal = requireText_(data.goal, 'Goal', 600);
  const questions = requireQuestions_(data.questions);

  if (name.length < 2) fail_('VALIDATION', 'Please enter your full name.');
  if (goal.length < 10) fail_('VALIDATION', 'Please describe your goal in a little more detail.');
  if (ALLOWED_ROLES.indexOf(role) === -1) fail_('VALIDATION', 'Choose a valid attendee role.');

  const start = new Date(slot);
  if (isNaN(start.getTime())) fail_('VALIDATION', 'That slot is not a valid time.');
  if (start.getTime() < Date.now() + 5 * 60 * 1000) {
    fail_('VALIDATION', 'That slot has already passed. Please pick another time.');
  }

  const slotKey = start.toISOString();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const sheet = getSheet_(BOOKINGS_SHEET, BOOKINGS_HEADERS);
    const rows = sheet.getDataRange().getValues().slice(1);
    const taken = rows.some(
      (row) => String(row[2]) === execId && row[3] && safeIso_(row[3]) === slotKey,
    );

    if (taken) {
      fail_('SLOT_TAKEN', 'That slot was just booked by someone else. Please pick another time.');
    }

    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const bookingId = 'WM-' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();

    const description = [
      'WinMe advice call with ' + execName + '.',
      'Thirty minutes, advice only. No outcomes are guaranteed.',
      '',
      'Goal:',
      goal,
      '',
      'Questions:',
      questions.map((question) => '- ' + question).join('\n'),
      '',
      'Booking reference: ' + bookingId,
    ].join('\n');

    const attendees = [{ email: email }];
    if (email.toLowerCase() !== EXEC_DEMO_EMAIL.toLowerCase()) {
      attendees.push({ email: EXEC_DEMO_EMAIL });
    }

    const event = Calendar.Events.insert(
      {
        summary: 'WinMe: 30 minutes with ' + execName,
        description: description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees: attendees,
        conferenceData: {
          createRequest: {
            requestId: Utilities.getUuid(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
      CALENDAR_ID,
      { conferenceDataVersion: 1, sendUpdates: 'all' },
    );

    const videoEntry =
      event.conferenceData &&
      event.conferenceData.entryPoints &&
      event.conferenceData.entryPoints.filter(
        (entry) => entry.entryPointType === 'video',
      )[0];
    const meetLink = event.hangoutLink || (videoEntry && videoEntry.uri) || '';

    sheet.appendRow([
      bookingId,
      new Date().toISOString(),
      execId,
      slotKey,
      name,
      email,
      role,
      goal,
      questions.join('\n'),
      meetLink,
    ]);

    return { ok: true, bookingId: bookingId, meetLink: meetLink };
  } finally {
    lock.releaseLock();
  }
}

function handleExecInterest_(data) {
  const name = requireText_(data.name, 'Name', 80);
  const email = requireEmail_(data.email);
  const role = requireText_(data.role, 'Role', 80);
  const company = requireText_(data.company, 'Company', 100);
  const linkedin = requireText_(data.linkedin, 'LinkedIn URL', 300);
  const service = String(data.service || '').trim();

  if (name.length < 2) fail_('VALIDATION', 'Please enter your full name.');
  if (service.length > 400) {
    fail_('VALIDATION', 'Service must be 400 characters or fewer.');
  }
  if (!isLinkedInUrl_(linkedin)) {
    fail_('VALIDATION', 'Please enter a valid LinkedIn URL.');
  }

  const sheet = getSheet_(INTEREST_SHEET, INTEREST_HEADERS);
  sheet.appendRow([new Date().toISOString(), name, email, role, company, linkedin, service]);

  return { ok: true };
}

function isLinkedInUrl_(value) {
  const match = /^https:\/\/([^/?#]+)/i.exec(value);
  if (!match) return false;

  let host = match[1].toLowerCase();
  const at = host.lastIndexOf('@');
  if (at !== -1) host = host.slice(at + 1);
  host = host.replace(/:\d+$/, '');

  return host === 'linkedin.com' || host.endsWith('.linkedin.com');
}

function requireText_(value, field, maxLength) {
  const text = String(value || '').trim();
  if (!text) fail_('VALIDATION', field + ' is required.');
  if (text.length > maxLength) {
    fail_('VALIDATION', field + ' must be ' + maxLength + ' characters or fewer.');
  }
  return text;
}

function requireEmail_(value) {
  const email = requireText_(value, 'Email', 120);
  if (!EMAIL_PATTERN.test(email)) fail_('VALIDATION', 'Please enter a valid email address.');
  return email;
}

function requireQuestions_(value) {
  if (!Array.isArray(value)) fail_('VALIDATION', 'Please add at least two questions.');

  const questions = value
    .map((question) => String(question || '').trim())
    .filter(Boolean);

  if (questions.length < 2) fail_('VALIDATION', 'Please add at least two questions.');
  if (questions.length > 3) fail_('VALIDATION', 'Please add no more than three questions.');

  questions.forEach((question) => {
    if (question.length > 250) {
      fail_('VALIDATION', 'Each question must be 250 characters or fewer.');
    }
  });

  return questions;
}

function getSheet_(name, headers) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    fail_('CONFIG', 'Sheet "' + name + '" was not found. Check the tab name and SHEET_ID.');
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return sheet;
  }

  // Additive headers: an existing sheet keeps its rows when a column is added.
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }

  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  headers.forEach((header, index) => {
    if (current[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });

  return sheet;
}

function safeIso_(value) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

function fail_(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
