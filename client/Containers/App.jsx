import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Main } from './Main.jsx'
import { Login } from './Login.jsx';
import Session from '../Session.jsx';

import './App.scss';

export const App = (props) => {
  return (
    <div className='appDiv'>
      <Switch>
        <Route path="/" render={(props) => <Session {...props} />} exact />
        <Route path="/login" render={(props) => <Login {...props} />} exact />
        <Route path="/main" render={(props) => <Main {...props} />} exact />
      </Switch>
    </div>
  );
};