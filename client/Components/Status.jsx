import React from 'react';
import { green, red, blue } from '@material-ui/core/colors';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HourglassEmptyRoundedIcon from '@material-ui/icons/HourglassEmptyRounded';

import './Status.scss';

export const Status = ({status}) => {
  let statusIcon;
  if(status === 'Running') statusIcon = <CheckCircleIcon className='statusIcon' style={{ color: green[500] }} />; 
  else if(status === 'Started') statusIcon = <HourglassEmptyRoundedIcon className='statusIcon' style={{ color: blue[500] }} />;
  else statusIcon = <CancelIcon className='statusIcon' style={{ color: red[500] }} />;

  return (
    <div className="statusDiv">
      <h3>Server Status:</h3>
      {statusIcon}
      <p>{status}</p>
    </div>
  );
}