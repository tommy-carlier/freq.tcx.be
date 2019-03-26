import time from './time.js';
import Statistics from './statistics.js';
import ui from './ui.js';

const statsView = ui.fromID('statsView'),
      recentDaysTable = ui.fromID('recentDays'),
      periodStatsTable = ui.fromID('periodStats'),
      timeOfDayChart = ui.fromID('timeOfDay');

function appendPeriodHeaderRow(f, minCount, maxCount) {
  const row = document.createElement('TR');

  ui.appendElementWithText(row, 'TH', 'days');
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

  ui.appendElementWithText(row, 'TD', period.days);
  ui.appendElementWithText(row, 'TD', period.minCount);
  ui.appendElementWithText(row, 'TD', period.averageCount.toFixed(1));
  ui.appendElementWithText(row, 'TD', period.maxCount);

  const barCell = ui.appendElement(row, 'TD');
  const divisor = maxCount - minCount;
  appendBar(barCell, (period.minCount - minCount) / divisor, (period.averageCount - period.minCount) / divisor).classList.add('Light');
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

function appendDayRow(f, date, count, maxCount) {
  const row = document.createElement('TR');
  if(date.getDay() == 1) row.classList.add('BorderTop');

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

function fracTimeToRadians(t) {
  return (t - 6) * Math.PI / 12;
}

function createTimeOfDayLine(dt, opacity) {
  const angle = fracTimeToRadians(time.fractionalTimeOfDay(dt));
  const x = Math.cos(angle), y = Math.sin(angle);
  
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x * 0.1);
  line.setAttribute('y1', y * 0.1);
  line.setAttribute('x2', x * 0.7);
  line.setAttribute('y2', y * 0.7);
  line.setAttribute('vector-effect', 'non-scaling-stroke');
  line.setAttribute('opacity', opacity);
  return line;
}

function createTimeOfDayHourLabel(hour) {
  const angle = fracTimeToRadians(hour);
  const x = Math.cos(angle), y = Math.sin(angle);
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.textContent = hour;
  text.setAttribute('x', x * 0.9);
  text.setAttribute('y', y * 0.9);
  text.setAttribute('text-anchor', 'middle');
  if(hour % 3 != 0) text.setAttribute('opacity', 0.3);
  return text;
}

async function loadStatistics(target) {
  ui.removeAllChildren(periodStatsTable);
  ui.removeAllChildren(recentDaysTable);
  ui.removeAllChildren(timeOfDayChart);
  
  const stats = new Statistics(30);
  const chartFrag = document.createDocumentFragment();

  for(var i = 0; i <= 23; i++) {
    chartFrag.appendChild(createTimeOfDayHourLabel(i));
  }

  var minValue = 0;
  const maxValue = stats.today.valueOf();
  await stats.loadOccurrences(target, dt => {
    const value = dt.valueOf();
    if(minValue == 0) minValue = value;
    const opacity = 0.1 + 0.9 * (value - minValue) / (maxValue - minValue);
    chartFrag.appendChild(createTimeOfDayLine(dt, opacity));
  });

  buildPeriodStatsUI(stats);
  buildRecentDaysUI(stats);
  timeOfDayChart.appendChild(chartFrag);
}

async function navToView(target) {
  ui.navToView(statsView);
  await loadStatistics(target);
}

export { navToView };