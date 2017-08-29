var inherit = require('core/utils/utils').inherit;
var base = require('core/utils//utils').base;
var FeaturesStore = require('./featuresstore');
var Feature = require('./feature');

// Storage delle features di un layer vettoriale
function OlFeaturesStore(options) {
  base(this, options);
  this._features = new ol.Collection();
}

inherit(OlFeaturesStore, FeaturesStore);

proto = OlFeaturesStore.prototype;

proto.getFeaturesCollection = function() {
  return this._features;
};

proto.getFeatureByPk = function(featurePk) {
  var feat;
  _.forEach(this._features.getArray(), function(feature) {
    if (feature.getPk() == featurePk) {
      feat = feature;
      return false;
    }
  });
  return feat;
};

//vado ad eseguire in pratica la sostituzione della feature dopo una modifica
proto._updateFeature = function(feature) {
  this._features.forEach(function(feat, idx, array) {
    if (feat.getPk() == feature.getPk()) {
      this.setAt(idx, feature);
      return false;
    }
  }, this._features);
};

// funzione che va a rimuovere la feature
proto._removeFeature = function(feature) {
  this._features.forEach(function(feat, idx, array) {
    if (feature.getPk() == feat.getPk()) {
      this.removeAt(idx);
      return false
    }
  }, this._features)
};

proto._clearFeatures = function() {
  // vado a rimuovere le feature in modo reattivo (per vue) utlizzando metodi che vue
  // possa reagire allacancellazione di elementi di un array
  this._features.clear();
};

module.exports = OlFeaturesStore;