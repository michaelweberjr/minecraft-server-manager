class Socket {
  constructor() {
    this.connect = (wsURL) => {
      this.socket = new WebSocket(wsURL);  
      
      this.socket.onmessage = (e) => {
        // console.log('Received message: ', e);
        const msg = JSON.parse(e.data);
        if(this.listeners[msg.type]) this.listeners[msg.type].forEach(l => l.callback(msg.payload, l.id));
        this.listeners.any.forEach(l => l.callback(msg.type, msg.payload, l.id));
      }

      return new Promise((resolve, reject) => {
        this.socket.onopen = (e) => {
          this.connected = true;
          resolve(true);
        };
      });
    }

    this.listeners = {'any':[]};
    this.nextId = 0;
    this.connected = false;
  }

  addListener(type, callback) {
    if(typeof(type) === 'string') {
      if(!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push({ id:this.nextId, callback});
    }
    else this.listeners.any.push({ id:this.nextId, callback:type });

    return this.nextId++;
  }

  removeListener(id) {
    for(let type in this.listeners) {
      let index = -1;
      for(let i = 0; i < this.listeners[type].length; i++) {
        if(this.listeners[type][i].id === id) {
          index = i;
          break;
        } 
      }

      if(index > -1) {
        this.listeners[type] = this.listeners[type].filter(e => e.id !== id);
        break;
      }
    }
  }

  sendEvent(type, payload = {}) {
    this.socket.send(JSON.stringify({type, payload}));
  }
}

const socket = new Socket();

export default socket;
