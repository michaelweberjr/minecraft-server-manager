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

minecraft.inactive = minecraft.players;

module.exports = {
  start: (req, res, next) => {
    if(minecraft.status !== "Stopped" || !res.locals.loggedIn) return next();
    console.log('[MANAGER] Starting minecraft server...\n');
    minecraft.startTime = Date.now();
    minecraft.endCount = process.env.CHUNK_COUNT;
    minecraft.proc = spawn('sudo', ['java', '-Xmx2G', '-jar', path.resolve(process.env.MINECRAFT_PATH,  './' + process.env.FORGE_JAR)], {cwd:process.env.MINECRAFT_PATH});
    minecraft.proc.stdout.on('data', parseServerData);
    minecraft.proc.on('close', (code) => `Minecraft server closed with code ${code}`);
    minecraft.proc.on('error', (error) => console.log(`Minecraft process error: ${error}`));
    
    console.log('[MANAGER] Spwaned minecraft process [PID:' + minecraft.proc.pid + ']\n');
    minecraft.status = 'Starting';
    socket.send('update', { status: minecraft.status });

    next();
  },

  stop: (req, res, next) => {
    if(minecraft.status !== "Running" || !res.locals.loggedIn) return next();

    console.log('[MANAGER] Stopping minecraft server...\n');
    minecraft.status = "Stopping";
    socket.send('update', { status: minecraft.status });
    minecraft.proc.stdin.write('stop\n');

    next();
  }
};

const parseServerData = (data) => {
  const text = data.toString();
  if(process.env.DEBUG === 'true') {
    console.log(`[MINECRAFT] ${text}`);
  }
  else if(text.search(/\[minecraft\/DedicatedServer\]/) > -1) {
    console.log(`[MINECRAFT] ${text}`);
  }

  if(text.search('joined the game') > -1) {
    const words = text.split(' ');
    for(let i = 0; i < words.length; i++) {
      if(words[i] === 'joined') {
        const player = words[i-1];

        minecraft.inactive = minecraft.inactive.filter(p => p !== player);
        minecraft.active.push(player);
        console.log(`[MANAGER] ${player} has joined the server\n`);
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
        console.log(`[MANAGER] ${player} has left the server\n`);
        socket.send('left', {player});
        break;
      }
    }
  }
  else if(text.search(/\[minecraft\/DedicatedServer\]:\ Done/) > -1) {
    console.log('[MANAGER] Minecraft process finished loading. Took ' + time.toHHMMSS(Date.now() - minecraft.startTime) + '\n');
    minecraft.status = "Running";
    socket.send('update', { status: minecraft.status });
  }
  else if(minecraft.status === "Stopping" && text.search(/\[minecraft\/ChunkManager\]/) > -1) {
    minecraft.endCount--;
    if(minecraft.endCount === 0) {
      killMinecraft();
    }
  }
};

const killMinecraft = () => {
  minecraft.proc.kill();
  if(minecraft.proc.killed) {
    console.log('[MANAGER] Stopped minecraft server...\n');
    minecraft.status = 'Stopped';
    socket.send('update', { status: minecraft.status });
    minecraft.proc = null;
  }
  else setTimeout(killMinecraft, 100);
}

socket.use('connect', (req, res) => {
  res.conn.send(
    JSON.stringify({type:'init', payload: {
    status: minecraft.status,
    active: minecraft.active,
    inactive: minecraft.inactive, 
  }}));
});

const heartbeat = () => {
  socket.send('heartbeat', { status: minecraft.status });

  setTimeout(heartbeat, 10000);
}
heartbeat();
