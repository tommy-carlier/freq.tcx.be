function parseInt10(s) {
    return parseInt(s, 10);
}
  
function prevDate(dt) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1);
}

function nextDate(dt) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1);
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
return t.getHours() + ':' + formatTimeComponent(t.getMinutes()) + ':' + formatTimeComponent(t.getSeconds());
}

const DATE_FORMAT_TITLE = { month:'short', day:'numeric', year:'numeric' };
const DATE_FORMAT_NAV = { month:'short', day:'numeric' };

function formatDate(dt, fmt) {
  return Intl.DateTimeFormat([], fmt).format(dt);
}

function formatDateTitle(dt) {
    return formatDate(dt, DATE_FORMAT_TITLE);
}

function formatDateNav(dt) {
    return formatDate(dt, DATE_FORMAT_NAV);
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
    prevDate, nextDate, startOfDay, endOfDay, isToday,
    formatDateTitle, formatDateNav, formatDateIso, formatTimeIso, formatTimeOccurrence, formatOccurrenceTarget,
    parseDateTime, parseOccurrenceTarget
};