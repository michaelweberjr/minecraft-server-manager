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

      if(updater.key !== newKey) {
        updater.key = newKey;
        updater.cert = fs.readFileSync(process.env.SERVER_CERT);

        console.log("[MANAGER] Updating certificates\n");
        this.callbacks.forEach(cb => cb(this.key, this.cert));
      }
      else {
        console.log("[MANAGER] No change in certificates\n");
      }
    } catch(error) {
      console.log("[MANAGER] Caught error when updating certificates: " + error);
    }
  }

  console.log("[MANAGER] Starting certificate updater\n");
  console.log("[MANAGER] First time of update:", FIRST_TIME, ", occurs in:", time.toHHMMSS(FIRST_TIME.valueOf() - Date.now()), "\n");

  console.log("[MANAGER] Starting servers\n");
  this.callbacks.forEach(cb => cb(this.key, this.cert));

  setTimeout(() => {
    console.log("[MANAGER] Running certificate updater\n");
    certUpdater();

    setInterval(() => {
      console.log("[MANAGER] Running certificate updater\n");
      certUpdater();
    }, INTERVAL)
  }, FIRST_TIME.valueOf() - Date.now());
}


module.exports = new CertificateUpdator();