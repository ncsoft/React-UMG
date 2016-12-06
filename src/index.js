"use strict";

const ReactUMGMount = require('./ReactUMGMount');
const ReactUMGComponents = require('./components');

module.exports = {
  render: ReactUMGMount.render,
  wrap: ReactUMGMount.wrap,
  unmountComponent: ReactUMGMount.unmountComponent,
  Register: ReactUMGComponents.Register
}