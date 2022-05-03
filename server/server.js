console.log(`[MANAGER] Starting minecraft-server-manager [PID:${process.pid}]`);

require('dotenv').config()
const https = require('https');
const path = require('path');
const express = require('express');
const cookieParser = require("cookie-parser");
const favicon = require('serve-favicon');
const certificateUpdater = require('./modules/certificateUpdator.js');

const minecraftController = require('./controllers/minecraft.js');
const adminController = require('./controllers/admin.js');

const app = express();
const PORT = Number(process.env.APP_PORT);

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// app.use(express.static('dist'));

app.get('/', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../client/index.html'));
});

app.use(express.static('assets'));
app.use(favicon(path.resolve(__dirname, '../assets/favicon.ico')));

app.get('/bundle.js', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../dist/bundle.js'));
});

app.get('/main', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../client/index.html'));
});

app.post('/start', adminController.validate, minecraftController.start, (req, res) => {
  if(res.locals.loggedIn) res.status(200).json({message: 'Minecraft server started'});
  else res.status(401).json({message: 'You don\'t have authorization to perform this operation' });
});

app.post('/stop', adminController.validate, minecraftController.stop, (req, res) => {
  if(res.locals.loggedIn) res.status(200).json({message: 'Minecraft server stopped'});
  else res.status(401).json({message: 'You don\'t have authorization to perform this operation' });
});

app.post('/cmd', adminController.validate, minecraftController.cmd, (req, res) => {
  if(res.locals.loggedIn) res.status(200).json({message: 'Minecraft server executed command'});
  else res.status(401).json({message: 'You don\'t have authorization to perform this operation' });
});

app.get('/' + process.env.MODPACK_LINK, (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, process.env.MINECRAFT_PATH + '/' + process.env.MODPACK_NAME));
});

app.post('/login', adminController.login, (req, res) => {
  if(res.locals.loggedIn) res.status(200).json({admin:true});
  else res.status(401).json({admin:false});
});

app.post('/logout', adminController.logout, (req, res) => {
  res.status(200).json({admin:false});
});

const wsURL = 'wss://' + process.env.DOMAIN + ':' + process.env.WEBSOCKET_PORT + '/';
app.get('/session', adminController.validate, (req, res) => {
  res.status(200).json({admin:res.locals.loggedIn === true, wsURL});
});

app.use('*', (req, res) => {
  res.status(404).send('Cannot find ' + req.baseUrl);
});

app.use((err, req, res, next) => {
  console.log('[MANAGER]', err.log || err);
  res.status(err.status || 500).send(err.message || {error:'Unknown server error occured'});
});

const basePath = path.resolve(__dirname, '..');

var httpsServer;
certificateUpdater.register((key, cert) => {
  if(httpsServer) {
    httpsServer.close();
  }

  httpsServer = https.createServer({
    key,
    cert,
  }, app).listen(PORT, () => console.log(`[MANAGER] Server listening on Port ${PORT}...`));
});

certificateUpdater.start();

// redirect http to https
const httpApp = express();
const HTTP_PORT = process.env.HTTP_PORT;
httpApp.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.status(301).send(Buffer.from('<html><head></head><body><script>window.location.replace("https://' + process.env.DOMAIN + ':' + PORT + '");</script></body><html>'));
});

httpApp.listen(HTTP_PORT, () => {
  console.log(`[MANAGER] http redirect listening on port ${HTTP_PORT}...`);
});