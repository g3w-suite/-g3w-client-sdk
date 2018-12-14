const inherit = require('core/utils/utils').inherit;
const base = require('core/utils/utils').base;
const BaseLayer = require('core/layers/baselayers/baselayer');
const BasesLayers = require('g3w-ol3/src/layers/bases');

function WMTSLayer(options={}) {
  this.config = options;
  base(this,options);
}

inherit(WMTSLayer, BaseLayer);

const proto = WMTSLayer.prototype;

proto._makeOlLayer = function() {
  //use this config to get params
  const {url, layer, attributions, crs} = this.config;
  const olLayer = BasesLayers.WMTS.get({
    url,
    layer,
    attributions,
    crs
  });
  return olLayer
};


module.exports = WMTSLayer;
