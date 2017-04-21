var inherit = require('core/utils/utils').inherit;
var base = require('core/utils/utils').base;
var ProjectsRegistry = require('core/project/projectsregistry');
var GUI = require('gui/gui');
var G3WObject = require('core/g3wobject');
var ComponentsRegistry = require('gui/componentsregistry');
var QueryService = require('core/query/queryservice');
var PhotoComponent = require('./components/photo/vue/photo');
var RelationsPage = require('./components/relations/vue/relationspage');


function QueryResultsService() {
  var self = this;
  // prendo le relazioni dal progetto e se ci sono e le raggruppo per referencedLayer
  this._relations = ProjectsRegistry.getCurrentProject().state.relations ? _.groupBy(ProjectsRegistry.getCurrentProject().state.relations,'referencedLayer'): null;
  this._actions = {
    'zoomto': QueryResultsService.zoomToElement,
    'highlightgeometry': QueryResultsService.highlightGeometry,
    'clearHighlightGeometry': QueryResultsService.clearHighlightGeometry
  };
  this.state = {};
  this.init = function(options) {
    this.clearState();
  };

  // array dei layers vettoriali
  this._vectorLayers = [];

  this.setters = {
    setQueryResponse: function(queryResponse, coordinates, resolution ) {
      this.clearState();
      this.state.query = queryResponse.query;
      //recupero tutti i mlayers dalll'attributo data della risposta
      // costuendo il formato digeribile dal componente query
      var layers = this._digestFeaturesForLayers(queryResponse.data);
      //setto i layers data
      this.setLayersData(layers);
    },
    setLayersData: function(layers) {
      // un opportunità per aggiungere / modificare i risultati dell'interrogazione
      this.state.loading = false;
      this.state.layers =  layers;
      this.setActionsForLayers(layers);
    },
    addActionsForLayers: function(actions) {
      // un opportunità per i listener per aggiungere azioni a layer e feature
    },
    postRender: function(element) {
      // un opportunità per i listener di intervenire sul DOM
    }
  };
  // fa il clear dello state
  this.clearState = function() {
    this.state.layers = [];
    this.state.query = {};
    this.state.querytitle = "";
    this.state.loading = true;
    this.state.layersactions = {};
  };

  this.getState = function() {
    return this.state;
  };

  this.setState = function(state) {
    this.state = state;
  };

  this.setTitle = function(querytitle) {
    this.state.querytitle = querytitle || "";
  };
  
  this.reset = function() {
    this.clearState();
  };
  // funzione che serve a far digerire i risultati delle features
  this._digestFeaturesForLayers = function(featuresForLayers) {
    var self = this;
    var id = 0;
    // variabile che tiene traccia dei layer sotto query
    var layers = [];
    _.forEach(featuresForLayers, function(featuresForLayer) {
      // prendo il layer
      var layer = featuresForLayer.layer;
      // verifico che ci siano feature legate a quel layer che sono il risultato della query
      if (featuresForLayer.features.length) {
        // se si vado a csotrure un layer object
        var layerObj = {
          title: layer.state.title,
          id: layer.state.id,
          // prendo solo gli attributi effettivamente ritornati dal WMS (usando la prima feature disponibile)
          attributes: self._parseAttributes(layer.getAttributes(), featuresForLayer.features[0].getProperties()),
          features: [],
          hasgeometry: false,
          show: true,
          expandable: true,
          hasImageField: false, // regola che mi permette di vedere se esiste un campo image
          relationsattributes: layer.getRelationsAttributes()
        };
        // faccio una ricerca sugli attributi del layer se esiste un campo image
        // se si lo setto a true
        _.forEach(layerObj.attributes, function(attribute) {
          if (attribute.type == 'image') {
            layerObj.hasImageField = true;
          }
        });
        // a questo punto scorro sulle features selezionate dal risultato della query
        _.forEach(featuresForLayer.features, function(feature){
          var fid = feature.getId() ? feature.getId() : id;
          var geometry = feature.getGeometry();
          // verifico se il layer ha la geometria
          if (geometry) {
            // setto che ha geometria mi servirà per le action
            layerObj.hasgeometry = true
          }
          // creo un feature object
          var featureObj = {
            id: fid,
            attributes: feature.getProperties(),
            geometry: feature.getGeometry(),
            show: true
            // aggiungo le relazioni
          };
          layerObj.features.push(featureObj);
          id += 1;
        });
        layers.push(layerObj);
      }
    });
    return layers;
  };
  
  this._parseAttributes = function(layerAttributes, featureAttributes) {
    var featureAttributesNames = _.keys(featureAttributes);
    featureAttributesNames = _.filter(featureAttributesNames,function(featureAttributesName){
      return ['boundedBy','geom','the_geom','geometry','bbox', 'GEOMETRY'].indexOf(featureAttributesName) == -1;
    });
    if (layerAttributes && layerAttributes.length) {
      var featureAttributesNames = _.keys(featureAttributes);
      return _.filter(layerAttributes,function(attribute){
        return featureAttributesNames.indexOf(attribute.name) > -1;
      })
    }
    // se layer.attributes è vuoto
    // (es. quando l'interrogazione è verso un layer esterno di cui non so i campi)
    // costruisco la struttura "fittizia" usando l'attributo sia come name che come label
    else {
      return _.map(featureAttributesNames, function(featureAttributesName){
        return {
          name: featureAttributesName,
          label: featureAttributesName
        }
      })
    }
  };

  // metodo per settare le azioni che si possono fare sulle feature del layer
  this.setActionsForLayers = function(layers) {
    var self = this;
    // scorro su ogni layer che ho nella risposta
    _.forEach(layers, function(layer) {
      // se non esistono azioni su uno specifico layer creo
      // array di azioni con chiave id del layer (in quanto valore univoco)
      if (!self.state.layersactions[layer.id]) {
        self.state.layersactions[layer.id] = [];
      }
      // verifico se il layer ha gemetria
      if (layer.hasgeometry) {
        // se prsente aggiungo oggetto azione che mi server per fare
        // il goTo geometry
        self.state.layersactions[layer.id].push({
          id: 'gotogeometry',
          class: 'glyphicon glyphicon-map-marker',
          hint: 'Visualizza sulla mappa',
          cbk: QueryResultsService.goToGeometry
        })
      }
      // vado a costruire l'action delle query-relazioni
      if (self._relations) {
        // scorro sulle relazioni e vado a verificare se ci sono relazioni che riguardano quel determintato layer
        _.forEach(self._relations, function(relations, id) {
          // verifico se l'id del layer è uguale all'id della relazione
          if (layer.id == id) {
            self.state.layersactions[layer.id].push({
              id: 'show-query-relations',
              class: 'fa fa-sitemap',
              hint: 'Visualizza Relazioni',
              cbk: QueryResultsService.showQueryRelations,
              relations: relations
            })
          }
          return false;
        })
      }
    });
    this.addActionsForLayers(self.state.layersactions);
  };
  
  this.trigger = function(actionId, layer, feature) {
    var actionMethod = this._actions[actionId];
    if (actionMethod) {
      actionMethod(layer, feature);
    }
    if (layer) {
      var layerActions = self.state.layersactions[layer.id];
      if (layerActions) {
        var action;
        _.forEach(layerActions, function(layerAction){
          if (layerAction.id == actionId) {
            action = layerAction;
          }
        });
        if (action) {
          this.triggerLayerAction(action,layer,feature);
        }
      }
    }
  };

  this.triggerLayerAction = function(action,layer,feature) {
    if (action.cbk) {
      action.cbk(layer,feature, action)
    }
    if (action.route) {
      var url;
      var urlTemplate = action.route;
      url = urlTemplate.replace(/{(\w*)}/g,function(m,key){
        return feature.attributes.hasOwnProperty(key) ? feature.attributes[key] : "";
      });
      if (url && url != '') {
        GUI.goto(url);
      }
    }
  };

  //funzione che permette di vedere la foto a schermo intero
  this.showFullPhoto = function(url) {
    GUI.pushContent({
      content: new PhotoComponent({
        url: url
      }),
      backonclose: true,
      closable: false
    });
  };

  // funzione che mi serve per registrare i vector layer al fine di fare le query
  this.registerVectorLayer = function(vectorLayer) {
    if (this._vectorLayers.indexOf(vectorLayer) == -1) {
      //vado ad aggiungere informazioni utili alla visualizzazioni nel query
      vectorLayer.state = {};
      vectorLayer.state.title = vectorLayer.name;
      vectorLayer.state.id = vectorLayer.id;
      this._vectorLayers.push(vectorLayer);
    }
  };

  // funzione che permette ai laye fvettoriali di aggancirsi alla query info
  this._addVectorLayersDataToQueryResponse = function() {
    this.onbefore('setQueryResponse', function (queryResponse, coordinates, resolution) {
      var mapService = ComponentsRegistry.getComponent('map').getService();
      _.forEach(self._vectorLayers, function(vectorLayer) {
        // la prima condizione mi server se viene fatto un setQueryResponse sul singolo layer vettoriale
        // ad esempio con un pickfeature per evitare che venga scatenato un'altra query
        // nel caso di attivazione di uno dei query control (la momento bbox, info e polygon)
        // la setQueryresponse ha priorità sugli altri di fatto cancellando la setResqponseqeusry dello specifico vectorLayer
        if ((queryResponse.data.length && queryResponse.data[0].layer == vectorLayer) || !coordinates || !vectorLayer.isVisible()) { return }
        var features = [];
        // caso in cui è stato fatto una precedente richiesta identify e quindi devo attaccare il risultato
        // non mi piace perchè devo usare altro metodo
        var layerFilter = function(mapLayer) {
          return mapLayer === vectorLayer;
        };
        // caso query info
        if (_.isArray(coordinates)) {
          if (coordinates.length == 2) {
            var pixel = mapService.viewer.map.getPixelFromCoordinate(coordinates);
            var feature = mapService.viewer.map.forEachFeatureAtPixel(pixel, function (feature, vectorLayer) {
              return feature;
            }, this, layerFilter);
            if(feature) {
              QueryService.convertG3wRelations(feature);
              features.push(feature);
            }
          } else if (coordinates.length == 4) {
            features = vectorLayer.getIntersectedFeatures(ol.geom.Polygon.fromExtent(coordinates));
          }
        } else if (coordinates instanceof ol.geom.Polygon || coordinates instanceof ol.geom.MultiPolygon) {
          features = vectorLayer.getIntersectedFeatures(coordinates);
        }
        _.forEach(features, function(feature) {
          QueryService.convertG3wRelations(feature);
        });
        // vado a pushare le features
        queryResponse.data.push({
          features: features,
          layer: vectorLayer
        });
      })
    });
  };

  base(this);

  // lancio subito la registrazione
  this._addVectorLayersDataToQueryResponse();


}
QueryResultsService.zoomToElement = function(layer,feature) {

};

QueryResultsService.goToGeometry = function(layer,feature) {
  if (feature.geometry) {
    var mapService = ComponentsRegistry.getComponent('map').getService();
    mapService.highlightGeometry(feature.geometry, {duration: 4000});
  }
};

QueryResultsService.highlightGeometry = function(layer,feature) {
  if (feature.geometry) {
    var mapService = ComponentsRegistry.getComponent('map').getService();
    mapService.highlightGeometry(feature.geometry,{zoom: false});
  }
};

QueryResultsService.clearHighlightGeometry = function(layer, feature) {
  var mapService = ComponentsRegistry.getComponent('map').getService();
  mapService.clearHighlightGeometry();
};

QueryResultsService.showQueryRelations = function(layer, feature, action) {
  GUI.pushContent({
    content: new RelationsPage({
      relations: action.relations,
      feature: feature
    }),
    backonclose: true,
    closable: false
  });
};

// Make the public service en Event Emitter
inherit(QueryResultsService, G3WObject);

module.exports = QueryResultsService;
