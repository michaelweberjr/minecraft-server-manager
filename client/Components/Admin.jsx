import React, { useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';

import './Admin.scss';

const cmdTextFieldStyles = makeStyles({
  root: {
    margin: '10px 0px 0px 0px',
  }
});

export const Admin = ({status}) => {
  const [cmdText, setCmdText] = useState('');
  const cmdTextFieldStyle = cmdTextFieldStyles();

  const startClick = () => {
    fetch('/start', {
      method:'POST'
    })
    .catch(error => console.log('Caught an error: ', error));
  }

  const stopClick = () => {
    fetch('/stop', {
      method:'POST'
    })
    .catch(error => console.log('Caught an error: ', error));
  }

  const commandClick = () => {
    fetch('/cmd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({cmd:cmdText})
    })
    .catch(error => console.log('Caught an error: ', error));
    setCmdText('');
  };

  return (
    <div className='adminDiv'>
      <div className='buttonDiv'>
        <Button color='primary' onClick={startClick} disabled={status !== 'Stopped'}>Start Server</Button>
        <Button color='primary' onClick={stopClick} disabled={status !== 'Running'}>Stop Server</Button>
        <Button color='primary' onClick={commandClick} disabled={status !== 'Running'}>Send Command</Button>
      </div>
      <TextField fullWidth className={cmdTextFieldStyle.root} id="command" label="Command" variant="outlined" value={cmdText} disabled={status !== 'Running'}
        onChange={el => setCmdText(el.target.value)}
        onKeyPress={event => { if(event.key === 'Enter') commandClick(); }}
      />
    </div>
  );
};