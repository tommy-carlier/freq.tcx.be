import data from './data.js';
import time from './time.js';
import ui from './ui.js';

const statsView = ui.fromID('statsView'),
      last30DaysTable = ui.fromID('statsLast30Days');

function appendDayRow(f, date, count) {
  if(count > 0) {
    const row = document.createElement('TR');

    const dateCell = row.appendChild(document.createElement('TD'));
    dateCell.classList.add('AlignRight');
    dateCell.textContent = time.formatDateList(date);

    const countCell = row.appendChild(document.createElement('TD'));
    countCell.classList.add('AlignRight');
    countCell.textContent = count;

    const barCell = row.appendChild(document.createElement('TD'));
    barCell.classList.add('AlignLeft');
    const bar = barCell.appendChild(document.createElement('DIV'));
    bar.classList.add('Bar');
    bar.style.width = count + 'em';

    f.appendChild(row);
  }
}

async function loadLast30DaysTable(target) {
  ui.removeAllChildren(last30DaysTable);
  
  const f = document.createDocumentFragment();
  const today = new Date();
  var currentDate = new Date(0), count = 0;
  
  await data.getOccurrencesBetween(target, time.addDays(today, -30), time.addDays(today, 1), occ => {
    const date = time.startOfDay(occ);
    if(date.valueOf() != currentDate.valueOf()) {
      appendDayRow(f, currentDate, count);
      currentDate = date;
      count = 0;
    }
    count += 1;
    return true;
  });
  appendDayRow(f, currentDate, count);

  last30DaysTable.appendChild(f);
}

async function navToView(target) {
  ui.navToView(statsView);
  await loadLast30DaysTable(target);
}

export { navToView };