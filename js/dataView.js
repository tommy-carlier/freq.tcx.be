import data from './data.js';
import ui from './ui.js';
import actions from './actions.js';

const dataView = ui.fromID('dataView'),
      dataTextArea = ui.fromID('dataTextArea');

async function loadData(target) {
  const lines = [];
  await data.getAllOccurrences(target, occ => {
    lines.push(occ.valueOf() / 1000);
    return true;
  });
  return lines.join('\n');
}

async function navToView(target) {
  ui.navToView(dataView);
  dataTextArea.value = await loadData(target);
  dataTextArea.focus();
  dataTextArea.select();
}

async function exportData() {
  if(navigator.share) {
    await navigator.share({ text: dataTextArea.value });
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(dataTextArea.value);
    alert('The data has been copied to the clipboard.');
  } else {
    alert('No support for sharing or clipboard access:\nPlease copy manually.');
  }
}

actions.register(exportData);

export { navToView };