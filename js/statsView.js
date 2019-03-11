import ui from './ui.js';

const statsView = ui.fromID('statsView');

function showScreen() {
  ui.showScreen(statsView);
}

export { showScreen };