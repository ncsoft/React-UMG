"use strict";

const _ = require('lodash');
const ReactUMGClassMap = require('./ReactUMGClassMap');
const ClassMap = JavascriptLibrary.GetDerivedClasses(Widget, [], true)
const {set_attrs, set_attr} = require('./set_attrs');

const mappingTable = {
  'VerticalBox': 'div',
  'HorizontalBox': 'span',
  'TextBlock': 'text',
  'Image': 'img',
  'EditableText': 'input'
}

function registerComponent(key, cls) {
  class klass {
    static createUmgElement(element, instantiator) {
      let elem = instantiator(cls);
      let props = _.pickBy(element.props, (v, k) => k != 'children')
      set_attrs(elem, props)
      return elem
    }

    static applyProperty(umgElem, value, key) {
      if (!umgElem) return;
      if (key != 'children') {
        set_attr(umgElem, key, value)
      }
    }
  }
  ReactUMGClassMap[key] = klass;
}

ClassMap.Results.forEach(cls => {
  const key = _.first(_.last(JavascriptLibrary.GetClassPathName(cls).split('.')).split('_'));
  if (mappingTable[key]) {
    registerComponent(mappingTable[key], cls)
  }
  registerComponent('u' + key, cls)
})

module.exports = {
  Register: registerComponent
};