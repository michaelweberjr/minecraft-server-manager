import React from 'react';
import { Button } from '@material-ui/core';

import './Admin.scss';

export const Admin = ({status}) => {

  const startClick = () => {
    fetch('/start', {
      method:'POST'
    })
    .catch(error => console.log('Caught an error:', error));
  }

  const stopClick = () => {
    fetch('/stop', {
      method:'POST'
    })
    .catch(error => console.log('Caught an error:', error));
  }

  return (
    <div className='adminDiv'>
      <Button color='primary' onClick={startClick} disabled={status === 'Stopped'}>Start Server</Button>
      <Button color='primary' onClick={stopClick} disabled={status === 'Running'}>Stop Server</Button>
    </div>
  );
};