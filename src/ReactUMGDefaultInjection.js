'use strict';

/**
 * React UMG Default Injection
 */
require('./devtools/InitializeJavaScriptAppEngine');
const ReactInjection = require('react/lib/ReactInjection');
const ReactDefaultBatchingStrategy = require('react/lib/ReactDefaultBatchingStrategy');
const ReactComponentEnvironment = require('react/lib/ReactComponentEnvironment');
const ReactUMGReconcileTransaction = require('./ReactUMGReconcileTransaction');
const ReactUMGComponent = require('./ReactUMGComponent');
const ReactUMGEmptyComponent = require('./ReactUMGEmptyComponent');
var alreadyInjected = false;

function inject() {
  if (alreadyInjected) {
    // TODO: This is currently true because these injections are shared between
    // the client and the server package. They should be built independently
    // and not share any injection state. Then this problem will be solved.
    return;
  }
  alreadyInjected = true;

  ReactInjection.HostComponent.injectGenericComponentClass(
    ReactUMGComponent
  );

  // // Maybe?
  ReactInjection.HostComponent.injectTextComponentClass(
    function(instantiate) {return new ReactUMGEmptyComponent(instantiate)}
  );

  ReactInjection.Updates.injectReconcileTransaction(
    ReactUMGReconcileTransaction
  );

  ReactInjection.Updates.injectBatchingStrategy(
    ReactDefaultBatchingStrategy
  );

  ReactInjection.EmptyComponent.injectEmptyComponentFactory(
    function(instantiate){ return new ReactUMGEmptyComponent(instantiate) }
  );

  ReactComponentEnvironment.processChildrenUpdates = function() {};
  ReactComponentEnvironment.replaceNodeWithMarkup = function() {};
  ReactComponentEnvironment.unmountIDFromEnvironment = function() {};
}

module.exports = inject