const ws = require("nodejs-websocket");
const fs = require('fs');
const path = require('path');
const certificateUpdater = require('./modules/certificateUpdator.js');

const PORT = Number(process.env.WEBSOCKET_PORT);
const routes = [];

const socket = {
  use: (start, ...stops) => {
    routes.push({ start, stops });
  },

  send: (type, payload) => {
    if(socket.server) socket.server.connections.forEach(conn => {
      conn.send(JSON.stringify({type, payload: payload}));
    });
  }
};

certificateUpdater.register((key, cert) => {
  const options = {
    key,
    cert,
    secure:true,
  };

  if(socket.server) socket.server.close();

  socket.server = ws.createServer(options, (conn) => {
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
          console.log(`[MANAGER] Errr on connection '${conn.key}': ${err}\n`);
        });
      })
      .listen(PORT);

  socket.server.on("listening", () => {
    console.log(`[MANAGER] Websocket server listnening on port ${PORT}...\n`);
  });

  socket.server.on("connection", (conn) => {
    console.log("[MANAGER] Connection established with ", conn.key, '\n');
  });

  socket.server.on("close", () => {
    console.log("[MANAGER] Websocket server has shut down\n");
  });

  socket.server.on("error", (e) => {
    console.log("[MANAGER] Websocket error caught: ", e, '\n');
  });
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
