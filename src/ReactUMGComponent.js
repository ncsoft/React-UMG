'use strict';

const ReactMultiChild = require('react/lib/ReactMultiChild');
const ReactCurrentOwner = require('react/lib/ReactCurrentOwner');
const invariant = require('fbjs/lib/invariant');
const warning = require('fbjs/lib/warning');
const shallowEqual = require('fbjs/lib/shallowEqual');
const UmgRoots = require('./UMGRoots');
const TypeThunks = require('./components/ReactUMGClassMap');

// In some cases we might not have a owner and when
// that happens there is no need to inlcude "Check the render method of ...".
const checkRenderMethod = () => ReactCurrentOwner.owner && ReactCurrentOwner.owner.getName()
  ? ` Check the render method of "${ReactCurrentOwner.owner.getName()}".` : '';

/**
 * @constructor ReactUMGComponent
 * @extends ReactComponent
 * @extends ReactMultiChild
 */
const ReactUMGComponent = function(element) {
  this.node = null;
  this._mountImage = null;
  this._renderedChildren = null;
  this._currentElement = element;
  this.ueobj = null;

  this._rootNodeID = null;
  this._typeThunk = TypeThunks[element.type];

  if (process.env.NODE_ENV !== 'production') {
    warning(
      Object.keys(TypeThunks).indexOf(element.type) > -1,
      'Attempted to render an unsupported generic component "%s". ' +
      'Must be one of the following: ' + Object.keys(TypeThunks),
      element.type,
      checkRenderMethod()
    );
  }
};

/**
 * Mixin for UMG components.
 */
ReactUMGComponent.Mixin = {
  getHostNode() {},

  getPublicInstance() {
    // TODO: This should probably use a composite wrapper
    return this;
  },

  unmountComponent() {
    if (this.ueobj) {
      if (this._currentElement.props.$unlink) {
        this._currentElement.props.$unlink(this.ueobj);
      }
      this.ueobj.RemoveFromParent(); 
    }      
    
    this.unmountChildren();
    this._rootNodeID = null;
    this.ueobj = null;
  },
  updateProperty(widget, value, key) {
    this._typeThunk.applyProperty(widget,value, key);
  },
  sync() {
    JavascriptWidget.CallSynchronizeProperties(this.ueobj)
    JavascriptWidget.CallSynchronizeProperties(this.ueobj.Slot)
  },
  mountComponent(
    transaction, // for creating/updating
    rootID, // Root ID of this subtree
    hostContainerInfo, // nativeContainerInfo
    context // secret context, shhhh
  ) {
    var parent = rootID;

    rootID = typeof rootID === 'object' ? rootID._rootNodeID : rootID;
    this._rootNodeID = rootID;

    var umgRoot = parent.ueobj ? parent.ueobj : UmgRoots[rootID]; 
    if (umgRoot instanceof JavascriptWidget) {
      umgRoot = umgRoot.WidgetTree.RootWidget
    }
    var outer = Root.GetEngine ? JavascriptLibrary.CreatePackage(null,'/Script/Javascript') : GWorld

    this.ueobj = this._typeThunk.createUmgElement(
      this._currentElement,
      cls => {
        var widget = new cls(outer);
        var props = this._currentElement.props
        for (var key in props) {
          this.updateProperty(widget, props[key], key);
        }
        if (widget instanceof JavascriptWidget) {
          widget.AddChild(new SizeBox(outer))
        }
        if (umgRoot['AddChild'] != null) {
          return umgRoot.AddChild(widget).Content
        }
        else {
          console.error('cannot add child', umgRoot);
        }
      }
    );

    this.sync();

    if (this._currentElement.props.$link) {
      this._currentElement.props.$link(this.ueobj);
    }
    this.initializeChildren(
      this._currentElement.props.children,
      transaction,
      context
    ); 
    return rootID;
  },

  /**
   * Updates the component's currently mounted representation.
   */
  receiveComponent(
    nextElement, transaction, context) {
    const prevElement = this._currentElement;
    this._currentElement = nextElement;
    this.updateComponent(transaction, prevElement, nextElement, context);
  },
  updateComponent(
    transaction, prevElement, nextElement, context) {
    var lastProps = prevElement.props;
    var nextProps = nextElement.props;
    if (!shallowEqual(lastProps, nextProps)) {
      this.updateProperties(lastProps, nextProps, transaction) 
    }
    this.updateChildren(nextProps.children, transaction, context);
  },
  updateProperties(
    lastProps, nextProps, transaction) {
    for (var propKey in nextProps) {
      var nextProp = nextProps[propKey];
      var lastProp = lastProps != null ? lastProps[propKey] : undefined;
      if (!nextProps.hasOwnProperty(propKey) ||
        nextProp === lastProp ||
        nextProp == null && lastProp == null) {
        continue;
      }
      process.nextTick(function() {
        this.updateProperty(this.ueobj, nextProp, propKey);
      })
   }
  },  
  initializeChildren(
    children, transaction, context) {
    this.mountChildren(children, transaction, context);
  },
};

/**
 * Order of mixins is important. ReactUMGComponent overrides methods in
 * ReactMultiChild.
 */
Object.assign(
  ReactUMGComponent.prototype,
  ReactMultiChild.Mixin,
  ReactUMGComponent.Mixin
);

module.exports = ReactUMGComponent;
