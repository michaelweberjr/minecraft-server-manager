const ws = require("nodejs-websocket");
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.WEBSOCKET_PORT);
const routes = [];

const basePath = path.resolve(__dirname, '..');

const options = {
  key: fs.readFileSync(process.env.SERVER_KEY),
  cert: fs.readFileSync(process.env.SERVER_CERT),

  secure:true,
};

const socket = {
  server: ws
    .createServer(options, (conn) => {
      conn.on("text", (str) => {
        const msg = JSON.parse(str);

        let routeIndex = -1;
        for (let i = 0; i < routes.length; i++) {
          if (routes[i].start === msg.type) {
            routeIndex = i;
            break;
          }
        }

        if (routeIndex === -1)
          conn.send(
            JSON.stringify({
              type: "error",
              payload: { error: "Unknown message type" },
            })
          );
        else
          dispatcher(
            msg.payload,
            { conn, locals: {} },
            ...routes[routeIndex].stops
          );
      });

      conn.on("close", (code, reason) => {
        let routeIndex = -1;
        for (let i = 0; i < routes.length; i++) {
          if (routes[i].start === "close") {
            routeIndex = i;
            break;
          }
        }
        if (routeIndex !== -1)
          dispatcher({}, { conn, locals: {} }, ...routes[routeIndex].stops);
      });

      conn.on("error", (err) => {
        console.log(`Errr on connection '${conn.key}': ${err}`);
      });
    })
    .listen(PORT),

  use: (start, ...stops) => {
    routes.push({ start, stops });
  },

  send: (type, payload) => {
    socket.server.connections.forEach(conn => {
      conn.send(JSON.stringify({type, payload: payload}));
    });
  }
};

socket.server.on("listening", () => {
  console.log(`Websocket server listnening on port ${PORT}...`);
});

socket.server.on("connection", (conn) => {
  console.log("Connection established with ", conn.key);
});

socket.server.on("close", () => {
  console.log("Websocket server has shut down");
});

socket.server.on("error", (e) => {
  console.log("Websocket error caught: ", e);
});

const dispatcher = (req, res, ...route) => {
  if (route[0])
    route[0](req, res, (error) => {
      if (error) {
        res.conn.send(JSON.stringify({ type: "error", payload: { error } }));
      } else {
        dispatcher(req, res, ...route.slice(1));
      }
    });
};

module.exports = socket;
