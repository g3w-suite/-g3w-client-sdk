const inherit = require('core/utils/utils').inherit;
const base = require('core/utils//utils').base;
const G3WObject = require('core/g3wobject');
const History = require('./history');
const FeaturesStore = require('core/layers/features/featuresstore');
const ChangesManager = require('./changesmanager');
const SessionsRegistry = require('./sessionsregistry');

// classe Session
function Session(options = {}) {
  this.setters = {
    start: function(options={}) {
      return this._start(options);
    },
    getFeatures: function(options) {
      return this._getFeatures(options);
    },
    stop: function() {
      this._stop();
    }
  };
  base(this, options);
  this.state = {
    id: options.id, // id session is the same of id layer
    started: false
  };
  // editor
  this._editor = options.editor || null;
  // featuresstore che contiene tutte le modifiche che vengono eseguite al layer
  // è la versione temporanea del features store de singolo editor
  this._featuresstore = options.featuresstore || new FeaturesStore();
  // history -- oggetto che contiene gli stati dei layers
  this._history = new History({
    id: this.state.id
  });
  // contenitore temporaneo che servirà a salvare tutte le modifiche
  // temporanee che andranno poi salvate nella history e nel featuresstore
  this._temporarychanges = [];
}

inherit(Session, G3WObject);

const proto = Session.prototype;

proto.getId = function() {
  return this.state.id;
};

proto.getLastStateId = function() {
  return this._history.getLastState().id;
};

proto.deleteState = function(stateId) {
  this._history.removeState(stateId);
};

proto._start = function(options={}) {
  const d = $.Deferred();
  // vado a registrare la sessione
  SessionsRegistry.register(this);
  this._editor.start(options)
    .then((features) => {
      // return feature from server - clone it
      const sessionfeatures = this._cloneFeatures(features);
      // add clone feature to internal features store
      this._featuresstore.addFeatures(sessionfeatures);
      this.state.started = true;
      d.resolve(sessionfeatures);
    })
    .fail((err) => {
      this.state.started = true;
      d.reject(err);
    });
  return d.promise();
};

//method to getFeature from server through editor
proto._getFeatures = function(options) {
  const d = $.Deferred();
  this._editor.getFeatures(options)
    .then((promise) => {
      promise.then((features) => {
        features = this._cloneFeatures(features);
        this._featuresstore.addFeatures(features);
        d.resolve(features);
      })
      .fail((err) => {
        d.reject(err);
      });
    });
  return d.promise();
};

//clone features method
proto._cloneFeatures = function(features) {
  return features.map((feature) => feature.clone());
};

proto.isStarted = function() {
  return this.state.started;
};

proto.getEditor = function() {
  return this._editor;
};

proto.setEditor = function(editor) {
  this._editor = editor;
};

//restituisce il feature store della sessione
proto.getFeaturesStore = function() {
  return this._featuresstore;
};

// it used to save temporary changes to the layer
// in history instance and feature store
proto.save = function(options={}) {
  //fill history
  //console.log("Session Saving .... ");
  const d = $.Deferred();
  // add temporary modify to history
  if (this._temporarychanges.length) {
    const uniqueId = options.id || Date.now();
    this._history.add(uniqueId, this._temporarychanges)
      .then(() => {
        // clear to temporary changes
        this._temporarychanges = [];
        // resolve if uniqeu id
        d.resolve(uniqueId);
      });
  } else {
    d.resolve(null);
  }
  return d.promise();
};

proto.updateTemporaryChanges = function(feature) {
  this._temporarychanges.forEach((change) => {
    change.feature.setProperties(feature.getProperties());
  })
};

// method to add temporary feature
proto.pushAdd = function(layerId, feature) {
  const newFeature = feature.clone();
  this.push({
    layerId: layerId,
    feature: newFeature.add()
  })
};

// delete temporary feature
proto.pushDelete = function(layerId, feature) {
  this.push({
    layerId: layerId,
    feature: feature.delete()
  })
};

// add temporary feature changes
proto.pushUpdate = function(layerId, newFeature, oldFeature) {
  // in case of change attribute immediately after create feature
  if (newFeature.isNew()) {
    const temporarynewfeatureIndex = this._temporarychanges.findIndex((change) => {
      return change.layerId === layerId && change.feature.getId() === newFeature.getId();
    });
    if (temporarynewfeatureIndex !== -1) {
      const feature = newFeature.clone();
      feature.add();
      this._temporarychanges[temporarynewfeatureIndex].feature = feature;
      return;
    }
  }
  this.push({
      layerId: layerId,
      feature: newFeature.update()
    },
    {
      layerId: layerId,
      feature: oldFeature.update()
    })
};

proto.removeChangesFromHistory = function(changeIds = []) {
  this._history.removeStates(changeIds);
};

proto.moveRelationStatesOwnSession = function() {
  const statesIds = {};
  const {relations:relationItems } = this.getCommitItems();
  for (let relationLayerId in relationItems) {
    const relationStates = this._history.getRelationStates(relationLayerId);
    const relationSession = SessionsRegistry.getSession(relationLayerId);
    relationSession._history.insertStates(relationStates);
    statesIds[relationLayerId] = relationStates.map(state => state.id);
  }
  return statesIds;
};

// it used to add temporary features
// that will be added with save method
proto.push = function(New, Old) {
  /*
  New e Old saranno oggetti contenti {
      layerId: xxxx,
      feature: feature
    }
   */
  // check is set old (edit)
  const feature = Old? [Old, New]: New;
  this._temporarychanges.push(feature);
};

proto._applyChanges = function(items, reverse=true) {
  ChangesManager.execute(this._featuresstore, items, reverse);
};

