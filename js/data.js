import DB from './db.js';

const OCC = 'Occurrences', RO = 'readonly', RW = 'readwrite';

function upgradeDB(db) {
  db.createObjectStore(OCC, { });
}

const open = dbName => DB.open(dbName, 1, upgradeDB);

async function registerOccurrence(name) {
  const db = await open(name),
        tx = db.transaction(OCC, RW),
        store = tx.objectStore(OCC),
        dt = new Date();
  dt.setMilliseconds(0);
  try {
    await DB.reqPromise(store.add(null, dt));
    await DB.complete(tx);
  } catch(ex) {
    if(ex.name == 'ConstraintError') return null;
    else throw ex;
  }
  return dt;
}

async function getFirstOccurrence(name) {
  const db = await open(name),
        tx = db.transaction(OCC, RO),
        first = await DB.firstKey(tx.objectStore(OCC));
  await DB.complete(tx);
  return first;
}

async function getOccurrencesInRange(name, range, cb) {
  const db = await open(name),
        tx = db.transaction(OCC, RO);
  await DB.forEachKey(tx.objectStore(OCC), range, cb);
  await DB.complete(tx);
}

function getAllOccurrences(name, cb) {
  return getOccurrencesInRange(name, null, cb);
}

function getOccurrencesBetween(name, min, max, cb) {
  return getOccurrencesInRange(name, IDBKeyRange.bound(min, max), cb);
}

async function modifyOccurrence(name, oldDate, newDate) {
  const db = await open(name),
        tx = db.transaction(OCC, RW),
        store = tx.objectStore(OCC);
  
  oldDate.setMilliseconds(0);
  newDate.setMilliseconds(0);

  try {
    await DB.reqPromise(store.delete(oldDate));
    await DB.reqPromise(store.add(null, newDate));
  } catch(ex) {
    if(ex.name != 'ConstraintError') throw ex;
  }
  await DB.complete(tx);
}

export default { registerOccurrence, getFirstOccurrence, getAllOccurrences, getOccurrencesBetween, modifyOccurrence };