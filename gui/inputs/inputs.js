const InputsComponents = {
  'text_input': require('./text/vue/text'),
  'textarea_input': require('./textarea/vue/textarea'),
  'integer_input': require('./integer/vue/integer'),
  'string_input':require('./text/vue/text'), //temporary
  'float_input': require('./integer/vue/integer'), // temporary,
  'radio_input': require('./radio/vue/radio'),
  'check_input': require('./checkbox/vue/checkbox'),
  'range_input': require('./range/vue/range'),
  'datetimepicker_input': require('./datetimepicker/vue/datetimepicker'),
  'unique_input': require('./unique/vue/unique'),
  'select_input': require('./select/vue/select'),
  'media_input': require('./media/vue/media'),
  'value_relations_input': require('./value_relations/vue/value_relations')
};

module.exports = InputsComponents;
