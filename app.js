import data from './data.js';

function getAttr(e, name) {
  while(e) {
    var attr = e.getAttribute(name);
    if(attr) return attr;
    e = e.parentElement;
  }
};

function createOccurrenceItem(type, dt) {
  const li = document.createElement('LI');
  li.setAttribute('data-action', 'editOccurrence');
  li.setAttribute('data-target', type + '/' + dt.valueOf());
  li.textContent = dt.toLocaleTimeString();
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

function prevDate(dt) {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1);
}

function nextDate(dt) {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1);
}

const DATE_FORMAT_TITLE = { month:'short', day:'numeric', year:'numeric' };
const DATE_FORMAT_NAV = { month:'short', day:'numeric' };

function formatDate(dt, fmt) {
  return Intl.DateTimeFormat([], fmt).format(dt);
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

var currentDay = new Date(), isToday = true;

function setOccurrencesListAdded(added) {
  setClassIf(dayOccurrencesList, 'Added', added);
}

async function displayDayOccurrences(dt) {
  currentDay = dt;
  dayTitleHeader.textContent = formatDate(currentDay, DATE_FORMAT_TITLE);
  prevDayButton.textContent = formatDate(prevDate(currentDay), DATE_FORMAT_NAV);
  nextDayButton.textContent = formatDate(nextDate(currentDay), DATE_FORMAT_NAV);

  const type = getAttr(dayOccurrencesList, 'data-target'),
        f = document.createDocumentFragment(),
        y = currentDay.getFullYear(),
        m = currentDay.getMonth(),
        d = currentDay.getDate(),
        min = new Date(y, m, d),
        max = new Date(y, m, d, 23, 59, 59, 999);
  
  isToday = max >= new Date();
  const first = await data.getFirstOccurrence(type);

  prevDayButton.disabled = !(first && first < min);
  nextDayButton.disabled = isToday;

  await data.getOccurrencesBetween(type, min, max, occ => {
    f.appendChild(createOccurrenceItem(type, occ));
    return true;
  });
  
  removeAllChildren(dayOccurrencesList);
  dayOccurrencesList.appendChild(f);
}

async function registerOccurrence(type) {
  var dt = await data.registerOccurrence(type);
  if(dt) {
    if(isToday) dayOccurrencesList.appendChild(createOccurrenceItem(type, dt));
    else await displayDayOccurrences(new Date());
    
    setOccurrencesListAdded(true);
    scrollToBottom();
  }
}

async function navToPrevDay() {
  setOccurrencesListAdded(false);
  await displayDayOccurrences(prevDate(currentDay));
}

async function navToNextDay() {
  setOccurrencesListAdded(false);
  await displayDayOccurrences(nextDate(currentDay));
}

const regexSplitEditTarget = /^(.+)\/(.+)$/;

var editingDate;

async function editOccurrence(target) {
  const match = regexSplitEditTarget.exec(target);
  if(match) {
    const type = match[1];
    editingDate = new Date(parseInt(match[2], 10));
    editOccurrenceDate.valueAsDate = editingDate;
    editOccurrenceTime.value = editingDate.toLocaleTimeString();
    editOccurrenceView.setAttribute('data-target', type);
    showScreen('editOccurrenceView');
  }
}

async function cancelEdit() {
  showScreen('dayView');
}

async function saveEdit(type) {
  const newDate = new Date(editOccurrenceDate.value + 'T' + editOccurrenceTime.value);
  await data.modifyOccurrence(type, editingDate, newDate);
  await displayDayOccurrences(newDate);
  showScreen('dayView');
}

const actions = { registerOccurrence, navToPrevDay, navToNextDay, editOccurrence, cancelEdit, saveEdit };

document.addEventListener('click', async ev => {
  const t = ev.target;
  if(t.disabled) return;

  const action = getAttr(t, 'data-action');
  if(!action) return;

  try {
    await actions[action](getAttr(t, 'data-target'));
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