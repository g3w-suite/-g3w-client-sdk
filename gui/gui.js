var noop = require('core/utils/utils').noop;
var inherit = require('core/utils/utils').inherit;
var G3WObject = require('core/g3wobject');
var RouterService = require('core/router');
var ComponentsRegistry = require('gui/componentsregistry');

// rappresenta l'interfaccia globale dell'API della GUI.
// metodi devono essere implementati (definiti) dall'applicazione ospite
// l'app ospite dovrebbe chiamare anche la funzione GUI.ready() quando la UI è pronta
function GUI() {
  this.isready = false;
  // url delle risorse (immagini, ecc.)
  this.getResourcesUrl = noop;
  // show a Vue form
  this.showForm = noop;
  this.closeForm = noop;
  // mostra una lista di oggetti (es. lista di risultati)
  this.showListing = noop;
  this.closeListing = noop;
  this.hideListing = noop;
  // options conterrà i vari dati sui risultati. Sicuramente avrà la prprietà options.features
  // nel caso di queryByLocation avrà anche options.coordinate
  this.showQueryResults = function(options) {};
  this.hideQueryResults = noop;
  /* editing */
  this.showPanel = noop;
  this.hidePanel = noop;
  //metodi componente
  // aggiunge (e registra) un componente in un placeholder del template - Metodo implementato dal template
  this.addComponent = function(component, placeholder) {};
  this.removeComponent = function(id) {};
  // registra globalmente un componente (non legato ad uno specifico placeholder. Es. componente per mostrare risultati interrogazion)
  this.setComponent = function(component) {
    ComponentsRegistry.registerComponent(component);
  };
  // funzione che mi permette di prendere il componente
  // registrato in base al suo id
  this.getComponent = function(id) {
    return ComponentsRegistry.getComponent(id);
  };
  // funzione che prende tutti i componenti registrati
  this.getComponents = function() {
    return ComponentsRegistry.getComponents();
  };
  //fine metodi componente

  this.goto = function(url) {
    RouterService.goto(url);
  };

  this.ready = function(){
    this.emit('ready');
    this.isready = true;
  };

  this.guiResized = function() {
    this.emit('guiresized');
  };

  /* spinner */
  this.showSpinner = function(options){};

  this.hideSpinner = function(id){};


  this.notify = noop;
  this.dialog = noop;
}

inherit(GUI,G3WObject);

module.exports = new GUI;
