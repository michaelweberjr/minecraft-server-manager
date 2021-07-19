import React from 'react';
import { render } from 'react-dom';
import { App } from './Containers/App.jsx';
import { BrowserRouter } from "react-router-dom";

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);