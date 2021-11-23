const fs = require('fs');
const time = require('./timeIntervalFormat.js');

const FIRST_TIME = (() => {
  let time = new Date();
  const day = time.getDate();
  time.setHours(1, 0, 0, 0);
  time.setDate(day + 1);
  return time;
})();
const INTERVAL = 1000*60*60*24*7; // 1 week

function CertificateUpdator() {
  this.key = fs.readFileSync(process.env.SERVER_KEY);
  this.cert = fs.readFileSync(process.env.SERVER_CERT);
  this.callbacks = [];
}

CertificateUpdator.prototype.register = function(callback) {
  this.callbacks.push(callback);
}

CertificateUpdator.prototype.start = function() {
  const certUpdater = () => {
    try {
      const newKey = fs.readFileSync(process.env.SERVER_KEY);

      if(this.key !== newKey) {
        this.key = newKey;
        this.cert = fs.readFileSync(process.env.SERVER_CERT);

        console.log("[UPDATER] Updating certificates");
        this.callbacks.forEach(cb => cb(this.key, this.cert));
      }
      else {
        console.log("[UPDATER] No change in certificates");
      }
    } catch(error) {
      console.log("[UPDATER] Caught error when updating certificates: " + error);
    }
  }

  console.log(`[UPDATER] [${new Date(Date.now()).toISOString()}] Starting certificate updater`);
  console.log("[UPDATER] First time of update:", FIRST_TIME, ", occurs in:", time.toHHMMSS(FIRST_TIME.valueOf() - Date.now()));

  console.log("[UPDATER] Starting servers");
  this.callbacks.forEach(cb => cb(this.key, this.cert));

  setTimeout(() => {
    console.log("[UPDATER] Running certificate updater");
    certUpdater();

    setInterval(() => {
      console.log("[UPDATER] Running certificate updater");
      certUpdater();
    }, INTERVAL)
  }, FIRST_TIME.valueOf() - Date.now());
}


module.exports = new CertificateUpdator();