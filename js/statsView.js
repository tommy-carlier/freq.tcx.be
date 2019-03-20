import time from './time.js';
import Statistics from './statistics.js';
import ui from './ui.js';

const statsView = ui.fromID('statsView'),
      recentDaysTable = ui.fromID('recentDays'),
      periodStatsTable = ui.fromID('periodStats');

function appendPeriodHeaderRow(f) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TH', ' ');
  ui.appendElementWithText(row, 'TH', 'Minimum');
  ui.appendElementWithText(row, 'TH', 'Average');
  ui.appendElementWithText(row, 'TH', 'Maximum');

  f.appendChild(row);
}

function appendPeriodDataRow(f, period) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TD', period.days + ' days').setAttribute('rowspan', 2);
  ui.appendElementWithText(row, 'TD', period.minCount);
  ui.appendElementWithText(row, 'TD', Math.round(period.averageCount * 10) / 10);
  ui.appendElementWithText(row, 'TD', period.maxCount);

  f.appendChild(row);
}

function appendPeriodBarRow(f, period, maxCount) {
  const row = document.createElement('TR');
  row.classList.add('HasBar');

  const cell = ui.appendElement(row, 'TD');
  cell.setAttribute('colspan', 3);

  const barMin = ui.appendElement(cell, 'DIV');
  barMin.classList.add('Bar');
  barMin.classList.add('Light');
  barMin.style.marginLeft = (100 * period.minCount / maxCount) + '%';
  barMin.style.width = (100 * (period.averageCount - period.minCount) / maxCount) + '%';

  const barMax = ui.appendElement(cell, 'DIV');
  barMax.classList.add('Bar');
  barMax.style.width = (100 * (period.maxCount - period.averageCount) / maxCount) + '%';

  f.appendChild(row);
}

function buildPeriodStatsUI(statistics) {
  const f = document.createDocumentFragment();

  appendPeriodHeaderRow(f);
  for(var period of statistics.periods) {
    appendPeriodDataRow(f, period);
    appendPeriodBarRow(f, period, statistics.maxCount);
  }

  periodStatsTable.appendChild(f);
}

function appendDayRow(f, date, count, maxCount) {
  const row = document.createElement('TR');
  if(date.getDay() == 1) row.classList.add('BorderTop');

  ui.appendElementWithText(row, 'TD', time.formatDateList(date));
  ui.appendElementWithText(row, 'TD', count);

  const bar = ui.appendElement(ui.appendElement(row, 'TD'), 'DIV');
  bar.classList.add('Bar');
  bar.style.width = (100 * count / maxCount) + '%';

  f.appendChild(row);
}

function buildRecentDaysUI(statistics) {
  const f = document.createDocumentFragment();

  for(var [date, count] of statistics.dayCounts) {
    appendDayRow(f, date, count, statistics.maxCount);
  }
  
  recentDaysTable.appendChild(f);
}

async function loadStatistics(target) {
  ui.removeAllChildren(periodStatsTable);
  ui.removeAllChildren(recentDaysTable);
  
  var statistics = new Statistics(30);
  await statistics.loadOccurrences(target);

  buildPeriodStatsUI(statistics);
  buildRecentDaysUI(statistics);
}

async function navToView(target) {
  ui.navToView(statsView);
  await loadStatistics(target);
}

export { navToView };