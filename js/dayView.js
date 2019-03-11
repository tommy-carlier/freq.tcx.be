import data from './data.js';
import time from './time.js';
import ui from './ui.js';
import actions from './actions.js';

var currentDay;

const
  dayView = ui.fromID('dayView'),
  dayOccurrencesList = ui.fromID('dayOccurrences'),
  dayTitleHeader = ui.fromID('dayTitle'),
  prevDayButton = ui.fromID('prevDay'),
  nextDayButton = ui.fromID('nextDay');

function createOccurrenceItem(type, dt) {
  const li = document.createElement('LI');
  li.dataset.action = 'editOccurrence';
  li.dataset.target = time.formatOccurrenceTarget(type, dt);
  li.textContent = time.formatTimeOccurrence(dt);
  return li;
}

function setOccurrencesListAdded(added) {
  ui.setClassIf(dayOccurrencesList, 'Added', added);
}

async function loadOccurrences(dt) {
  currentDay = dt;
  dayTitleHeader.textContent = time.formatDateTitle(currentDay);
  prevDayButton.textContent = time.formatDateNav(time.prevDate(currentDay));
  nextDayButton.textContent = time.formatDateNav(time.nextDate(currentDay));

  const type = ui.getTarget(dayOccurrencesList),
        f = document.createDocumentFragment(),
        start = time.startOfDay(currentDay),
        end = time.endOfDay(currentDay);
  
  const first = await data.getFirstOccurrence(type);

  prevDayButton.disabled = !(first && first < start);
  nextDayButton.disabled = time.isToday(dt);

  await data.getOccurrencesBetween(type, start, end, occ => {
    f.appendChild(createOccurrenceItem(type, occ));
    return true;
  });
  
  ui.removeAllChildren(dayOccurrencesList);
  dayOccurrencesList.appendChild(f);
}

async function registerOccurrence(type) {
  var dt = await data.registerOccurrence(type);
  if(dt) {
    if(time.isToday(currentDay)) {
      dayOccurrencesList.appendChild(createOccurrenceItem(type, dt));
    } else await loadOccurrences(new Date());
    
    setOccurrencesListAdded(true);
    ui.scrollToBottom();
  }
}

async function navToPrevDay() {
  setOccurrencesListAdded(false);
  await loadOccurrences(time.prevDate(currentDay));
}

async function navToNextDay() {
  setOccurrencesListAdded(false);
  await loadOccurrences(time.nextDate(currentDay));
}

async function navToCurrentDay() {
  setOccurrencesListAdded(false);
  ui.showScreen(dayView);
}

async function navToDay(dt) {
  await loadOccurrences(dt);
  await navToCurrentDay();
}

async function navToStats() {
  (await import('./statsView.js')).showScreen();
}

async function editOccurrence(target) {
  (await import('./editView.js')).showScreen(target);
}

actions.register(navToPrevDay, navToNextDay, navToCurrentDay, navToStats, registerOccurrence, editOccurrence);

export default { navToDay };