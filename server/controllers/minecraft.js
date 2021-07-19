const socket = require('../websocket.js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

var minecraft;
const players = JSON.parse(fs.readFileSync(path.resolve(process.env.MINECRAFT_PATH, 'usercache.json'))).map(p => p.name);
var active = [];
var inactive = players;

module.exports = {
  start: (req, res, next) => {
    if(minecraft || !res.locals.loggedIn) return next();
    minecraft = spawn('sudo', ['java', '-Xmx2G', '-jar', path.resolve(process.env.MINECRAFT_PATH,  './' + process.env.FORGE_JAR)], {cwd:process.env.MINECRAFT_PATH});
    minecraft.stdout.on('data', parseServerData);
    minecraft.on('close', (code) => `Minecraft server closed with code ${code}`);
    minecraft.on('error', (error) => console.log(`Minecraft process error: ${error}`));
    console.log('Starting minecraft server...');
    socket.send('start');

    next();
  },

  stop: (req, res, next) => {
    if(!minecraft || !res.locals.loggedIn) return next();

    minecraft.stdin.write('stop\n');
    setTimeout(() => {
      minecraft.kill();
      console.log('Stopped minecraft server...');
      socket.send('stopped');
      minecraft = null;
    }, 2000);
    next();
  }
}

const parseServerData = (data) => {
  const text = data.toString();
  if(process.env.DEBUG === 'true') console.log(`[MINECRAFT] ${text}`);

  if(text.search('joined the game') > -1) {
    const words = text.split(' ');
    for(let i = 0; i < words.length; i++) {
      if(words[i] === 'joined') {
        const player = words[i-1];

        inactive = inactive.filter(p => p !== player);
        active.push(player);
        console.log(`${player} has joined the server`);
        socket.send('join', {player});
        break;
      }
    }
  }
  else if(text.search('left the game') > -1) {
    const words = text.split(' ');
    for(let i = 0; i < words.length; i++) {
      if(words[i] === 'left') {
        const player = words[i-1];
        active = active.filter(p => p !== player);
        inactive.push(player);
        console.log(`${player} has left the server`);
        socket.send('left', {player});
        break;
      }
    }
  }
  else if(text.search('Done') > -1) {
    console.log(`[MINECRAFT] ${text}`);
    socket.send('ready');
  }
};

socket.use('connect', (req, res) => {
  res.conn.send(
    JSON.stringify({type:'init', payload: {
    status: minecraft ? "Running" : "Stopped",
    active,
    inactive, 
  }}));
});

const heartbeat = () => {
  socket.send('heartbeat', { status: (!minecraft || minecraft.killed) ? 'Stopped' : 'Running' });

  setTimeout(heartbeat, 10000);
}
heartbeat();
