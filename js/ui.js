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

function showScreen(scr) {
  if(!scr.classList.contains('Visible')) {
    const es = document.getElementsByClassName('Screen');
    for(var i = 0, n = es.length; i < n; i++) {
      const e = es[i];
      setClassIf(e, 'Visible', e == scr);
    }
  }
}

export default { fromID, getTarget, getAction, removeAllChildren, scrollToBottom, setClassIf, showScreen };