// method to revert (cancel) all changes in history and clen session
proto.revert = function() {
  var d = $.Deferred();
  this._editor.getFeatures().then((promise) => {
    promise
      .then((features)  =>{
        features =  this._cloneFeatures(features);
        this.getFeaturesStore().setFeatures(features);
        this._history.clear();
        d.resolve();
      })
      .fail((err) => {
        d.reject(err);
      })
  });
  return d.promise();
};

// organizza i cambiamenti temporanei in base al layer coinvolto
proto._filterChanges = function() {
  const id = this.getId();
  const changes = {
    own:[],
    dependencies: {}
  };
  this._temporarychanges.forEach((temporarychange) => {
    const change = Array.isArray(temporarychange) ? temporarychange[0] : temporarychange;
    if (change.layerId == id)
      changes.own.push(change);
    else {
      if (!changes.dependencies[change.layerId])
        changes.dependencies[change.layerId] = [];
      // le vado a posizionare dal più recente al più lontano in ordine inverso FILO
      changes.dependencies[change.layerId].unshift(change);
    }
  });
  return changes;
};

// questa in pratica restituirà tutte le modifche che non saranno salvate nella history
// e nel featuresstore della sessione ma riapplicate al contrario
proto.rollback = function(changes) {
  //vado a after il rollback dellle feature temporanee salvate in sessione
  //console.log('Session Rollback.....', changes);
  const d = $.Deferred();
  if (changes) {
    this._applyChanges(changes, true);
    d.resolve();
  }  else {
    changes = this._filterChanges();
    // apply changes to featurestore (rollback temporary changes)
    this._applyChanges(changes.own, true);
    this._temporarychanges = [];
    d.resolve(changes.dependencies);
  }
  return d.promise()
};

// method undo
proto.undo = function(items) {
  items = items || this._history.undo();
  this._applyChanges(items.own, true);
  this._history.canCommit();
  return items.dependencies;
};

// method redo
proto.redo = function(items) {
  items = items || this._history.redo();
  this._applyChanges(items.own, true);
  this._history.canCommit();
  return items.dependencies;
};

proto._serializeCommit = function(itemsToCommit) {
  const id = this.getId();
  let state;
  let layer;
  const commitObj = {
    add: [],
    update: [],
    delete: [],
    relations: {}
  };
  for (const key in itemsToCommit) {
    let isRelation = false;
    const items = itemsToCommit[key];
    if (key !== id) {
      isRelation = true;
      var lockids = SessionsRegistry.getSession(key) ? SessionsRegistry.getSession(key).getEditor().getLayer().getFeaturesStore().getLockIds(): [];
      commitObj.relations[key] = {
        lockids,
        add: [],
        update: [],
        delete: []
      };
      layer = commitObj.relations[key];
    } else {
      layer = commitObj
    }
    items.forEach((item) => {
      state = item.getState();
      const GeoJSONFormat = new ol.format.GeoJSON();
      switch (state) {
        case 'delete':
          if (!item.isNew())
            layer.delete.push(item.getId());
          break;
        default:
          const value = GeoJSONFormat.writeFeatureObject(item);
          const childs_properties = item.getProperties();
          for (const key in value.properties) {
           if (value.properties[key] && typeof value.properties[key] === 'object' && value.properties[key].constructor === Object)
             value.properties[key] = value.properties[key].value;
           if (value.properties[key] === undefined && childs_properties[key])
             value.properties[key] = childs_properties[key]
          }
          layer[item.getState()].push(value);
          break;
      }
    });
    // check in case of no edit remove relation key
    if (isRelation && !layer.add.length && !layer.update.length && !layer.delete.length) {
      delete commitObj.relations[key];
    }
  }
  return commitObj;
};

proto.getCommitItems = function() {
  const commitItems = this._history.commit();
  return this._serializeCommit(commitItems);
};

// funzione che serializzerà tutto che è stato scritto nella history e passato al server
// per poterlo salvare nel database
proto.commit = function({ids=null, relations=true}={}) {
  const d = $.Deferred();
  let commitItems;
  //console.log("Sessione Committing...");
  //vado a verificare se nell'opzione del commit
  // è stato passato gli gli ids degli stati che devono essere committati,
  //nel caso di non specifica committo tutto
  // vado a leggete l'id dal layer necessario al server
  if (ids) {
    commitItems = this._history.commit(ids);
    this._history.clear(ids);
  } else {
    // andà a pescare dalla history tutte le modifiche effettuare
    // e si occuperà di di eseguire la richiesta al server di salvataggio dei dati
    commitItems = this._history.commit();
    // le serializzo
    commitItems = this._serializeCommit(commitItems);
    // if relations.is set to false no relations are commitetted to server
    if (!relations) commitItems.relations = {};
    // in case op
    // passo all'editor un secondo parametro.
    this._editor.commit(commitItems, this._featuresstore)
      .then((response) => {
        if (response && response.result)
          // if the response of server is correct clear history
          this._featuresstore.readFeatures().forEach((feature) => {
            feature.clearState();
          });
          this._history.clear();
        d.resolve(commitItems, response)
      })
      .fail((err) => {
        d.reject(err);
      });
  }
  return d.promise();
};

//stop session
proto._stop = function() {
  const d = $.Deferred();
  // unregister a session
  SessionsRegistry.unregister(this.getId());
  //console.log('Sessione stopping ..');
  this._editor.stop()
    .then(() => {
      d.resolve();
    })
    .fail((err) =>  {
      d.reject(err);
    });
  this.clear();
  return d.promise();

};

// clear all things bind to session
proto.clear = function() {
  this.state.started = false;
  // clar related history
  this._clearHistory();
  // clear a learestor
  this._featuresstore.clear();
};

//return l'history
proto.getHistory = function() {
  return this._history;
};

// clear history
proto._clearHistory = function() {
  this._history.clear();
};

module.exports = Session;
