import React from 'react';
import { green, red, blue } from '@material-ui/core/colors';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HourglassEmptyRoundedIcon from '@material-ui/icons/HourglassEmptyRounded';

import './Status.scss';

export const Status = ({status, currentUpTime, totalUpTime}) => {
  let statusIcon;
  if(status === 'Running') statusIcon = <CheckCircleIcon className='statusIcon' style={{ color: green[500] }} />; 
  else if(status === 'Stopped') statusIcon = <CancelIcon className='statusIcon' style={{ color: red[500] }} />;
  else statusIcon = <HourglassEmptyRoundedIcon className='statusIcon' style={{ color: blue[500] }} />;
  
  return (
    <div className="statusDiv">
      <h3>Server Status:</h3>
      {statusIcon}
      <p>{status}</p>
      <p>Total Time Running<br /><center>{totalUpTime}</center></p>
      <p>Current session<br /><center>{currentUpTime}</center></p>
    </div>
  );
}