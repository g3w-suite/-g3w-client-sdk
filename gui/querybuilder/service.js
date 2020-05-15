const Expression = require('core/layers/filter/expression');
const Filter = require('core/layers/filter/filter');
const CatalogLayersStorRegistry = require('core/catalog/cataloglayersstoresregistry');
const ApplicationService = require('core/applicationservice');
const ProjectsRegistry = require('core/project/projectsregistry');
const GUI = require('gui/gui');
const uniqueId = require('core/utils/utils').uniqueId;
const t = require('core/i18n/i18n.service').t;
const XHR = require('core/utils/utils').XHR;
const getFeaturesFromResponseVectorApi = require('core/utils/geo').getFeaturesFromResponseVectorApi;
const getAlphanumericPropertiesFromFeature = require('core/utils/geo').getAlphanumericPropertiesFromFeature;
const QUERYBUILDERSEARCHES = 'QUERYBUILDERSEARCHES';

function QueryBuilderService(options={}){
  this._cacheValues = {};
  this._items = {};
}

const proto = QueryBuilderService.prototype;

proto.getCurrentProjectItems = function() {
  const projectId = ProjectsRegistry.getCurrentProject().getId();
  const items = this.getItems(projectId);
  this._items[projectId] = items;
  return this._items[projectId];
};

proto.getItems = function(projectId) {
  const items = ApplicationService.getLocalItem(QUERYBUILDERSEARCHES);
  projectId = projectId || ProjectsRegistry.getCurrentProject().getId();
  return items ? items[projectId] || [] : [];
};

proto._getLayerById = function(layerId){
  return CatalogLayersStorRegistry.getLayerById(layerId);
};

proto.getValues = async function({layerId, field}={}){
  this._cacheValues[layerId] = this._cacheValues[layerId] || {};
  let valuesField = this._cacheValues[layerId][field];
  if (valuesField  === undefined) {
    try {
      const layer = this._getLayerById(layerId);
      const dataUrl = layer.getUrl('data');
      const response = await XHR.get({
        url: dataUrl
      });
      const features = getFeaturesFromResponseVectorApi(response);
      if (features && features.length) {
        const feature  = features[0];
        const fields = getAlphanumericPropertiesFromFeature(feature.properties);
        fields.forEach(field => {
          this._cacheValues[layerId][field] = new Set();
        });
        features.forEach(feature => {
          fields.forEach(field => {
            this._cacheValues[layerId][field].add(feature.properties[field]);
          })
        });
      }
      return this._cacheValues[layerId][field] || [];
    } catch(err) {
      reject();
    }
  } else return valuesField;
};

proto.run = function({layerId, filter, showResult=true}={}){
  const layer = this._getLayerById(layerId);
  const layerName = layer.getWMSLayerName();
  const expression = new Expression({
    layerName,
    filter
  });
  const _filter = new Filter();
  _filter.setExpression(expression.get());
  return new Promise((resolve, reject) => {
    layer.search({
      filter: _filter,
      feature_count: 100
    }).then((data) =>{
      if (showResult){
        const showQueryResults = GUI.showContentFactory('query');
        const queryResultsPanel = showQueryResults();
        queryResultsPanel.setQueryResponse({
          data
        });
      }
      resolve(data)
    }).fail((err)=>{
      reject(err)
    })
  });
};

proto.test = async function({layerId, filter}={}){
  try {
    const data = await this.run({
      layerId,
      filter,
      showResult: false
    });
    return data.length && data[0].features.length;
  } catch(err){
    err = t('sdk.querybuilder.error_test');
    return Promise.reject(err);
  }
};

proto.delete = function({id}={}){
  return new Promise((resolve, reject) => {
    GUI.dialog.confirm(t('sdk.querybuilder.delete'), (result)=>{
      if (result) {
        const querybuildersearches = this.getItems().filter(item => item.id !== id);
        const projectId = ProjectsRegistry.getCurrentProject().getId();
        if (querybuildersearches.length === 0) {
          const saveitems = ApplicationService.getLocalItem(QUERYBUILDERSEARCHES);
          delete saveitems[projectId];
          if (Object.keys(saveitems).length)
            ApplicationService.setLocalItem({
              id: QUERYBUILDERSEARCHES,
              data: saveitems
            });
          else ApplicationService.removeLocalItem(QUERYBUILDERSEARCHES);
        }
        resolve();
      } else reject();
    })
  })
};

proto.editLocalItem = function(projectId, querybuildersearch) {
  projectId = projectId || ProjectsRegistry.getCurrentProject().getId();
  const querybuildersearches = ApplicationService.getLocalItem(QUERYBUILDERSEARCHES);
  querybuildersearches[projectId].find((_querybuildersearch, index) => {
    if (_querybuildersearch.id === querybuildersearch.id) {
      querybuildersearches[projectId][index] = querybuildersearch;
      return true;
    }
  });
  ApplicationService.setLocalItem({
    id: QUERYBUILDERSEARCHES,
    data: querybuildersearches
  });
  setTimeout(()=> {
    querybuildersearches[projectId].forEach(querybuildersearch => this._items[projectId].push(querybuildersearch))
  },0);
  this._items[projectId].splice(0);
};

proto.addLocalItem = function(projectId, querybuildersearch) {
  querybuildersearch.id = uniqueId();
  projectId = projectId || ProjectsRegistry.getCurrentProject().getId();
  const querybuildersearches = ApplicationService.getLocalItem(QUERYBUILDERSEARCHES);
  if (querybuildersearches === undefined) {
    ApplicationService.setLocalItem({
      id: QUERYBUILDERSEARCHES,
      data: {
        [projectId]: [querybuildersearch]
      }
    });
    this._items[projectId] = [querybuildersearch]
  } else {
    querybuildersearches[projectId] =  querybuildersearches[projectId] ? [...querybuildersearches[projectId], querybuildersearch] : [querybuildersearch];
    ApplicationService.setLocalItem({
      id: QUERYBUILDERSEARCHES,
      data: querybuildersearches
    });
    this._items[projectId] = querybuildersearches[projectId];
  }
};

proto.save = function({id, name, layerId, filter, projectId} = {}){
  const layerName = this._getLayerById(layerId).getName();
  const querybuildersearch = {
    layerId,
    filter,
    layerName
  };
  if (id) {
    querybuildersearch.name = name;
    querybuildersearch.id = id;
    this.editLocalItem(projectId, querybuildersearch);
    GUI.showUserMessage({
      type: 'success',
      message: t("sdk.querybuilder.messages.changed"),
      autoclose: true
    });
    return;
  }
  GUI.dialog.prompt(t('sdk.querybuilder.additem'), (result)=>{
    if (result) {
      const searchService = GUI.getComponent('search').getService();
      querybuildersearch.name =result;
      searchService.addQueryBuilderSearch(querybuildersearch);
      this.addLocalItem(projectId, querybuildersearch);
    }
  })
};

proto.all = function() {};

proto.sample = function(){};

proto.clear = function(){
  this._cacheValues = {};
};

proto.add = function() {};


export default new QueryBuilderService;
