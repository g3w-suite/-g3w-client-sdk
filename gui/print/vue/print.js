const inherit = require('core/utils/utils').inherit;
const Component = require('gui/vue/component');
const PrintService = require('gui/print/printservice');
const base = require('core/utils/utils').base;
const merge = require('core/utils/utils').merge;

const vueComponentOptions = {
  template: require('./print.html'),
  data: function() {
    var self = this;
    return {
      state: null,
      button: {
        title: "Crea PDF",
        class: "btn-success",
        type:"stampa",
        disabled: false,
        cbk: function() {
          self.print()
        }
      }
    }
  },
  methods: {
    exec: function(cbk) {
      cbk();
    },
    btnEnabled: function(button) {
      return button.disabled;
    },
    isAnnullaButton: function(type) {
      return type == 'annulla'
    },
    onChangeTemplate: function() {
      this.$options.service.changeTemplate();
    },
    onChangeScale: function() {
      this.$options.service.changeScale()
    },
    onChangeDpi: function() {},
    onChangeRotation: function(evt) {
      if (this.state.rotation >= 0 && !_.isNil(this.state.rotation) && this.state.rotation != '') {
        this.state.rotation = (this.state.rotation > 360) ? 360 : this.state.rotation;
        evt.target.value = this.state.rotation;
      } else if (this.state.rotation < 0) {
        this.state.rotation = (this.state.rotation < -360) ? -360 : this.state.rotation;
        evt.target.value = this.state.rotation;
      } else {
        this.state.rotation = 0;
      }

      this.$options.service.changeRotation();
    },
    print: function() {
      this.$options.service.print();
    }
  }
};


function PrintComponent(options) {
  base(this, options);
  this.title = "print";
  this.vueComponent = vueComponentOptions;
  this.internalComponent = null;
  const service = options.service || new PrintService;
  this.setService(service);
  this._service.init();
  this.setInternalComponent = function () {
    const InternalComponent = Vue.extend(this.vueComponent);
    this.internalComponent = new InternalComponent({
      service: service
    });
    this.state.visible = service.state.visible;
    this.internalComponent.state = service.state;
    return this.internalComponent;
  };
  
  this._reload = function() {
    const service = this.getService();
    service.reload();
    this.state.visible = service.state.visible;
  };
  
  this._setOpen = function() {
    this._service.showPrintArea(this.state.open);
  };
  merge(this, options);

}

inherit(PrintComponent, Component);

module.exports = PrintComponent;


