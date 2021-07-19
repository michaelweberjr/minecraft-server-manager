import React from 'react';
import { Button } from '@material-ui/core';
import JsFileDownloader from 'js-file-downloader';

import './Download.scss';

export const Download = () => {

  const handleClick = () => {
    new JsFileDownloader({ 
      url: '/michaels_modpack-1.0.zip'
    });
  }

  return (
    <div className='downloadDiv'>
      <p>Download the GDLauncher mod pack: </p>
      <Button color='primary' onClick={handleClick}>Download</Button>
    </div>
  );
}