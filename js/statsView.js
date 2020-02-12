import time from './time.js';
import Statistics from './statistics.js';
import ui from './ui.js';

const statsView = ui.fromID('statsView'),
      timeOfDayTable = ui.fromID('timeOfDay'),
      recentDaysTable = ui.fromID('recentDays'),
      periodStatsTable = ui.fromID('periodStats');

function appendPeriodHeaderRow(f, minCount, maxCount) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TH', ' ');
  ui.appendElementWithText(row, 'TH', 'min');
  ui.appendElementWithText(row, 'TH', 'avg');
  ui.appendElementWithText(row, 'TH', 'max');
  ui.appendElementWithText(row, 'TH', minCount + '–' + maxCount);

  f.appendChild(row);
}

function percentStr(num) {
  return (100 * num) + '%';
}

function appendBar(f, x, width) {
  const bar = ui.appendElement(f, 'DIV');
  bar.classList.add('Bar');
  if(x > 0) bar.style.marginLeft = percentStr(x);
  bar.style.width = percentStr(width);
  return bar;
}

function appendPeriodRow(f, period, minCount, maxCount) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TD', period.label);
  ui.appendElementWithText(row, 'TD', period.minCount);
  ui.appendElementWithText(row, 'TD', period.averageCount.toFixed(1));
  ui.appendElementWithText(row, 'TD', period.maxCount);

  const barCell = ui.appendElement(row, 'TD');
  const divisor = maxCount - minCount;
  appendBar(barCell, (period.minCount - minCount) / divisor, (period.averageCount - period.minCount) / divisor).classList.add('light');
  appendBar(barCell, 0, (period.maxCount - period.averageCount) / divisor);

  f.appendChild(row);
}

function buildPeriodStatsUI(stats) {
  const f = document.createDocumentFragment();

  appendPeriodHeaderRow(f, stats.minCount, stats.maxCount);
  for(var period of stats.periods) {
    appendPeriodRow(f, period, stats.minCount, stats.maxCount);
  }

  periodStatsTable.appendChild(f);
}

function appendTimeRow(f, hour, count, maxCount) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TD', hour);
  appendBar(ui.appendElement(row, 'TD'), 0, count / maxCount);

  f.appendChild(row);
}

function buildTimeOfDayUI(stats) {
  const f = document.createDocumentFragment();
  const hourCounts = stats.hourCounts;

  for(var hour = 0; hour < 24; hour++) {
    appendTimeRow(f, hour, hourCounts.get(hour)||0, stats.maxHourCount);
  }

  timeOfDayTable.appendChild(f);
}

function appendDayRow(f, date, count, maxCount) {
  const row = document.createElement('TR');
  if(date.getDay() == 1) row.classList.add('borderTop');

  ui.appendElementWithText(row, 'TD', time.formatDateList(date));
  ui.appendElementWithText(row, 'TD', count);
  appendBar(ui.appendElement(row, 'TD'), 0, count / maxCount);

  f.appendChild(row);
}

function buildRecentDaysUI(stats) {
  const f = document.createDocumentFragment();

  for(var [date, count] of stats.dayCounts) {
    appendDayRow(f, date, count, stats.maxCount);
  }
  
  recentDaysTable.appendChild(f);
}

async function loadStatistics(target) {
  ui.removeAllChildren(periodStatsTable);
  ui.removeAllChildren(timeOfDayTable);
  ui.removeAllChildren(recentDaysTable);
  
  const stats = new Statistics();
  await stats.loadOccurrences(target);

  buildPeriodStatsUI(stats);
  buildTimeOfDayUI(stats);
  buildRecentDaysUI(stats);
}

async function navToView(target) {
  ui.navToView(statsView);
  await loadStatistics(target);
}

export { navToView };