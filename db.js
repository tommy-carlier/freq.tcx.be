window.DB = (function() {
  function reqPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = function() { resolve(req.result) };
      req.onerror = function() { reject(req.error) };
    });
  }

  function forEachKey(store, range, cb) {
    return new Promise(resolve => {
      store.openKeyCursor(range).onsuccess = ev => {
        const cursor = ev.target.result;
        if(cursor) {
          if(cb(cursor.key)) cursor.continue();
        } else resolve();
      };
    });
  }

  function open(name, version, upgradeCB) {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = function() { upgradeCB(req.result) };
    return reqPromise(req);
  }

  function complete(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = function() { resolve() };
      tx.onerror = function() { reject(tx.error) };
      tx.onabort = function() { reject(tx.error) };
    });
  }

  return { reqPromise, open, complete, forEachKey };
}());