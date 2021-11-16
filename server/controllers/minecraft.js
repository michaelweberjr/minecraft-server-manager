const socket = require('../websocket.js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const time = require('../modules/timeIntervalFormat.js');

const minecraft = {
  proc: null,
  status: 'Stopped',
  players: JSON.parse(fs.readFileSync(path.resolve(process.env.MINECRAFT_PATH, 'usercache.json'))).map(p => p.name),
  active: [],
  inactive: [],
  startTime: 0,
  endCount: 0,
};

const stats = {
  currentUpTime: 0,
  totalUpTime: 0,
}

const statsFile = path.resolve(__dirname, '../../stats.json');
if(fs.existsSync(statsFile)) {
  tempStats = JSON.parse(fs.readFileSync(statsFile));
  stats.totalUpTime = tempStats.totalUpTime;
}

minecraft.inactive = minecraft.players;

module.exports = {
  start: (req, res, next) => {
    if(minecraft.status !== "Stopped" || !res.locals.loggedIn) return next();
    console.log('[MANAGER] Starting minecraft server...');
    minecraft.status = 'Starting';
    minecraft.startTime = Date.now();
    minecraft.endCount = process.env.CHUNK_COUNT;
    minecraft.proc = spawn('java', ['-Xmx' + process.env.RAM + 'G', '-jar', path.resolve(process.env.MINECRAFT_PATH,  './' + process.env.FORGE_JAR)], {cwd:process.env.MINECRAFT_PATH});
    minecraft.proc.stdout.on('data', parseServerData);

    minecraft.proc.on('close', (code) => {
      console.log(`[MANAGER] Minecraft server closed with code ${code}`);
      minecraft.status = "Stopped";
      minecraft.proc = null;
    });

    minecraft.proc.on('error', (error) => {
      console.log(`[MANAGER] Minecraft process error: ${error}`);
    });
    
    console.log('[MANAGER] Spwaned minecraft process [PID:' + minecraft.proc.pid + ']');

    next();
  },

  stop: (req, res, next) => {
    if(minecraft.status !== "Running" || !res.locals.loggedIn) return next();

    console.log('[MANAGER] Stopping minecraft server...');
    stats.currentUpTime = 0;
    minecraft.status = "Stopping";
    minecraft.proc.stdin.write('stop\n');

    next();
  }
};

const parseServerData = (data) => {
  const text = data.toString();
  if(process.env.DEBUG === 'true') {
    console.log(`[MINECRAFT] ${text}`);
  }
  else if(text.search(/\[minecraft\/DedicatedServer\]/) > -1 || text.search(/\main\/FATAL\]\ \[minecraft\/Main\]/) > -1) {
    console.log(`[MINECRAFT] ${text.trim()}`);
  }

  if(text.search('joined the game') > -1) {
    const words = text.split(' ');
    for(let i = 0; i < words.length; i++) {
      if(words[i] === 'joined') {
        const player = words[i-1];

        minecraft.inactive = minecraft.inactive.filter(p => p !== player);
        minecraft.active.push(player);
        console.log(`[MANAGER] ${player} has joined the server`);
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
        minecraft.active = minecraft.active.filter(p => p !== player);
        minecraft.inactive.push(player);
        console.log(`[MANAGER] ${player} has left the server`);
        socket.send('left', {player});
        break;
      }
    }
  }
  else if(text.search(/\[minecraft\/DedicatedServer\]:\ Done/) > -1) {
    console.log('[MANAGER] Minecraft process finished loading. Took ' + time.toHHMMSS(Date.now() - minecraft.startTime));
    minecraft.status = "Running";
  }
};

socket.use('connect', (req, res) => {
  res.conn.send(
    JSON.stringify({type:'init', payload: {
    status: minecraft.status,
    active: minecraft.active,
    inactive: minecraft.inactive, 
    currentUpTime: time.toHHMMSS(minecraft.currentUpTime), 
    totalUpTime: time.toHHMMSS(minecraft.totalUpTime),
  }}));
});

var notWriting = true;
const heartbeat = () => {
  if(minecraft.status === "Running") {
    stats.currentUpTime += 1000;
    stats.totalUpTime += 1000;
    if(notWriting) {
      notWriting = false;
      fs.writeFile(statsFile, JSON.stringify({totalUpTime: stats.totalUpTime}), res => notWriting = true);
    }
  }

  socket.send('heartbeat', { 
    status: minecraft.status, 
    currentUpTime: time.toHHMMSS(stats.currentUpTime), 
    totalUpTime: time.toHHMMSS(stats.totalUpTime),
  });
}

setInterval(heartbeat, 1000);
