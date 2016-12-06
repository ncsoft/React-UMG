"use strict";

function setupDevtools() {
  var messageListeners = [];
  var closeListeners = [];
  //var ws = new WS('ws://localhost:8097/devtools');
  // this is accessed by the eval'd backend code
  var FOR_BACKEND = { // eslint-disable-line no-unused-vars
    wall: {
      listen(fn) {
        messageListeners.push(fn);
      },
      onClose(fn) {
        closeListeners.push(fn);
      },
      send(data) {
        console.log('sending\n%s\n', JSON.stringify(data, null, 2));
        //ws.send(JSON.stringify(data));
      },
    },
  };
}

module.exports = setupDevtools;
