var inherit = require('core/utils/utils').inherit;
var base = require('core/utils/utils').base;
var merge = require('core/utils/utils').merge;
var t = require('core/i18n/i18n.service').t;
var resolve = require('core/utils/utils').resolve;
var Component = require('gui/vue/component');
var GUI = require('gui/gui');
var ProjectsRegistry = require('core/project/projectsregistry');
var G3WObject = require('core/g3wobject');
var SearchPanel = require('gui/search/vue/panel/searchpanel');
var ProjectsRegistry = require('core/project/projectsregistry');
var SearchesService = require('gui/search/searchesservice');

var vueComponentOptions = {
   template: require('./search.html'),
   data: function() {
    	return {
    	  project: ProjectsRegistry.getCurrentProject().state
    	};
   },
   methods: {
    showSearchPanel: function(search) {
        var panel = this.$options.searchesService.showSearchPanel(search);
    }
  }
};

// se lo voglio istanziare manualmente
var InternalComponent = Vue.extend(vueComponentOptions);
// se lo voglio usare come componente come elemento html
//Vue.component('g3w-search',vueComponentOptions);

/* COMPONENTI FIGLI */
/* FINE COMPONENTI FIGLI */

/* INTERFACCIA PUBBLICA */
function SearchComponent(options){
  base(this,options);
  this.id = "search-component";
  this.title = "search";
  this._service = new SearchesService();
  this.internalComponent = new InternalComponent({
    searchesService: this._service
  });
  this.state.visible = ProjectsRegistry.getCurrentProject().state.search.length > 0;
  merge(this, options);
  this.initService = function() {
    //inizializzo il servizio
    this._service.init();
  };
};

inherit(SearchComponent, Component);
module.exports = SearchComponent;
