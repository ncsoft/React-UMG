"use strict";

const ReactUMGMount = require('./ReactUMGMount');
const ReactUMGComponents = require('./components');
const EditorMaker = require('./editor-maker');

module.exports = {
  render: ReactUMGMount.render,
  wrap: ReactUMGMount.wrap,
  unmountComponent: ReactUMGMount.unmountComponent,
  Register: ReactUMGComponents.Register,
  spawnTab : EditorMaker.spawnTab,
  spawnWindow : EditorMaker.spawnWindow
}