'use strict';

const ReactElement = require('react/lib/ReactElement');
const ReactInstanceMap = require('react-dom/lib/ReactInstanceMap');
const ReactUpdates = require('react-dom/lib/ReactUpdates');
const ReactUpdateQueue = require('react-dom/lib/ReactUpdateQueue');
const ReactReconciler = require('react-dom/lib/ReactReconciler');
const shouldUpdateReactComponent = require('react-dom/lib/shouldUpdateReactComponent');
const instantiateReactComponent = require('react-dom/lib/instantiateReactComponent');

const invariant = require('fbjs/lib/invariant');
const warning = require('fbjs/lib/warning');

const ReactInstanceHandles = require('./ReactInstanceHandles');
const ReactUMGDefaultInjection = require('./ReactUMGDefaultInjection');

ReactUMGDefaultInjection();
// TODO: externalize management of UMG node meta-data (id, component, ...)
let idCounter = 1;

const UmgRoots = require('./UMGRoots');
const TypeThunks = require('./components/ReactUMGClassMap');
const NodeMap = require('./ReactUMGNodeMap');

function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]"
}

const ReactUMGMount = {
  // for react devtools
  _instancesByReactRootID: {},
  nativeTagToRootNodeID(nativeTag) {
    throw new Error('TODO: implement nativeTagToRootNodeID ' + nativeTag);
  },

  /**
   * Renders a React component to the supplied `container` port.
   *
   * If the React component was previously rendered into `container`, this will
   * perform an update on it and only mutate the pins as necessary to reflect
   * the latest React component.
   */
  render(
    nextElement,
    umgWidget,
    callback
  ) {
    // WIP: it appears as though nextElement.props is an empty object...
    invariant(
      ReactElement.isValidElement(nextElement),
      'ReactUMG.render(): Invalid component element.%s',
      (
        typeof nextElement === 'function' ?
          ' Instead of passing a component class, make sure to instantiate ' +
          'it by passing it to React.createElement.' :
        // Check if it quacks like an element
        nextElement != null && nextElement.props !== undefined ?
          ' This may be caused by unintentionally loading two independent ' +
          'copies of React.' :
          ''
      )
    );
    if (umgWidget) {
      const prevComponent = umgWidget.component;
      if (prevComponent) {
        const prevWrappedElement = prevComponent._currentElement;
        const prevElement = prevWrappedElement.props;
        if (shouldUpdateReactComponent(prevElement, nextElement)) {
          const publicInst = prevComponent._renderedComponent.getPublicInstance();
          const updatedCallback = callback && function() {
            if (callback) {
              callback.call(publicInst);
            }
          };

          ReactUMGMount._updateRootComponent(
            prevComponent,
            nextElement,
            container,
            updatedCallback
          );
          return publicInst;
        } else {
          warning(
            true,
            'Unexpected `else` branch in ReactUMG.render()'
          );
        }
      }
    }
    if (!umgWidget.reactUmgId)
      umgWidget.reactUmgId = idCounter++;

    const rootId = ReactInstanceHandles.createReactRootID(umgWidget.reactUmgId);

    let umgRoot = UmgRoots[rootId];
    if (!umgRoot) {
      let type = nextElement.type;
      // pure react component 
      if (isString(type) == false) {
        type = 'uSizeBox'
      }
      let typeThunk = TypeThunks[type];
      let outer = Root.GetEngine ? JavascriptLibrary.CreatePackage(null,'/Script/Javascript') : GWorld;
      umgRoot = typeThunk.createUmgElement(nextElement, cls => new cls(outer));
      umgWidget.AddChild(umgRoot);

      UmgRoots[rootId] = umgRoot;        
    }
    const nextComponent = instantiateReactComponent(nextElement);

    if (!umgWidget.component) {
      umgWidget.component = nextComponent;
    }
  
    ReactUpdates.batchedUpdates(() => {
      // Two points to React for using object pooling internally and being good
      // stewards of garbage collection and memory pressure.
      const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(() => {
        // The `component` here is an instance of your
        // `ReactCustomRendererComponent` class. To be 100% honest, I’m not
        // certain if the method signature is enforced by React core or if it is
        // renderer specific. This is following the ReactDOM renderer. The
        // important piece is that we pass our transaction and rootId through, in
        // addition to any other contextual information needed.

        nextComponent.mountComponent(
          transaction,
          rootId,
          // TODO: what is _idCounter used for and when should it be nonzero?
          {_idCounter: 0},
          {}
        );
        if (callback) {
          callback(nextComponent.getPublicInstance());
        }
      });
      ReactUpdates.ReactReconcileTransaction.release(transaction);
    });

    // needed for react-devtools
    ReactUMGMount._instancesByReactRootID[rootId] = nextComponent;
    NodeMap[nextComponent] = umgWidget;
 
    umgWidget.JavascriptContext = Context;
    umgWidget.proxy = {
      OnDestroy: (bReleaseChildren) => {
        console.log('_on destroy', umgWidget);
        if (nextComponent.getPublicInstance()) {
          ReactUMGMount.unmountComponent(nextComponent.getPublicInstance())                            
        }
      }
    }

    return nextComponent.getPublicInstance();
  },

  /**
   * Take a component that’s already mounted and replace its props
   */
  _updateRootComponent(
    prevComponent, // component instance already in the DOM
    nextElement, // component instance to render
    container, // firmata connection port
    callback // function triggered on completion
  ) {
    ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement);
    if (callback) {
      ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
    }

    return prevComponent;
  },

  renderComponent(
    rootID,
    container,
    nextComponent,
    nextElement,
    board, // Firmata instnace
    callback
  ) {

    const component = nextComponent || instantiateReactComponent(nextElement);

    // The initial render is synchronous but any updates that happen during
    // rendering, in componentWillMount or componentDidMount, will be batched
    // according to the current batching strategy.
    ReactUpdates.batchedUpdates(() => {
      // Batched mount component
      const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(() => {

        component.mountComponent(
          transaction,
          rootID,
          {_idCounter: 0},
          {}
        );
        if (callback) {
          const publicInst = component.getPublicInstance();
          callback(publicInst);
        }
      });
      ReactUpdates.ReactReconcileTransaction.release(transaction);
    });

    return component.getPublicInstance();
  },
  unmountComponent(instance) {
    const internalInstance = ReactInstanceMap.get(instance);
    if (internalInstance) {
      let widget = ReactUMGMount.findNode(internalInstance);
      if (widget) {
        const rootId = ReactInstanceHandles.createReactRootID(widget.reactUmgId);
        delete UmgRoots[rootId];
        delete ReactUMGMount._instancesByReactRootID[rootId];
        delete NodeMap[internalInstance];
      } 
      internalInstance.unmountComponent();
    }
    else {
      instance.unmountComponent();
    }
  },
  findNode(instance) {
    return NodeMap[instance];
  }, 
  wrap(nextElement, outer = Root.GetEngine ? JavascriptLibrary.CreatePackage(null,'/Script/Javascript') : GWorld) {
    let widget = Root.GetEngine ? new JavascriptWidget(outer) : GWorld.CreateWidget(JavascriptWidget);
    let instance = ReactUMGMount.render(nextElement, widget);
    return ReactUMGMount.findNode(instance) 
  }
};

module.exports = ReactUMGMount;
