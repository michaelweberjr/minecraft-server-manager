const fs = require('fs');

const FIRST_TIME = (() => {
  let time = new Date();
  const day = time.getDate();
  time.setHours(1, 0, 0, 0);
  time.setDate(day + 1);
  return time;
})();
const INTERVAL = 1000*60*60*24*7; // 1 week

const toHHMMSS = (time) => {
  let hours   = Math.floor(time / (1000*60*60));
  let minutes = Math.floor((time - (hours * 1000 *3600)) / (60*1000));
  let seconds = Math.floor((time - (hours * 3600*1000) - (minutes * (60*1000))) / 1000);
  let ms = time - (hours * 3600*1000) - (minutes * 60*1000) - (seconds * 1000);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  if (ms < 10) ms = "00"+ms;
  else if (ms < 100) ms = "0"+ms;
  return hours+':'+minutes+':'+seconds+"."+ms;
};

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
  }

  console.log("[MANAGER] Starting certificate updater\n");
  console.log("[MANAGER] First time of update:", FIRST_TIME, ", occurs in:", toHHMMSS(FIRST_TIME.valueOf() - Date.now()), "\n");

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