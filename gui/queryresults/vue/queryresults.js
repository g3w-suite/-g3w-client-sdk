var inherit = require('core/utils/utils').inherit;
var base = require('core/utils/utils').base;
var merge = require('core/utils/utils').merge;
var Component = require('gui/vue/component');
var G3WObject = require('core/g3wobject');
var QueryResultsService = require('gui/queryresults/queryresultsservice');

//Fields.simpleFieldTypes = [Fields.STRING,Fields.INTEGER,Fields.FLOAT];
Fields = {};
Fields.SIMPLE = 'simple';
Fields.LINK = 'link';
Fields.PHOTO = 'photo';
Fields.POINTLINK = 'pointlink';
Fields.ROUTE = 'route';

function getFieldType(layer,name,value) {
  var URLPattern = /^(https?:\/\/[^\s]+)/g;
  var PhotoPattern = /[^\s]+.(png|jpg|jpeg)$/g;
  if (_.isNil(value)) {
    return Fields.SIMPLE;
  }

  value = value.toString();

  var extension = value.split('.').pop();
  if (value.match(PhotoPattern)) {
    return Fields.PHOTO;
  }

  if (value.match(URLPattern)) {
    return Fields.LINK;
  }

  return Fields.SIMPLE;
}

/*function isSimple(layer,feature,attribute) {
 var fieldType = getFieldType(layer,feature,attribute);
 return Fields.simpleFieldTypes.indexOf(fieldType) > -1;
 };*/

function fieldIs(TYPE,layer,attributeName,attributeValue) {
  var fieldType = getFieldType(layer,attributeName,attributeValue);
  return fieldType === TYPE;
}

var maxSubsetLength = 3;
var headerExpandActionCellWidth = 10;
var headerActionsCellWidth = 10;

var vueComponentOptions = {
  template: require('./queryresults.html'),
  data: function() {
    return {
      state: this.$options.queryResultsService.state,
      layersFeaturesBoxes: {},
      headerExpandActionCellWidth: headerExpandActionCellWidth,
      headerActionsCellWidth: headerActionsCellWidth
    }
  },
  replace: false,
  methods: {
    isSimple: function(layer,attributeName,attributeValue) {
      return fieldIs(Fields.SIMPLE,layer,attributeName,attributeValue);
    },
    isLink: function(layer,attributeName,attributeValue) {
      return fieldIs(Fields.LINK,layer,attributeName,attributeValue);
    },
    is: function(type,layer,attributeName,attributeValue) {
      return fieldIs(type,layer,attributeName,attributeValue);
    },
    layerHasFeatures: function(layer) {
      if (layer.features) {
        return layer.features.length > 0;
      }
      return false;
    },
    hasResults: function() {
      return this.state.layers.length;
    },
    layerHasActions: function(layer) {
      return this.state.layersactions[layer.id].length > 0;
    },
    featureHasActions: function(layer,feature) {
      return this.geometryAvailable(feature);
    },
    /*getLayerActions: function(layer) {
      return this.$options.queryResultsService.getLayerActions(layer);
    },*/
    geometryAvailable: function(feature) {
      return feature.geometry ? true : false;
    },
    attributesSubset: function(attributes) {
      var end = Math.min(maxSubsetLength, attributes.length);
      return attributes.slice(0, end);
    },
    relationsAttributesSubset: function(relationAttributes) {
      var attributes = [];
      _.forEach(relationAttributes, function (value, attribute) {
        attributes.push({label: attribute, value: value})
      });
      var end = Math.min(maxSubsetLength, attributes.length);
      return attributes.slice(0, end);
    },
    relationsAttributes: function(relationAttributes) {
      var attributes = [];
      _.forEach(relationAttributes, function (value, attribute) {
        attributes.push({label: attribute, value: value})
      });
      return attributes;
    },
    attributesSubsetLength: function(attributes) {
      return this.attributesSubset(attributes).length;
    },
    cellWidth: function(index,layer) {
      var subsetLength = this.attributesSubsetLength(layer.attributes)
      var diff = maxSubsetLength - subsetLength;
      actionsCellWidth = this.layerHasActions(layer) ? headerActionsCellWidth : 0;
      var headerAttributeCellTotalWidth = 100 - headerExpandActionCellWidth - actionsCellWidth;
      var baseCellWidth = headerAttributeCellTotalWidth / maxSubsetLength;
      if ((index == subsetLength-1) && diff>0) {
        return baseCellWidth * (diff+1);
      }
      else {
        return baseCellWidth;
      }
    },
    relationsAttributesSubsetLength: function(elements) {
      return this.relationsAttributesSubset(elements).length;
    },
    collapsedFeatureBox: function(layer, feature, relation_index) {
      var collapsed = true;
      var boxid;
      if (!_.isNil(relation_index)) {
        boxid = layer.id + '_' + feature.id+ '_' + relation_index;
      } else {
        boxid = layer.id + '_' + feature.id;
      }
      if (this.layersFeaturesBoxes[boxid]) {
        collapsed = this.layersFeaturesBoxes[boxid].collapsed;
      }
      return collapsed;
    },
    toggleFeatureBox: function(layer, feature, relation_index) {
      var boxid;
      if (!_.isNil(relation_index)) {
        boxid = layer.id + '_' + feature.id+ '_' + relation_index;
      } else {
        boxid = layer.id + '_' + feature.id;
      }
      this.layersFeaturesBoxes[boxid].collapsed = !this.layersFeaturesBoxes[boxid].collapsed;
    },
    toggleFeatureBoxAndZoom: function(layer, feature, relation_index) {
      if (this.collapsedFeatureBox(layer, feature, relation_index)) {
        this.trigger('gotogeometry',layer,feature)
      }
      this.toggleFeatureBox(layer, feature, relation_index);
    },
    trigger: function(action,layer,feature) {
      this.$options.queryResultsService.trigger(action,layer,feature);
    }
  },
  watch: {
    // i listeners del queryResultsService.postRender potrebbero avere bisogno di modificare il DOM dopo che sono cambiati (per qualsiasi motivo) i dati e quindi Vue rirenderizza il DOM
    'state.layers': function(layers) {
      if (layers.length) {
        this.$options.queryResultsService.postRender(this.$el);
      }
    }
  }
};

