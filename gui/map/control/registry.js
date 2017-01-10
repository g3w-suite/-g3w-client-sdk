var inherit = require('core/utils/utils').inherit;
var base = require('core/utils/utils').base;
var G3WObject = require('core/g3wobject');
var GUI = require('gui/gui');

function ControlsRegistry() {
  base(this);
  this._controls = {};

  this.registerControl = function(id, control) {
    this._controls[id] = control;
  };

  this.getControl = function(id) {
    return this._controls[id];
  };

  this.getControls = function() {
    return this._controls;
  };

  this.unregisterControl = function(id) {
    var control = this.getControl(id);
    var mapService = GUI.getComponet('map').getService();
    var map = mapService.getMap();
    if (control) {
      map.removeControl(control);
      delete this._controls[id];
      return true
    }
    return false
  }
}
inherit(ControlsRegistry,G3WObject);

module.exports = new ControlsRegistry;
