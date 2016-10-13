var inherit = require('core/utils/utils').inherit;
var base = require('core/utils/utils').base;
var resolve = require('core/utils/utils').resolve;
var reject = require('core/utils/utils').reject;
var BaseComponent = require('gui/component');

var Component = function(options) {
  base(this,options);
};

inherit(Component, BaseComponent);

var proto = Component.prototype;

// viene richiamato dalla toolbar quando il plugin chiede di mostrare un proprio pannello nella GUI (GUI.showPanel)
proto.mount = function(parent,append) {
  if (!this.internalComponent) {
    this.setInternalComponent();
  };
  if(append) {
    this.internalComponent.$mount().$appendTo(parent);
  }
  else {
    this.internalComponent.$mount(parent);
  }
  $(parent).localize();
  return resolve(true);
};

// richiamato quando la GUI chiede di chiudere il pannello. Se ritorna false il pannello non viene chiuso
proto.unmount = function() {
  // il problema che distruggere
  this.internalComponent.$destroy(true);
  this.internalComponent = null;
  return resolve();
};

proto.hide = function() {
  console.log(this.internalComponent.$el);
};

module.exports = Component;
