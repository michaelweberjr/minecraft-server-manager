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
      <p>Download the mod pack here: </p>
      {process.env.DOWNLOAD_LOCAL === "true" ? 
        <Button color='primary' onClick={handleClick}>Download</Button> :
        <a href={process.env.MODPACK_LINK}>{process.env.MODPACK_NAME}</a>}
    </div>
  );
}
