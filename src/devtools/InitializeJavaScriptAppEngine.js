"use strict";

const setupDevtools = require('./setupDevtools');

if (typeof GLOBAL === 'undefined') {
  global.GLOBAL = this;
}

if (typeof window === 'undefined') {
  global.window = GLOBAL;
}

if (!window || !window.document) {
  setupDevtools();
}

if (typeof process === 'undefined') {
  global.process = { env: 'development' };
}