// se lo voglio istanziare manualmente
var InternalComponent = Vue.extend(vueComponentOptions);

function QueryResultsComponent(options) {
  base(this,options);
  var self = this;
  this.id = "queryresults";
  this.title = "Query Results";
  this._service = new QueryResultsService();
  //usato quando è stato distrutto
  this.setInternalComponent = function() {
    this.internalComponent = new InternalComponent({
      queryResultsService: this._service
    });
    this.createLayersFeaturesBoxes();
    this.internalComponent.querytitle = this._service.state.querytitle;
  };

  this.getElement = function() {
    if (this.internalComponent) {
      return this.internalComponent.$el;
    }
  };

  this._service.onafter('setLayersData',function(){
    self.createLayersFeaturesBoxes();
  });
  merge(this, options);

  this.createLayersFeaturesBoxes = function() {
    var layersFeaturesBoxes = {};
    var layers = this._service.state.layers;
    _.forEach(layers,function(layer){
      if (layer.attributes.length <= maxSubsetLength) {
        layer.expandable = false;
      }
      _.forEach(layer.features,function(feature,index){
        // se è la prima feature e il layer ha più di maxSubsetLength attributi, allora la espando già in apertura
        //var collapsed = (index == 0 && layer.attributes.length > maxSubsetLength) ? false : true;
        var collapsed = true;
        var boxid = layer.id+'_'+feature.id;
        layersFeaturesBoxes[boxid] = {
          collapsed: collapsed
        };
        if (feature.attributes.relations) {
          boxid = '';
          _.forEach(feature.attributes.relations, function(relation) {
            boxid = layer.id + '_' + feature.id + '_' + relation.name;
            _.forEach(relation.elements, function(element, index){
              layersFeaturesBoxes[boxid+index] = {
                collapsed: true
              };
            });
          })
        }
      })
    });
    this.internalComponent.layersFeaturesBoxes = layersFeaturesBoxes;
  };

  this.mount = function(parent,append) {
    var self = this;
    return base(this,'mount',parent,append).
    then(function(){
      if (self._service.state.layers.length) {
        self._service.postRender(self.getElement());
      }
    });
  };
}
inherit(QueryResultsComponent, Component);

