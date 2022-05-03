import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography } from '@material-ui/core';
import { Status } from '../Components/Status.jsx'
import { PlayerStatus } from '../Components/PlayerStatus.jsx';
import { Download } from '../Components/Download.jsx';
import { Admin } from '../Components/Admin.jsx';
import socket from '../socket.js';

import './Main.scss';

var serverStatusGlobal = { 
  status:'Stopped', 
  active:[], 
  inactive:[], 
  currentUpTime: '00:00:00', 
  totalUpTime: '00:00:00',
};
var listenerId;

export const Main = (props) => {
  props = props.location.state;

  const [adminOverride, setAdmin] = useState(true)
  const [socketStatus, setSocketStatus] = useState('start');
  const [serverStatus, setServerStatus] = useState(serverStatusGlobal);
  const [route, setRoute] = useState('/');

  if(!props) return (
    <Redirect
      to={{
        pathname: '/'
      }}
    />
  );

  if(route === '/login') {
    socket.removeListener(listenerId);
    return <Redirect to={{ pathname: '/login', state: { admin:props.admin }}}/>
  }

  const socketListener = (type, payload, id) => {
    if(type === 'join') {
      console.log(`${payload.player} joined`);
      const index = serverStatusGlobal.inactive.indexOf(payload.player);
      if(index > -1) serverStatusGlobal.inactive = serverStatusGlobal.inactive.filter((e, i) => i !== index);
      serverStatusGlobal.active.push(payload.player);
    }
    else if(type === 'left') {
      console.log(`${payload.player} left`);
      const index = serverStatusGlobal.active.indexOf(payload.player);
      serverStatusGlobal.active = serverStatusGlobal.active.filter((e, i) => i !== index);
      serverStatusGlobal.inactive.push(payload.player);
    }
    else if(type === 'init') {
      serverStatusGlobal = payload;
    } else if(type === 'heartbeat') {
      serverStatusGlobal.status = payload.status;
      serverStatusGlobal.currentUpTime = payload.currentUpTime;
      serverStatusGlobal.totalUpTime = payload.totalUpTime;
    }

    setServerStatus({...serverStatusGlobal});
  };

  if(socketStatus === 'start') {
    if(socket.connected) {
      listenerId = socket.addListener(socketListener);
      setSocketStatus('ready');
      setServerStatus({...serverStatusGlobal});
    }
    else {
      socket.connect(props.wsURL)
        .then(() => {
          listenerId = socket.addListener(socketListener);
          setSocketStatus('ready');
          socket.sendEvent('connect');
        })
        .catch(error => console.log('Error in server:' + error.message));
      setSocketStatus('loading');
    }
  }

  const logout = () => {
    fetch('/logout', { method:'POST' })
      .then(res => res.json())
      .then(data => setAdmin(data.admin))
      .catch(error => console.log('Error in server:' + error.message));
  }

  if(socketStatus !== 'ready')
    return (
      <h1>Loading...</h1>
    );

  return (
    <div className='mainDiv'>
      <AppBar position="static">
        <Toolbar className='toolBar'>
          <Typography variant="h6" >
            Michael's Minecraft Server
          </Typography>
          {(props.admin && adminOverride) ? 
            <Button color="inherit" onClick={logout}>Logout</Button> :
            <Button color="inherit" onClick={() => setRoute('/login')}>Login</Button>
          }
        </Toolbar>
      </AppBar>
      <div className='serverDiv'>
        <Status status={serverStatus.status} currentUpTime={serverStatus.currentUpTime} totalUpTime={serverStatus.totalUpTime} />
        <PlayerStatus active={serverStatus.active} inactive={serverStatus.inactive}/>
      </div>
      <Download />
      {props.admin && adminOverride && <Admin status={serverStatus.status}/>}
    </div>
  );
}