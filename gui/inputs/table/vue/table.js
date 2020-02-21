const Input = require('gui/inputs/input');
import InputTableHeader from './components/input-table-header.vue';
import InputTableBody from './components/input-table-body.vue';

const TableInput = Vue.extend({
  mixins: [Input],
  template: require('./table.html'),
  components: {
    InputTableHeader,
    InputTableBody
  },
  computed: {
    headers() {
      return this.state.input.options.headers.map((header) => {
        return header.name;
      });
    },
    columntypes() {
      return this.state.input.options.headers.map((header) => {
        return header.type;
      })
    }
  },
  methods: {
    addRow() {
      this.state.value.push(new Array(this.headers.length))
    },
    deleteRow(index) {
      console.log('Delete Row ', index)
    }
  }
});

module.exports = TableInput;
