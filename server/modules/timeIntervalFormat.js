module.exports = {
  toHHMMSS: (time) => {
    let hours   = Math.floor(time / (1000*60*60));
    let minutes = Math.floor((time - (hours * 1000 *3600)) / (60*1000));
    let seconds = Math.floor((time - (hours * 3600*1000) - (minutes * (60*1000))) / 1000);
    let ms = time - (hours * 3600*1000) - (minutes * 60*1000) - (seconds * 1000);
  
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
  }
};