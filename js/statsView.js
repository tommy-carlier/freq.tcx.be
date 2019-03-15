import time from './time.js';
import Statistics from './statistics.js';
import ui from './ui.js';

const statsView = ui.fromID('statsView'),
      last30DaysTable = ui.fromID('statsLast30Days');

function appendDayRow(f, label, value, rowClass) {
  const row = document.createElement('TR');
  if(rowClass) row.classList.add(rowClass);

  row.appendChild(document.createElement('TD')).textContent = label;
  row.appendChild(document.createElement('TD')).textContent = value;

  const barCell = row.appendChild(document.createElement('TD'));
  barCell.appendChild(document.createElement('DIV')).style.width = value + 'em';

  f.appendChild(row);
}

function appendDateRow(f, date, count) {
  appendDayRow(f, time.formatDateList(date), count, date.getDay() == 1 ? 'BorderTop' : null);
}

async function loadLast30DaysTable(target) {
  ui.removeAllChildren(last30DaysTable);
  
  const f = document.createDocumentFragment();
  const today = time.startOfDay(new Date());
  var statistics = new Statistics();
  await statistics.loadOccurrences(target, time.addDays(today, -30), today);
  for(var [date, count] of statistics.dayCounts) {
    appendDateRow(f, date, count);
  }

  if(statistics.totalDays > 0) {
    appendDayRow(f, 'Minimum', statistics.minCount, 'BorderTop');
    appendDayRow(f, 'Maximum', statistics.maxCount);
    appendDayRow(f, 'Average', Math.round(statistics.averageCount));
  }

  last30DaysTable.appendChild(f);
}

async function navToView(target) {
  ui.navToView(statsView);
  await loadLast30DaysTable(target);
}

export { navToView };