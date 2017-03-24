'use strict';

const ReactMultiChild = require('react-dom/lib/ReactMultiChild');

const ReactUMGEmptyComponent = function(element) {

  this.node = null;
  this._mountImage = null;
  this._renderedChildren = null;
  this._currentElement = element;
  this._rootNodeID = null;
};

ReactUMGEmptyComponent.prototype = Object.assign(
  {
    construct(element) {},

    getPublicInstance() {},
    mountComponent() {},
    receiveComponent() {},
    unmountComponent() {},
    // Implement both of these for now. React <= 15.0 uses getNativeNode, but
    // that is confusing. Host environment is more accurate and will be used
    // going forward
    getNativeNode() {},
    getHostNode() {}
  },
  ReactMultiChild.Mixin
);

module.exports = ReactUMGEmptyComponent;
