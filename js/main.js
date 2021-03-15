import data from './data.js';
import ui from './ui.js';
import dayView from './dayView.js';

(async function() {
  const target = ui.getTarget(document.body);
  await data.deleteOldOccurrences(target, 120);
  await dayView.navToDay(new Date());
}());

window.addEventListener('error', ev => { alert(ev.message + '\n\n' + JSON.stringify(ev)); });
applicationCache.addEventListener('updateready', ev => { location.reload(); });
document.addEventListener('touchstart', () => { }, false);