import data from './data.js';
import time from './time.js';
import ui from './ui.js';

const statsView = ui.fromID('statsView'),
      last30DaysTable = ui.fromID('statsLast30Days');

function appendDayRow(f, label, value, rowClass) {
  const row = document.createElement('TR');
  if(rowClass) row.classList.add(rowClass);

  const dateCell = row.appendChild(document.createElement('TD'));
  dateCell.classList.add('AlignRight');
  dateCell.textContent = label;

  const countCell = row.appendChild(document.createElement('TD'));
  countCell.classList.add('AlignRight');
  countCell.textContent = value;

  const barCell = row.appendChild(document.createElement('TD'));
  barCell.classList.add('AlignLeft');
  const bar = barCell.appendChild(document.createElement('DIV'));
  bar.classList.add('Bar');
  bar.style.width = value + 'em';

  f.appendChild(row);
}

function appendDateRow(f, date, count) {
  appendDayRow(f, time.formatDateList(date), count, date.getDay() == 1 ? 'BorderTop' : null);
}

async function loadLast30DaysTable(target) {
  ui.removeAllChildren(last30DaysTable);
  
  const f = document.createDocumentFragment();
  const today = time.startOfDay(new Date());
  var currentDate = new Date(0), count = 0, minCount = 0, maxCount = 0, totalCount = 0, totalDays = 0;

  function processDay() {
    if(count > 0) {
      appendDateRow(f, currentDate, count);
      if(minCount == 0 || count < minCount) minCount = count;
      if(count > maxCount) maxCount = count;
      totalCount += count;
      totalDays += 1;
    }
  }
  
  await data.getOccurrencesBetween(target, time.addDays(today, -30), today, occ => {
    const date = time.startOfDay(occ);
    if(date.valueOf() != currentDate.valueOf()) {
      processDay();
      currentDate = date;
      count = 0;
    }
    count += 1;
    return true;
  });

  if(count > 0) {
    processDay();
    appendDayRow(f, 'Minimum', minCount, 'BorderTop');
    appendDayRow(f, 'Maximum', maxCount);
    appendDayRow(f, 'Average', Math.round(totalCount / totalDays));
  }

  last30DaysTable.appendChild(f);
}

async function navToView(target) {
  ui.navToView(statsView);
  await loadLast30DaysTable(target);
}

export { navToView };