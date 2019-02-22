window.data = (function() {
  const OCC = 'Occurrences', RO = 'readonly', RW = 'readwrite';

  function upgradeDB(db) {
    db.createObjectStore(OCC, { });
  }

  const open = dbName => DB.open(dbName, 1, upgradeDB);

  async function registerOccurrence(name) {
    var db = await open(name);
    var tx = db.transaction(OCC, RW);
    var store = tx.objectStore(OCC);
    var dt = new Date();
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

  async function getOccurrencesBetween(name, min, max, cb) {
    var db = await open(name);
    var tx = db.transaction(OCC, RO);
    await DB.forEachKey(tx.objectStore(OCC), IDBKeyRange.bound(min, max), cb);
    await DB.complete(tx);
  }

  return { registerOccurrence, getOccurrencesBetween };
}());