/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */

// backing arrays up for Grafar
global._Float32Array = global.Float32Array;
global._Uint32Array = global.Uint32Array;
global._Uint16Array = global.Uint16Array;
global._Uint8Array = global.Uint8Array;

require('babel-runtime/core-js/promise').default = require('bluebird')
import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import io from 'socket.io-client';
import {Provider} from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { ReduxAsyncConnect } from 'redux-async-connect';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import { fromJS } from 'immutable'

import getRoutes from './routes';

const client = new ApiClient();
const history = useScroll(() => browserHistory)();
const dest = document.getElementById('content');

window.__data.lectureConstructor = fromJS(window.__data.lectureConstructor)
const store = createStore(history, client, window.__data, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
client.setGetState(store.getState);

function initSocket() {
  const socket = io('', {path: '/ws'});
  socket.on('news', (data) => {
    console.log(data);
    socket.emit('my other event', { my: 'data from client' });
  });
  socket.on('msg', (data) => {
    console.log(data);
  });

  return socket;
}

global.socket = initSocket();

if (process.env.NODE_ENV === 'production') {
  global.syncServer = {
    domen: 'visualmath.ru',
    path: '/socket_sync_server'
  }
} else {
  global.syncServer = {
    domen: 'localhost:8632',
    path: ''
  }
}

const component = (
  <Router render={(props) =>
        <ReduxAsyncConnect {...props} helpers={{client}} filter={item => !item.deferred} />
      } history={history}>
    {getRoutes(store)}
  </Router>
);

ReactDOM.render(
  <Provider store={store} key="provider">
    {component}
  </Provider>,
  dest
);

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger

  if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
  }
}

if (__DEVTOOLS__ && !window.devToolsExtension) {
  const DevTools = require('./containers/DevTools/DevTools');
  ReactDOM.render(
    <Provider store={store} key="provider">
      <div>
        {component}
        <DevTools />
      </div>
    </Provider>,
    dest
  );
}
