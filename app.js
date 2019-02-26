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

const dayOccurrencesList = document.getElementById('dayOccurrences');

async function displayDayOccurrences(date) {
  const type = getAttr(dayOccurrencesList, 'data-type'),
        f = document.createDocumentFragment(),
        y = date.getFullYear(),
        m = date.getMonth(),
        dt = date.getDate(),
        min = new Date(y, m, dt),
        max = new Date(y, m, dt, 23, 59, 59, 999);
  
  await data.getOccurrencesBetween(type, min, max, occ => {
    f.appendChild(createOccurrenceItem(occ));
    return true;
  });
  
  removeAllChildren(dayOccurrencesList);
  dayOccurrencesList.appendChild(f);
}

async function registerOccurrence(type, btn) {
  btn.disabled = true;
  try {
    var dt = await data.registerOccurrence(type);
    if(dt) {
      dayOccurrencesList.appendChild(createOccurrenceItem(dt));
      scrollToBottom();
    }
  } finally {
    btn.disabled = false;
  }
}

const actions = { registerOccurrence };

document.addEventListener('click', ev => {
  const t = ev.target;
  if(t.disabled) return;

  const action = getAttr(t, 'data-action');
  if(!action) return;

  const type = getAttr(t, 'data-type');
  if(!type) return;

  actions[action](type, t);
});

displayDayOccurrences(new Date());

applicationCache.addEventListener('updateready', ev => {
  location.reload();
});

document.addEventListener('touchstart', () => { }, false);