module.exports = QueryResultsComponent;

/*

 var resolvedValue = require('g3w/core/utils').resolvedValue;
 var inherit = require('g3w/core/utils').inherit;
 var base = require('g3w/core/utils').base;
 var G3WObject = require('g3w/core/g3wobject');
 var GUI = require('g3w/gui/gui');
 var ApiService = require('g3w/core/apiservice');
 var ProjectService = require('g3w/core/projectservice').ProjectService;
 var MapService = require('g3w/core/mapservice');
 var RouterService = require('g3w/core/router');

 var TplService = require('./tplservice');

 var Fields = {};
 Fields.STRING = 'string';
 Fields.INTEGER = 'integer';
 Fields.FLOAT = 'float';


 Fields.simpleFieldTypes = [Fields.STRING,Fields.INTEGER,Fields.FLOAT];
 Fields.LINK = 'link';
 Fields.PHOTO = 'photo';
 Fields.POINTLINK = 'pointlink';
 Fields.ROUTE = 'route';

 var FieldsRules = {
 varianti: {
 id: Fields.ROUTE
 },
 paline: {
 id: Fields.ROUTE
 }
 };

 function getFieldType(layer,feature,attribute) {
 var fieldTypeFromRules = _.get(FieldsRules,layer.id+'.'+attribute.name);
 if (fieldTypeFromRules) {
 return fieldTypeFromRules;
 }

 var URLPattern = /^(https?:\/\/[^\s]+)/g;
 var PhotoPattern = /[^\s]+.(png|jpg|jpeg)$/g;
 var value = feature.attributes[attribute.name].toString();

 var extension = value.split('.').pop();
 if (value.match(URLPattern)) {
 return Fields.LINK;
 }

 if (value.match(PhotoPattern)) {
 return Fields.PHOTO;
 }

 if (Fields.simpleFieldTypes.indexOf(attribute.type) > -1) {
 return attribute.type;
 }
 };

 function isSimple(layer,feature,attribute) {
 var fieldType = getFieldType(layer,feature,attribute);
 return Fields.simpleFieldTypes.indexOf(fieldType) > -1;
 };

 function isLink(layer,feature,attribute) {
 var fieldType = getFieldType(layer,feature,attribute);
 return Fields.LINK == fieldType;
 };

 function isPhoto(layer,feature,attribute) {
 var fieldType = getFieldType(layer,feature,attribute);
 return Fields.PHOTO == fieldType;
 };

 function isRoute(layer,feature,attribute) {
 var fieldType = getFieldType(layer,feature,attribute);
 return Fields.ROUTE == fieldType;
 };

 var TplQueryResultsComponent = Vue.extend({
 template: require('./tplqueryresults.html'),
 data: function(){
 return {
 lotto: null,
 day: null,
 territorial_details: {},
 layers: [],
 basePhotoUrl: ''
 }
 },
 ready: function(){
 try {
 var viewer = new Viewer(document.getElementById('tpl-mapqueryresults'), {
 url: 'data-url',
 zIndex: 10000
 });
 }
 catch(err){
 }
 },
 methods: {
 layerHasFeatures: function(layer) {
 if (layer.features) {
 return layer.features.length > 0;
 }
 return false;
 },
 calcKm: function(meters) {
 return Math.round10((meters/1000),-2);
 },
 showFeature: function(feature) {
 GUI.hideListing();
 MapService.highlightGeometry(feature.geometry,{zoom: true});
 },
 hasGeometry: function(feature) {
 return _.isNil(feature.getGeometry);
 },
 isSimple: function(layer,feature,attribute) {
 return isSimple(layer,feature,attribute);
 },
 isPhoto: function(layer,feature,attribute) {
 return isPhoto(layer,feature,attribute);
 },
 isLink: function(layer,feature,attribute) {
 return isLink(layer,feature,attribute);
 },
 isRoute: function(layer,feature,attribute) {
 return isRoute(layer,feature,attribute);
 },
 getPhotoUrl: function(path,thumb) {
 var pathsplit = path.split('/');
 var photoName = pathsplit[pathsplit.length - 1];
 var photoSplit = photoName.split('_').slice(1);
 var prefix = 'foto';
 if (thumb) {
 prefix = 'thumb';
 }
 var thumbName = prefix+"_"+photoSplit.join('_');
 return this.basePhotoUrl + '/' + thumbName;
 },
 getLabel: function(layerName){
 return this.labels_territorio[layerName].denominazione;
 },
 getOrBlank: function(path) {
 var value = _.get(this,path);
 return (value && value != '') ? value : '-';
 },
 goto: function(layer,value) {
 switch (layer.id) {
 case 'varianti':
 GUI.hideListing();
 var lotto = this.lotto;
 var day = this.day;
 RouterService.goto('dashboard/corsevariante/'+value+'?day='+this.day);
 break;
 case 'paline':
 GUI.hideListing();
 var day = this.day;
 RouterService.goto('dashboard/fermata/'+value+'?day='+day);
 break;
 }
 },
 showVariante: function(id_variante) {
 GUI.hideListing();
 var lotto = this.lotto;
 var day = this.day;
 RouterService.goto('dashboard/varianti/'+this.lotto+'/###/'+id_variante+'?day='+this.day);
 },
 showFermata: function(id_fermata) {
 GUI.hideListing();
 var day = this.day;
 RouterService.goto('dashboard/fermata/'+id_fermata+'?day='+day);
 }
 }
 })

 var TplQueryResultsPanel = function(context){
 this.panelComponent = null;
 this.context = context;

 this.onShow = function(container){
 var self = this;
 var panel = this.panelComponent = new TplQueryResultsComponent();
 panel.layers = [];
 panel.labels_territorio = null;

 var layerData = _.keyBy(context.layersResults,'id');

 var territorial_details = {};
 var layers_labels_territorio = ['province','comuni','bacini','localita'];

 _.forEach(layers_labels_territorio,function(layerName){
 if (layerData[layerName].features && layerData[layerName].features.length) {
 territorial_details[layerName] =  layerData[layerName].features[0].attributes
 }
 });

 panel.lotto = context.lottoId;
 panel.day = context.day;
 panel.territorial_details = territorial_details;

 var layersFromApi = ['varianti'];

 this.queryVarianti(this.context)
 .then(function(features){
 panel.layers.push({
 title: 'Varianti',
 id: 'varianti',
 attributes: ProjectService.getLayerByName('varianti').attributes,
 features: features
 })
 });

 var excludedLayers = _.concat(layers_labels_territorio,layersFromApi);
 var queryableLayers = _.filter(this.context.queryableLayers,function(layer){
 return excludedLayers.indexOf(layer.name) == -1;
 });

 _.forEach(queryableLayers,function(queryableLayer){
 var features = self.processResults(queryableLayer.name,self.context)
 panel.layers.push({
 title: queryableLayer.title,
 id: queryableLayer.name,
 attributes: queryableLayer.attributes,
 features: features
 });
 })

 panel.basePhotoUrl = context.urls.basePhotoUrl;

 panel.$mount().$appendTo(container);

 return resolvedValue(true);
 };

 this.onClose = function(){
 this.panelComponent.$destroy(true);
 this.panelComponent = null;
 return resolvedValue(true);
 };

 this.processResults = function(layerName,context) {
 var layerData = _.keyBy(context.layersResults,'id');
 var features = [];
 if (layerData[layerName]) {
 features = layerData[layerName].features;
 }
 return features;
 };

 this.queryVarianti = function(context){
 return ApiService.get('VARIANTIQUERYMAP',{
 params: {
 day: context.day,
 lotto: context.lottoId,
 coords: context.coordinates.join(','),
 res: context.resolution
 }
 })
 .then(function(response){
 return _.map(response,function(rowData){
 return {
 attributes: rowData
 }
 })
 });
 }
 }
 inherit(TplQueryResultsPanel,G3WObject);

 module.exports = TplQueryResultsPanel;

 */
