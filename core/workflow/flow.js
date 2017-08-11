var inherit = require('core/utils/utils').inherit;
var base = require('core/utils//utils').base;
var G3WObject = require('core/g3wobject');

//classe che permette di attivare il flusso del workflow
// passando trai i vari steps
function Flow() {
  var self = this;
  var steps = [];
  var inputs;
  var counter = 0;
  var context = null;
  var workflow;
  var d;

  //metodo start del workflow
  this.start = function(workflow) {
    d = $.Deferred();
    if (counter > 0) {
      console.log("reset workflow before restarting");
    }
    workflow = workflow;
    //prendo gli inputs passati al workflow
    inputs = workflow.getInputs();
    // prendo il contex su cui agisce il workflow
    context = workflow.getContext();
    //recupero gli steps che il workflow deve fare
    steps = workflow.getSteps();
    // verifico che ci siano steps
    if (steps && steps.length) {
      // faccio partire il primo step
      //passando gli inputs assegannti al worflow
      this.runStep(steps[0], inputs, context);
    }
    // ritono la promessa che verrà risolta solo
    // se tutti gli steps vanno a buon fine
    return d.promise();
  };

  //funzione che fa il rloun dello step
  this.runStep = function(step, inputs) {
    // faccio partire il run dello step 
    // che non fa altro che far partire il run del task e ritorna una promise
    step.run(inputs, context)
      // se andato tutto a buon fine lo step o meglio il task
      // è stato risolto chiamo la funzione
      // ondone che deciderà se chiamare altro step (se esiste) o risolverà il flusso
      .then(function(outputs) {
        self.onDone(outputs);
      })
      // c'è stato un erore (task rigettato)
      .fail(function(error) {
        self.onError(error);
      });
  };

  //funzione che verifica se siamo arrivati alla fine degli steps
  // se si risolve
  this.onDone = function(outputs) {
    //vado ad aumentare di uno il counter degli steps andati a buon fine e verifico
    // se sono arrivato alla fine degli steps oppure no
    counter++;
    if (counter == steps.length) {
      console.log('sono arrivato in fondo agli steps senza errori');
      // setto di nuovo il counter a 0
      counter = 0;
      // risolvo con il valore degli outputs
      d.resolve(outputs);
      return;
    }
    this.runStep(steps[counter], outputs);
  };

  this.onError = function(err) {
    // nel caso di errore di uno step
    console.log('step error: ', err);
    // risetto il counter a 0
    counter = 0;
    d.reject(err);
  };

  // stop flow
  this.stop = function() {
    var d = $.Deferred();
    console.log('Flow stopping ...');
    console.log('Counter : ', counter);
    //verifico a che punto è il counter se all'inizio
    steps[counter].stop();
    if (counter > 0) {
      counter = 0;
      // faccio un reject dell flow
      d.reject();
    } else {
      // altrimenti faccio un reject che mi porterà
      //a fare un rollback della sessione
      d.resolve();
    }
    return d.promise();
  };

  base(this)
}

inherit(Flow, G3WObject);

module.exports = Flow;

