// oggetto base per che definisce i metodi comuni per tutti gli inputs
var Service = require('./service');
var InputsEventsBus = require('./inputseventbus');
//Definisco un baseInput object per permetterere all'input di ereditare
// metododi etc .. da questo
var BaseInput = {
  props: ['state'],
  data: function() {
    return {
      // definisco il service per chi non lo sovrascrive
      service: new Service({
        state: this.state // passo lo state
      })
    }
  },
  template: require('./baseinput.html'),
  methods: {
    // metodo che viene scaturito quando cambia il valore dell'input
    change: function() {
      //vado a validare il valore
      this.service.validate();
      // emette il segnale che è cambiato un input
      this.$emit('changeinput');
      InputsEventsBus.$emit('changeinput', this.state);
    },
    isEditable: function() {
      return this.service.isEditable();
    },
    isVisible: function() {

    }
  },
  // vado a emettere l'evento addinput
  mounted: function() {
    var self = this;
    // setto la proprietà reattiva valid
    Vue.set(this.state.validate, 'valid', true);
    Vue.set(this.state.validate, 'message', null);
    this.change();
    this.$nextTick(function() {
      // emetto il segnale di aggiunta input e passo l'oggetto validate
      self.$emit('addinput', this.state.validate);
    })
  }
};

//vado a definire un componente BaseInput che sarà parte del componente input
var BaseInputComponent = Vue.extend({
  mixins: [BaseInput]
});


module.exports = {
  BaseInput: BaseInput,
  BaseInputComponent: BaseInputComponent
};