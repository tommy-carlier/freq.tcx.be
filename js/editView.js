import time from './time.js';
import data from './data.js';
import ui from './ui.js';
import actions from './actions.js';
import dayView from './dayView.js';

var editingDate;

const
  editOccurrenceView = ui.fromID('editOccurrenceView'),
  editOccurrenceDate = ui.fromID('editOccurrenceDate'),
  editOccurrenceTime = ui.fromID('editOccurrenceTime');

function navToView(target) {
  target = time.parseOccurrenceTarget(target);
  if(target) {
    editingDate = target.dateTime;
    editOccurrenceDate.value = time.formatDateIso(editingDate);
    editOccurrenceTime.value = time.formatTimeIso(editingDate);
    editOccurrenceView.dataset.target = target.type;
    ui.navToView(editOccurrenceView);
  }
}

async function saveEdit(type) {
  const newDate = time.parseDateTime(editOccurrenceDate.value, editOccurrenceTime.value);
  await data.modifyOccurrence(type, editingDate, newDate);
  await dayView.navToDay(newDate);
}

actions.register(saveEdit);

export { navToView };