var inherit = require('core/utils/utils').inherit;
var base = require('core/utils/utils').base;
var G3WObject = require('core/g3wobject');
var resolve = require('core/utils/utils').resolve;
//definisco il filtro ol3
var ol3OGCFilter = ol.format.ogc.filter;

//oggetto che viene passato per effetturare il la search
var ol3GetFeatureRequestObject = {
  srsName: 'EPSG:',
  featureNS: '',
  featurePrefix: '',
  featureTypes: [],
  outputFormat: 'application/json',
  filter: null // esempio filtro composto ol3OGCFilter.and(ol3OGCFilter.bbox('the_geom', [1, 2, 3, 4], 'urn:ogc:def:crs:EPSG::4326'),ol3OGCFilter.like('name', 'New*'))
};

// FILTRI OL3
var ol3Filters = {
  eq: ol3OGCFilter.equalTo,
  gt: ol3OGCFilter.greaterThan,
  gte: ol3OGCFilter.greaterThanOrEqualTo,
  lt: ol3OGCFilter.lessThan,
  lte: ol3OGCFilter.lessThanOrEqualTo,
  like: ol3OGCFilter.like,
  ilike: "",
  bbox: ol3OGCFilter.bbox,
  AND: ol3OGCFilter.and,
  OR: ol3OGCFilter.or,
  NOT: ol3OGCFilter.not
};


// CREATO UN FILTRO DI ESEMPIO PER VERIFICARE LA CORRETTEZZA DELLA FUNZIONE CREAZIONE FILTRO
var testFilter = {
  'AND':
    [
      {
        eq:
          {
            gid : 10
          }
      },
      {
        'OR':
          [
            {
              eq: {
                pippo : 'lallo'
              }
            },
            {
              gt: {
                id : 5
              }
            }

          ]
      }
   ]
}
//////////////

///FILTRI CUSTOM
var standardFilterTemplates = function() {
  var common = {
    propertyName:
          "<PropertyName>" +
            "[PROP]" +
          "</PropertyName>",
    literal:
          "<Literal>" +
            "[VALUE]" +
          "</Literal>"
  };
  return {
    eq: "<PropertyIsEqualTo>" +
            common.propertyName +
            common.literal +
        "</PropertyIsEqualTo>",
    gt: "<PropertyIsGreaterThan>" +
            common.propertyName +
            common.literal +
         "</PropertyIsGreaterThan>",
    gte:"",
    lt: "",
    lte: "",
    like: "",
    ilike: "",
    AND: "<And>[AND]</And>",
    OR: "<Or>[OR]</Or>",
  }
}();

/////
var qgisFilterTemplates = {
  // codice qui
};

var mapserverFilterTemplates = {
  // codice qui
};

var geoserverFilterTemplates = {
  // codice qui
};

function QueryWFSProvider(){
  var self = this;
  var d = $.Deferred();
  var results = {
    headers:[],
    values:[]
  };

  this.doSearch = function(queryFilterObject){
    var querylayer = queryFilterObject.queryLayer;
    var url = querylayer.getQueryUrl();
    var crs = querylayer.getCrs();
    var filterObject = queryFilterObject.filterObject;
    //setto il srs
    ol3GetFeatureRequestObject.srsName+=crs || '4326';
    var response, filter;
    switch (ogcservertype) {
      case 'OGC':
        filter = this.createStandardFilter(filterObject, querylayer);
        response = this.standardSearch(url, filter);
        return resolve(response)
        break;
      case 'qgis':
        filter = this.createQgisFilter(filterObject);
        response = this.qgisSearch(querylayer, url, filter);
        return resolve(response)
        break;
      case 'mapserver':
        filter = this.createMapserverFilter(filterObject);
        response = this.mapserverSearch(querylayer, url, filter);
        return resolve(response)
        break;
      case 'geoserver':
        filter = this.createGeoserverFilter(filterObject);
        response = this.geoserverSearch(querylayer, url, filter);
        return resolve(response)
        break;
      default:
        return false
    }
  };

  this.standardSearch = function(url, filter){
  };
  this.createStandardFilter = function(filterObject, querylayer) {
    /////inserisco il nome del layer (typename) ///
    ol3GetFeatureRequestObject.featureTypes.push(querylayer.getQueryLayerName);
    var filter = [];
    function createSingleFilter(booleanObject) {
      var filterElements = [];
      var filterElement = '';
      var rootFilter;
      _.forEach(booleanObject, function(v, k, obj) {
        //creo il filtro root che sarà AND OR
        rootFilter = ol3Filters[k];
        //qui c'è array degli elementi di un booleano
        _.forEach(v, function(input){
          //scorro su oggetto operatore
          _.forEach(input, function(v, k, obj) {
          //è un array e quindi è altro oggetto padre booleano
            if (_.isArray(v)) {
              filterElement = createSingleFilter(obj);
            } else {
              filterElement = ol3Filters[k];
              _.forEach(input, function(v, k, obj) {
                _.forEach(v, function(v, k, obj) {
                  filterElement = filterElement(k, v);
                });
              });
            };
            filterElements.push(filterElement);
          });
        });
        //verifico che ci siano almeno due condizione nel filtro AND. Nel caso di una sola condizione (esempio : un solo input)
        //estraggo solo l'elemento filtro altrimenti da errore -- DA VERIFICARE SE CAMBIARLO
        if (filterElements.length > 1) {
          rootFilter = rootFilter.apply(this, filterElements);
        } else {
          rootFilter = filterElements[0];
        };
      });
      return rootFilter;
    };
    //assegno il filtro creato
    ol3GetFeatureRequestObject.filter = createSingleFilter(filterObject);
    //creo il filtro utilizzando ol3
    filter = new ol.format.WFS().writeGetFeature(ol3GetFeatureRequestObject);
    return filter;
  };

  this.qgisSearch = function(urls, filter){
    $.get(searchUrl).then(function(result){
      self.emit("searchdone",result);
    });
    return d.promise();
  };
  this.createQGisFilter = function(filterObject) {
    var filter;
    return filter
  };
  this.mapserverSearch = function(querylayer, url, filter){
    return d.promise();
  };
  this.createMapserverFilter = function(filterObject) {
    var filter;
    return filter
  };
  this.geoserverSearch = function(querylayer, url, filter){
    return d.promise();
  };
  this.createGeoserverFilter = function(filterObject) {
    var filter;
    return filter
  };
  base(this);
}
inherit(QueryWFSProvider,G3WObject);

module.exports =  new QueryWFSProvider()

