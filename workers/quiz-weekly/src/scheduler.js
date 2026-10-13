/**
 * Translates "now" into America/New_York wall-clock time and figures out
 * which (if any) of the three weekly slots we're currently in. The cron
 * trigger fires every 15 minutes year-round in UTC; this is the only place
 * that needs to know about EST/EDT, so DST transitions never require a
 * wrangler.toml change.
 */

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Returns { weekday, hour, minute, dateKey } for America/New_York "now". */
export function nowInNewYork(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value;
  const weekdayShort = get('weekday');
  const weekday = WEEKDAYS.find((w) => w.startsWith(weekdayShort)) || weekdayShort;
  let hour = parseInt(get('hour'), 10);
  if (hour === 24) hour = 0; // some ICU implementations emit "24" for midnight with hour12:false
  const minute = parseInt(get('minute'), 10);
  const dateKey = `${get('year')}-${get('month')}-${get('day')}`;

  return { weekday, hour, minute, dateKey };
}

/**
 * A 15-minute-wide window starting exactly at the target hour, matching the
 * "every 15 minutes" cron cadence. E.g. target hour 9 matches NY times 09:00-09:14.
 */
function inWindow(ny, targetHour) {
  return ny.hour === targetHour && ny.minute < 15;
}

/**
 * Returns one of 'generate' | 'reminder' | 'publish' | null for the given
 * NY time. `dateKey` identifies the NY calendar day, used by callers for
 * the KV idempotency marker (so a slot fires at most once even if the cron
 * fires more than once inside the 15-minute window).
 */
export function currentSlot(date = new Date()) {
  const ny = nowInNewYork(date);

  if (ny.weekday === 'Friday' && inWindow(ny, 9)) {
    return { slot: 'generate', dateKey: ny.dateKey };
  }
  if (ny.weekday === 'Saturday' && inWindow(ny, 9)) {
    return { slot: 'reminder', dateKey: ny.dateKey };
  }
  if (ny.weekday === 'Sunday' && inWindow(ny, 22)) {
    return { slot: 'publish', dateKey: ny.dateKey };
  }
  return null;
}

function addDaysToDateKey(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number);
  // Noon UTC keeps us clear of any DST edge when just doing calendar-day math.
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

const WEEKDAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

/**
 * The Monday (UTC date, "YYYY-MM-DD") immediately following "the Friday of
 * the current week" — i.e. the week_start a quiz generated right now would
 * get. Does NOT assume today is actually Friday: it first finds the next
 * Friday on/after today (0 days ahead if today already is Friday) and adds
 * 3 days to that. This keeps the real Friday-9am cron path unchanged while
 * making any manual/admin-triggered generation (run on an arbitrary day,
 * e.g. for testing) land on the same Monday a Friday run that week would
 * have produced, instead of silently drifting to a non-Monday date.
 */
export function nextMondayUtcDateFromFriday(date = new Date()) {
  const ny = nowInNewYork(date);
  const daysUntilFriday = (WEEKDAY_INDEX.Friday - WEEKDAY_INDEX[ny.weekday] + 7) % 7;
  const friday = addDaysToDateKey(ny.dateKey, daysUntilFriday);
  return addDaysToDateKey(friday, 3);
}

/** True if `dateKey` ("YYYY-MM-DD") falls on a Monday (UTC calendar date). */
export function isMondayDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay() === 1;
}

/**
 * The "target Sunday" for a quiz is the Sunday right before its week_start
 * Monday — i.e. the Sunday 2 days after the Friday it was generated on.
 * Publication must never happen before this date's 10pm America/New_York.
 */
export function targetSundayFromWeekStart(weekStart) {
  return addDaysToDateKey(weekStart, -1);
}

/**
 * True once "now" (America/New_York) is at or after 22:00 on the draft's
 * target Sunday. False both before that Sunday and before 22:00 on it —
 * an approved quiz must never publish earlier than this, regardless of
 * whether publish was triggered by the weekly cron or a manual/admin call.
 */
export function hasReachedTargetPublishTime(weekStart, date = new Date()) {
  const ny = nowInNewYork(date);
  const targetSunday = targetSundayFromWeekStart(weekStart);
  if (ny.dateKey > targetSunday) return true;
  if (ny.dateKey < targetSunday) return false;
  return ny.hour >= 22;
}
