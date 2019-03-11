import ui from './ui.js';

const actions = {};

function register(...fns) {
  for(var i = 0, n = fns.length; i < n; i++) {
    const fn = fns[i];
    actions[fn.name] = fn;
  }
}

async function execute(name, target) {
  if(name in actions) {
    try {
      await actions[name](target);
    } catch(ex) {
      if(ex) alert(ex.message);
    }
  } else {
    alert('Action ' + name + ' not found');
  }
}

document.addEventListener('click', async ev => {
  const t = ev.target;
  if(t.disabled) return;

  const action = ui.getAction(t);
  if(!action) return;

  await execute(action, ui.getTarget(t));
});

export default { register, execute };