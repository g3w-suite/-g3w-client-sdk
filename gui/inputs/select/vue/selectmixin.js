var selectMixin = {
  methods: {
    changeSelect: function(value) {
      this.state.value = value === 'null' ? null : value;
      this.change();
    },
    getValue: function(value) {
      return value === null ? 'null' : value;
    },
    resetValues() {
      this.state.input.options.values.splice(0);
    }
  },
  computed: {
    autocomplete() {
      return this.state.input.type === 'select_autocomplete' && this.state.input.options.usecompleter;
    },
    loadingState() {
      return this.state.input.options.loading ? this.state.input.options.loading.state : null;
    }
  },
  beforeDestroy() {
    this.select2 && this.select2.select2('destroy');
    this.select2 = null;
  }
};

module.exports = selectMixin;
