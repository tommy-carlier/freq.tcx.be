import time from './time.js';
import Statistics from './statistics.js';
import ui from './ui.js';

const statsView = ui.fromID('statsView'),
      periodStatsTable = ui.fromID('periodStats'),
      weekDayStatsTable = ui.fromID('weekDayStats'),
      freqDistTable = ui.fromID('freqDist'),
      timeOfDayTable = ui.fromID('timeOfDay'),
      recentDaysTable = ui.fromID('recentDays');

function appendStatHeader(f) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TH', ' ');
  ui.appendElementWithText(row, 'TH', 'min');
  ui.appendElementWithText(row, 'TH', 'avg');
  ui.appendElementWithText(row, 'TH', 'max');
  ui.appendElementWithText(row, 'TH', '');

  f.appendChild(row);
}

function percentStr(num) {
  return (100 * num) + '%';
}

function appendBar(f, x, width) {
  const bar = ui.appendElement(f, 'DIV');
  bar.classList.add('Bar');
  if(x > 0) {
    if(x > 0.99) x = 0.99;
    bar.style.marginLeft = percentStr(x);
  }
  bar.style.width = percentStr(width);
  return bar;
}

function appendStatRow(f, bucket, maxCount) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TD', bucket.label);
  ui.appendElementWithText(row, 'TD', bucket.minCount);
  ui.appendElementWithText(row, 'TD', bucket.averageCount.toFixed(1));
  ui.appendElementWithText(row, 'TD', bucket.maxCount);

  const barCell = ui.appendElement(row, 'TD');
  appendBar(barCell, bucket.minCount / maxCount, (bucket.averageCount - bucket.minCount) / maxCount).classList.add('light');
  appendBar(barCell, 0, (bucket.maxCount - bucket.averageCount) / maxCount);

  f.appendChild(row);
}

function buildStatsUI(table, buckets, maxCount) {
  const f = document.createDocumentFragment();

  appendStatHeader(f);
  for(var bucket of buckets) {
    appendStatRow(f, bucket, maxCount);
  }

  table.appendChild(f);
}

function appendFreqDistHeader(f) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TH', 'freq');
  ui.appendElementWithText(row, 'TH', 'count');
  ui.appendElementWithText(row, 'TH', '');

  f.appendChild(row);
}

function appendFreqDistRow(f, freq, count, maxCount) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TD', freq);
  ui.appendElementWithText(row, 'TD', count);
  appendBar(ui.appendElement(row, 'TD'), 0, count / maxCount);

  f.appendChild(row);
}

function buildFreqDistUI(stats) {
  const f = document.createDocumentFragment();

  appendFreqDistHeader(f);
  for(var i = 0; i <= stats.maxCount; i++) {
    appendFreqDistRow(f, i, stats.freqDist.get(i)||0, stats.maxFreqCount);
  }

  freqDistTable.appendChild(f);
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
  ui.removeAllChildren(weekDayStatsTable);
  ui.removeAllChildren(freqDistTable);
  ui.removeAllChildren(timeOfDayTable);
  ui.removeAllChildren(recentDaysTable);
  
  const stats = new Statistics();
  await stats.loadOccurrences(target);

  buildStatsUI(periodStatsTable, stats.periodBuckets, stats.maxCount);
  buildStatsUI(weekDayStatsTable, stats.weekDayBuckets, stats.maxCount);
  buildFreqDistUI(stats);
  buildTimeOfDayUI(stats);
  buildRecentDaysUI(stats);
}

async function navToView(target) {
  ui.navToView(statsView);
  await loadStatistics(target);
}

export { navToView };