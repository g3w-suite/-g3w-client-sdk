const inherit = require('core/utils/utils').inherit;
const base = require('core/utils/utils').base;
const Service = require('gui/inputs/service');

function CheckBoxService(options={}) {
  const value = options.state.input.options.values.find(value => {
    return value.checked === false;
  });
  options.validatorOptions =  {
    values: options.state.input.options.values.map(value => value)
  };
  if (options.state.value === null)
    options.state.value = value.value;
  base(this, options);
}

inherit(CheckBoxService, Service);

const proto = CheckBoxService.prototype;

proto.convertCheckedToValue = function(checked) {
  cheched = checked === null ||  checked === undefined ? false : checked;
  const option = this.state.input.options.values.find((value) => {
    return value.checked === checked
  });
  this.state.value = option.value;
  return this.state.value;
};

proto.convertValueToChecked = function() {
  const valueToCheck = this.state.value;
  if (valueToCheck === null || valueToCheck === undefined)
    return false;
  let option = this.state.input.options.values.find((value) => {
    return value.value == valueToCheck
  });
  if (option === undefined) {
    option = this.state.input.options.values.find(value => value.checked === false);
    this.state.value = option.value;
  }
  return option.checked;
};


module.exports = CheckBoxService;
