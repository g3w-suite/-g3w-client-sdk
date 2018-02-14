const inherit = require('core/utils/utils').inherit;
const base = require('core/utils/utils').base;
const Component = require('gui/vue/component');

const InternalComponent = Vue.extend({
  template: require('./streetview.html'),
  data: function() {
    return {
      state: null
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      const position = this.$options.service.getPosition();
      this.$options.service.postRender(position);
    });
  }
});

const StreetViewComponent = function(options) {
  base(this);
  options = options || {};
  const service = options.service;
  this.setService(service);
  const internalComponent = new InternalComponent({
    service: service
  });
  this.setInternalComponent(internalComponent);
  this.unmount = function() {
    return base(this, 'unmount');
  }
};

inherit(StreetViewComponent, Component);


module.exports = StreetViewComponent;


