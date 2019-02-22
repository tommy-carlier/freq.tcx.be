(function(d) {
  function getAttr(e, name) {
    while(e) {
      var attr = e.getAttribute(name);
      if(attr) return attr;
      e = e.parentElement;
    }
  };

  function createOccurrenceItem(dt) {
    const li = d.createElement('LI');
    li.textContent = dt.toLocaleTimeString();
    return li;
  }

  function removeAllChildren(e) {
    var r = document.createRange();
    r.selectNodeContents(e);
    r.deleteContents();
    r.detach();
  }

  const todayOccurrencesList = d.getElementById('todayOccurrences');

  async function displayTodayOccurrences() {
    const type = getAttr(todayOccurrencesList, 'data-type'),
          f = d.createDocumentFragment();
    const min = new Date(); min.setHours(0, 0, 0, 0);
    const max = new Date(); max.setHours(23, 59, 59, 999);
    await data.getOccurrencesBetween(type, min, max, (dt, next) => {
      f.appendChild(createOccurrenceItem(dt));
      return true;
    });
    removeAllChildren(todayOccurrencesList);
    todayOccurrencesList.appendChild(f);
  }

  async function registerOccurrence(type, btn) {
    btn.disabled = true;
    try {
      var dt = await data.registerOccurrence(type);
      if(dt) todayOccurrencesList.appendChild(createOccurrenceItem(dt));
    } finally {
      btn.disabled = false;
    }
  }

  const actions = { registerOccurrence };

  d.addEventListener('click', ev => {
    const t = ev.target;
    if(t.disabled) return;

    const action = getAttr(t, 'data-action');
    if(!action) return;

    const type = getAttr(t, 'data-type');
    if(!type) return;

    actions[action](type, t);
  });

  displayTodayOccurrences();
}(document));