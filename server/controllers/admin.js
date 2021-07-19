const bcrypt = require('bcrypt');

var ssid;
var date;

const maxAge = 1000*60*60*24*6;

module.exports = {
  login: (req, res, next) => {
    const { username, password } = req.query;
    if(username === process.env.ADMIN_NAME && password === process.env.ADMIN_PWD) {
      date = Date.now();
      ssid = bcrypt.hashSync(process.env.ADMIN_PWD + date, 10);
      res.cookie('ssid', ssid, { maxAge, httpOnly:true });
      res.locals.loggedIn = true;
    }
    next();
  },

  logout: (req, res, next) => {
    res.cookie('ssid', '', {expire: Date.now() - 1000});
    next();
  },
  
  validate: (req, res, next) => {
    if(req.cookies.ssid === ssid && Date.now() < date + maxAge) {
      res.locals.loggedIn = true;
    }
    else {
      res.cookie('ssid', '', {expire: Date.now() - 1000});
    }
    next();
  }
}