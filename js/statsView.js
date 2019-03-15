import time from './time.js';
import Statistics from './statistics.js';
import ui from './ui.js';

const statsView = ui.fromID('statsView'),
      last30DaysTable = ui.fromID('statsLast30Days');

function setCountCellContent(cell, count) {
  const countStr = count.toString() + '';
  cell.textContent = countStr;
  if(!countStr.includes('.')) {
    const decSpan = cell.appendChild(document.createElement('SPAN'));
    decSpan.textContent = '.0';
    decSpan.classList.add('Invisible');
  }
}

function appendDayRow(f, label, count, maxCount, rowClass) {
  const row = document.createElement('TR');
  if(rowClass) row.classList.add(rowClass);

  row.appendChild(document.createElement('TD')).textContent = label;
  setCountCellContent(row.appendChild(document.createElement('TD')), count);

  const barCell = row.appendChild(document.createElement('TD'));
  barCell.appendChild(document.createElement('DIV')).style.width = (100 * count / maxCount) + '%';

  f.appendChild(row);
}

function appendDateRow(f, date, count, maxCount) {
  appendDayRow(f, time.formatDateList(date), count, maxCount, date.getDay() == 1 ? 'BorderTop' : null);
}

async function loadLast30DaysTable(target) {
  ui.removeAllChildren(last30DaysTable);
  
  const f = document.createDocumentFragment();
  const today = time.startOfDay(new Date());
  var statistics = new Statistics();
  await statistics.loadOccurrences(target, time.addDays(today, -30), today);
  for(var [date, count] of statistics.dayCounts) {
    appendDateRow(f, date, count, statistics.maxCount);
  }

  if(statistics.totalDays > 0) {
    appendDayRow(f, 'Minimum', statistics.minCount, statistics.maxCount, 'BorderTop');
    appendDayRow(f, 'Average', Math.round(statistics.averageCount * 10) / 10, statistics.maxCount);
    appendDayRow(f, 'Maximum', statistics.maxCount, statistics.maxCount);
  }

  last30DaysTable.appendChild(f);
}

async function navToView(target) {
  ui.navToView(statsView);
  await loadLast30DaysTable(target);
}

export { navToView };