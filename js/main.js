import dayView from './dayView.js';

(async function() { await dayView.navToDay(new Date()); }());

applicationCache.addEventListener('updateready', ev => { location.reload(); });

document.addEventListener('touchstart', () => { }, false);