const Input = require('gui/inputs/input');
const getUniqueDomId = require('core/utils/utils').getUniqueDomId;
const Service = require('../service');

var RadioInput = Vue.extend({
  mixins: [Input],
  data: function() {
    return {
      service: new Service({
        state: this.state
      }),
      ids: [getUniqueDomId(),getUniqueDomId()],
      name: `name_${getUniqueDomId()}`,
      radio_value: this.state.value
    }
  },
  watch: {
    'radio_value'() {
      this.state.value = this.radio_value;
      this.change()
    }
  },
  template: require('./radio.html')
});

module.exports = RadioInput;
