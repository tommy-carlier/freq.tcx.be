function fromID(id) {
  return document.getElementById(id);
}

function fromDataSet(e, name) {
  while(e) {
    var attr = e.dataset[name];
    if(attr) return attr;
    e = e.parentElement;
  }
};

function getTarget(e) { return fromDataSet(e, 'target'); }
function getAction(e) { return fromDataSet(e, 'action'); }

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

function appendElement(f, name) {
  return f.appendChild(document.createElement(name));
}

function appendElementWithText(f, name, text) {
  const e = appendElement(f, name);
  e.textContent = text;
  return e;
}

function navToView(scr) {
  if(!scr.classList.contains('visible')) {
    const es = document.getElementsByClassName('View');
    for(var i = 0, n = es.length; i < n; i++) {
      const e = es[i];
      setClassIf(e, 'visible', e == scr);
    }
  }
}

export default { fromID, getTarget, getAction, removeAllChildren, scrollToBottom, setClassIf, appendElement, appendElementWithText, navToView };