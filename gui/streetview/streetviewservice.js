const inherit = require('core/utils/utils').inherit;
const base = require('core/utils/utils').base;
const G3WObject = require('core/g3wobject');
const GUI = require('gui/gui');
const StreetViewComponent = require('gui/streetview/vue/streetview');

function StreetViewService() {
  this._position = null;
  this.setters = {
    postRender: function(position) {}
  };

  this.getPosition = function() {
    return this._position;
  };

  this.showStreetView = function(position) {
    this._position = position;
    GUI.setContent({
      content: new StreetViewComponent({
        service: this
      }),
      title: 'StreetView'
    });
  };
  base(this);
}

inherit(StreetViewService, G3WObject);

module.exports = StreetViewService;
