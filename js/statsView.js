import ui from './ui.js';

const statsView = ui.fromID('statsView');

function navToView() {
  ui.navToView(statsView);
}

export { navToView };