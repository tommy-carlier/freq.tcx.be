import data from './data.js';

function getAttr(e, name) {
  while(e) {
    var attr = e.getAttribute(name);
    if(attr) return attr;
    e = e.parentElement;
  }
};

function createOccurrenceItem(dt) {
  const li = document.createElement('LI');
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

const
  dayOccurrencesList = document.getElementById('dayOccurrences'),
  dayTitleHeader = document.getElementById('dayTitle'),
  prevDayButton = document.getElementById('prevDay'),
  nextDayButton = document.getElementById('nextDay');
var currentDay = new Date(), isToday = true;

async function displayDayOccurrences(dt) {
  currentDay = dt;
  dayTitleHeader.textContent = formatDate(currentDay, DATE_FORMAT_TITLE);
  prevDayButton.textContent = formatDate(prevDate(currentDay), DATE_FORMAT_NAV);
  nextDayButton.textContent = formatDate(nextDate(currentDay), DATE_FORMAT_NAV);

  const type = getAttr(dayOccurrencesList, 'data-type'),
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
    f.appendChild(createOccurrenceItem(occ));
    return true;
  });
  
  removeAllChildren(dayOccurrencesList);
  dayOccurrencesList.appendChild(f);
}

async function registerOccurrence(type) {
  var dt = await data.registerOccurrence(type);
  if(dt) {
    if(isToday) dayOccurrencesList.appendChild(createOccurrenceItem(dt));
    else await displayDayOccurrences(new Date());
    
    scrollToBottom();
  }
}

async function navToPrevDay(type) {
  await displayDayOccurrences(prevDate(currentDay));
}

async function navToNextDay(type) {
  await displayDayOccurrences(nextDate(currentDay));
}

const actions = { registerOccurrence, navToPrevDay, navToNextDay };

document.addEventListener('click', async ev => {
  const t = ev.target;
  if(t.disabled) return;

  const action = getAttr(t, 'data-action');
  if(!action) return;

  const type = getAttr(t, 'data-type');
  if(!type) return;

  await actions[action](type);
});

displayDayOccurrences(currentDay);

applicationCache.addEventListener('updateready', ev => {
  location.reload();
});

document.addEventListener('touchstart', () => { }, false);