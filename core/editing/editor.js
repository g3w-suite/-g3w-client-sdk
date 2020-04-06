const inherit = require('core/utils/utils').inherit;
const base = require('core/utils//utils').base;
const G3WObject = require('core/g3wobject');
const FeaturesStore = require('core/layers/features/featuresstore');
const OlFeaturesStore = require('core/layers/features/olfeaturesstore');
const Layer = require('core/layers/layer');
const ChangesManager = require('./changesmanager');

// class Editor bind editor to layer to do main actions
function Editor(options={}) {
  this.setters = {
    save: function() {
      this._save();
    },
    addFeature: function(feature) {
      this._addFeature(feature);
    },
    updateFeature: function(feature) {
      this._updateFeature(feature);
    },
    deleteFeature: function(feature) {
      this._deleteFeature(feature);
    },
    setFeatures: function(features=[]) {
      this._setFeatures(features);
    },
    getFeatures: function(options={}) {
      return this._getFeatures(options);
    }
  };
  base(this);
  // referred layer
  this._layer = options.layer;
  // editing featurestore
  this.featurestore = this._layer.getType() === Layer.LayerTypes.TABLE ? new FeaturesStore() : new OlFeaturesStore();
  // editor is active or not
  this._started = false;
}

inherit(Editor, G3WObject);

const proto = Editor.prototype;

proto._applyChanges = function(items, reverse=true) {
  ChangesManager.execute(this._featuresstore, items, reverse);
};

proto.getLayer = function() {
  return this._layer;
};

proto.setLayer = function(layer) {
  this._layer = layer;
  return this._layer;
};

//clone features method
proto._cloneFeatures = function(features) {
  return features.map((feature) => feature.clone());
};

proto._addFeaturesFromServer = function(features=[]){
  features = this._cloneFeatures(features);
  this._featuresstore.addFeatures(features);
};

// fget features methods
proto._getFeatures = function(options={}) {
  const d = $.Deferred();
  this._layer.getFeatures(options)
    .then((promise) => {
      promise.then((features) => {
        this._addFeaturesFromServer(features);
        return d.resolve(features);
      }).fail((err) => {
        return d.reject(err);
      })
    })
    .fail(function (err) {
      d.reject(err);
    });
  return d.promise();
};

// method to revert (cancel) all changes in history and clean session
proto.revert = function() {
  const d = $.Deferred();
  const features  = this._cloneFeatures(this._layer.readFeatures());
  this._featuresstore.setFeatures(features);
  d.resolve();
  return d.promise();
};

proto.rollback = function(changes) {
  const d = $.Deferred();
  this._applyChanges(changes, true);
  d.resove();
  return d.promise()
};
// run after server apply chaged to origin resource
proto.commit = function(commitItems, featurestore) {
  const d = $.Deferred();
  this._layer.commit(commitItems, featurestore)
    .then((promise) => {
      promise
        .then((response) => {
          // update features after new insert
          return d.resolve(response);
        })
        .fail((err) => {
        return d.reject(err);
      })
    })
    .fail((err) => {
      d.reject(err);
    });
  return d.promise();
};

//start editing function
proto.start = function(options) {
  const d = $.Deferred();
  // load features of layer based on filter type
  this.getFeatures(options)
    .then((promise) => {
      promise
        .then((features) => {
          // the features are already inside featuresstore
          d.resolve(features);
          //if all ok set to started
          this._started = true;
        })
        .fail((err) => {
          d.reject(err);
        })

    })
    .fail((err) => {
      d.reject(err);
    });
  return d.promise()
};

//action to layer

proto._addFeature = function(feature) {
  this._layer.addFeature(feature);
};

proto._deleteFeature = function(feature) {
  this._layer.deleteFeature(feature);
};

proto._updateFeature = function(feature) {
  this._layer.updateFeature(feature);
};

proto._setFeatures = function(features) {
  this._layer.setFeatures(features);
};

proto.readFeatures = function(){
  return this._layer.readFeatures();
};

// stop editor
proto.stop = function() {
  const d = $.Deferred();
  this._layer.unlock()
    .then((response) => {
      this._started = false;
      this.clear();
      d.resolve(response);
    })
    .fail((err) => {
      d.reject(err);
    });
  return d.promise();
};

//run save layer
proto._save = function() {
  this._layer.save();
};

proto.isStarted = function() {
  return this._started;
};

proto.clear = function() {
  this._layer.getFeaturesStore().clear();
};


module.exports = Editor;
