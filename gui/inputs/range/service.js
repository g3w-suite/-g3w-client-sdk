const inherit = require('core/utils/utils').inherit;
const base = require('core/utils/utils').base;
const Service = require('gui/inputs/service');
const ValidatorClass = require('core/validators/inputs/range');

function RangeService(options={}) {
  base(this, options);
  const {min, max} = options.state.input.options.values[0];
  const validator = new ValidatorClass({
    min: 1*min,
    max: 1*max
  });
  this.setValidator(validator);
}

inherit(RangeService, Service);

const proto = Service.prototype;

proto.isValueInRange = function(value, min, max) {
  return value <= max && value >= min;
};

module.exports = RangeService;
