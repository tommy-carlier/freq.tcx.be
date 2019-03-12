function parseInt10(s) {
    return parseInt(s, 10);
}

function addDays(dt, days) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + days);
}
  
function prevDate(dt) {
    return addDays(dt, -1);
}

function nextDate(dt) {
    return addDays(dt, 1);
}

function startOfDay(dt) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

function endOfDay(dt) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59, 999);
}

function isToday(dt) {
    const today = new Date();
    return today.getFullYear() == dt.getFullYear() 
        && today.getMonth() == dt.getMonth()
        && today.getDate() == dt.getDate();
}

function formatTimeComponent(c) {
    return c < 10 ? '0' + c : c;
}

function formatDateIso(d) {
return d.getFullYear() + '-' + formatTimeComponent(d.getMonth()+1) + '-' + formatTimeComponent(d.getDate());
}

function formatTimeIso(t) {
return formatTimeComponent(t.getHours()) + ':' + formatTimeComponent(t.getMinutes()) + ':' + formatTimeComponent(t.getSeconds());
}

const DATE_FORMAT_TITLE = { year:'numeric', month:'short', day:'numeric' };
const DATE_FORMAT_NAV = { month:'short', day:'numeric' };
const DATE_FORMAT_LIST = { year:'numeric', month:'2-digit', day:'2-digit', weekday:'short' };

function formatDate(dt, fmt) {
  return Intl.DateTimeFormat([], fmt).format(dt);
}

function formatDateTitle(dt) {
    return formatDate(dt, DATE_FORMAT_TITLE);
}

function formatDateNav(dt) {
    return formatDate(dt, DATE_FORMAT_NAV);
}

function formatDateList(dt) {
    return formatDate(dt, DATE_FORMAT_LIST);
}

function formatTimeOccurrence(dt) {
    return dt.toLocaleTimeString();
}

function formatOccurrenceTarget(type, dt) {
    return type + '/' + dt.valueOf();
}

const regexParseDateTime = /^([0-9]+)-([0-9]+)-([0-9]+) ([0-9]+):([0-9]+)/;
function parseDateTime(d, t) {
  const match = regexParseDateTime.exec(d + ' ' + t);
  if(match) return new Date(
    parseInt10(match[1]), parseInt10(match[2])-1, parseInt10(match[3]),
    parseInt10(match[4]), parseInt10(match[5]));
}

const regexSplitEditTarget = /^(.+)\/(.+)$/;
function parseOccurrenceTarget(target) {
    const match = regexSplitEditTarget.exec(target);
    if(match) {
      return { type: match[1], dateTime: new Date(parseInt10(match[2])) };
    }
  }

export default {
    addDays, prevDate, nextDate, startOfDay, endOfDay, isToday,
    formatDateTitle, formatDateNav, formatDateList, formatDateIso, formatTimeIso,
    formatTimeOccurrence, formatOccurrenceTarget,
    parseDateTime, parseOccurrenceTarget
};