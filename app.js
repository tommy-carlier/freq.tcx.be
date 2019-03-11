import data from './data.js';
import time from './time.js';

var currentDay = new Date(), editingDate;

function fromDataSet(e, name) {
  while(e) {
    var attr = e.dataset[name];
    if(attr) return attr;
    e = e.parentElement;
  }
};

function getTarget(e) { return fromDataSet(e, 'target'); }
function getAction(e) { return fromDataSet(e, 'action'); }

function createOccurrenceItem(type, dt) {
  const li = document.createElement('LI');
  li.dataset.action = 'editOccurrence';
  li.dataset.target = time.formatOccurrenceTarget(type, dt);
  li.textContent = time.formatTimeOccurrence(dt);
  return li;
}

function removeAllChildren(e) {
  var r = document.createRange();
  r.selectNodeContents(e);
  r.deleteContents();
  r.detach();
}

function scrollToBottom() {
  scrollTo(0, document.body.scrollHeight);
}

function setClassIf(e, cls, add) {
  if(add) e.classList.add(cls);
  else e.classList.remove(cls);
}

function showScreen(id) {
  const scr = document.getElementById(id);
  if(!scr.classList.contains('Visible')) {
    const es = document.getElementsByClassName('Screen');
    for(var i = 0, n = es.length; i < n; i++) {
      const e = es[i];
      setClassIf(e, 'Visible', e == scr);
    }
  }
}

const
  dayOccurrencesList = document.getElementById('dayOccurrences'),
  dayTitleHeader = document.getElementById('dayTitle'),
  prevDayButton = document.getElementById('prevDay'),
  nextDayButton = document.getElementById('nextDay'),
  
  editOccurrenceView = document.getElementById('editOccurrenceView'),
  editOccurrenceDate = document.getElementById('editOccurrenceDate'),
  editOccurrenceTime = document.getElementById('editOccurrenceTime');

function setOccurrencesListAdded(added) {
  setClassIf(dayOccurrencesList, 'Added', added);
}

async function displayDayOccurrences(dt) {
  currentDay = dt;
  dayTitleHeader.textContent = time.formatDateTitle(currentDay);
  prevDayButton.textContent = time.formatDateNav(time.prevDate(currentDay));
  nextDayButton.textContent = time.formatDateNav(time.nextDate(currentDay));

  const type = getTarget(dayOccurrencesList),
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
  
  removeAllChildren(dayOccurrencesList);
  dayOccurrencesList.appendChild(f);
}

async function registerOccurrence(type) {
  var dt = await data.registerOccurrence(type);
  if(dt) {
    if(time.isToday(currentDay)) {
      dayOccurrencesList.appendChild(createOccurrenceItem(type, dt));
    } else await displayDayOccurrences(new Date());
    
    setOccurrencesListAdded(true);
    scrollToBottom();
  }
}

async function navToPrevDay() {
  setOccurrencesListAdded(false);
  await displayDayOccurrences(time.prevDate(currentDay));
}

async function navToNextDay() {
  setOccurrencesListAdded(false);
  await displayDayOccurrences(time.nextDate(currentDay));
}

async function editOccurrence(target) {
  target = time.parseOccurrenceTarget(target);
  if(target) {
    editingDate = target.dateTime;
    editOccurrenceDate.value = time.formatDateIso(editingDate);
    editOccurrenceTime.value = time.formatTimeIso(editingDate);
    editOccurrenceView.dataset.target = target.type;
    showScreen('editOccurrenceView');
  }
}

async function cancelEdit() {
  showScreen('dayView');
}

async function saveEdit(type) {
  const newDate = time.parseDateTime(editOccurrenceDate.value, editOccurrenceTime.value);
  await data.modifyOccurrence(type, editingDate, newDate);
  
  setOccurrencesListAdded(false);
  await displayDayOccurrences(newDate);
  showScreen('dayView');
}

const actions = { registerOccurrence, navToPrevDay, navToNextDay, editOccurrence, cancelEdit, saveEdit };

document.addEventListener('click', async ev => {
  const t = ev.target;
  if(t.disabled) return;

  const action = getAction(t);
  if(!action) return;

  try {
    await actions[action](getTarget(t));
  } catch(ex) {
    if(ex) alert(ex.message);
  }
});

(async function() {
  await displayDayOccurrences(currentDay);
  showScreen('dayView');
  setOccurrencesListAdded(false);
}());

applicationCache.addEventListener('updateready', ev => {
  location.reload();
});

document.addEventListener('touchstart', () => { }, false);