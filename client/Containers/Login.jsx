import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Box, TextField, Button, AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import './Login.scss';

export const Login = (props) => {
  props = props.location.state;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [route, setRoute] = useState('/');

  if(route === '/main') {
    return <Redirect to={{ pathname: '/main', state: { admin:props.admin }}}/>
  }

  const login = () => {
    fetch('/login?' + new URLSearchParams({
      username,
      password,
    }), { method:'POST' })
      .then(res => res.json())
      .then(data => {
        props.admin = data.admin;
        setRoute('/main');
      })
      .catch(error => console.log('Error in server:' + error.message));
  };

  const validateForm = () => {
    return username !== '' && password !== '';
  }

  return (
    <div className='loginDiv'>
      <AppBar position="static">
        <Toolbar className='toolBar'>
          <Typography variant="h6" >
            Michael's Minecraft Server
          </Typography>
        </Toolbar>
      </AppBar>
      <div>
        <form className="loginPage">
          <IconButton color="secondary" className='closeButton' onClick={() => setRoute('/main')}>
            <ClearIcon />
          </IconButton>
          <h1>Log In</h1>
          <Box m={2}>
            <div>
              <TextField
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                label="username"
                variant="outlined"
              />
            </div>
          </Box>
          <Box m={2}>
            <div>
              <TextField
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="password"
                variant="outlined"
              />
            </div>
          </Box>
          <div className="buttonDivLogin">
            <Button
              onClick={() => login()}
              disabled={!validateForm()}
              variant="contained"
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};