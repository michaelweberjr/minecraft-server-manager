import React from 'react';
import List from '@material-ui/core/ListItem';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import './PlayerStatus.scss';

export const PlayerStatus = ({ active, inactive }) => {
  const activeList = active.map((el, i) => <ListItem key={'a'+i}><ListItemText primary={el}/></ListItem>);
  const inactiveList = inactive.map((el, i) => <ListItem key={'i'+i}><ListItemText primary={el}/></ListItem>);

  return (
    <div className='playerDiv'>
      <List className='playerList'>
        <ListItem key={'aTop'}>
          <ListItemText primary='Active Players' />
        </ListItem>
        <Divider />
        {activeList}
      </List>
      <List className='playerList'>
        <ListItem key={'iTop'}>
          <ListItemText primary='Inactive Players' />
        </ListItem>
        <Divider />
        {inactiveList}
      </List>
    </div>
  );
}