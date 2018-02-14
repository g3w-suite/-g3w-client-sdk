const Control = require('./control');

const InteractionControl = function(options) {
  this._toggled = this._toggled || false;
  this._interactionClass = options.interactionClass || null;
  this._interaction = null;
  this._autountoggle = options.autountoggle || false;
  this._geometryTypes = options.geometryTypes || []; // array of types gemetries
  this._onSelectLayer = options.onselectlayer || false;
  this._enabled = (options.enabled === false) ? false : true;
  this._onhover = options.onhover || false;
  this._help = options.help  || null;
  this._modalHelp = this._help ? (options.modalHelp || toastr) : null;
  options.buttonClickHandler = InteractionControl.prototype._handleClick.bind(this);
  Control.call(this, options);
  // create an hel message
  if (this._help) {
    this._createModalHelp();
  }
};

ol.inherits(InteractionControl, Control);

const proto = InteractionControl.prototype;

proto._clearModalHelp = function(id) {
  $('body').delegate('#'+id,'change', () => {
    this._modalHelp = null;
  });
};

//shwo help message
proto._showModalHelp = function() {
  const previousToastPositionClass = toastr.options.positionClass;
  const contentDiv = $('#g3w-view-content');
  if (this._modalHelp) {
    toastr.options.positionClass = 'toast-top-right';
    //if already present delete it
    this._modalHelp.clear();
    const helpElement = this._modalHelp.info(this._help);
    if (contentDiv) {
      const right = contentDiv.css('width');
      $(helpElement).css('right', right);
    }
    toastr.options.positionClass = previousToastPositionClass;
  }
};

// create modal help
proto._createModalHelp = function() {
  const id = "close_button"+Math.floor(Math.random()*1000000)+""+Date.now();
  this._help += '<label for="'+id+'" style="float:right">Non mostrare più</label><input type="checkbox" id="'+id+'" class="pull-right"/>';
  if (this._onhover) {
    $(this.element).on('mouseenter', () => {
      if (!this._enabled) {
        this._showModalHelp();
      }
    });
  }
  this._clearModalHelp(id);
};

proto.getGeometryTypes = function() {
  return this._geometryTypes;
};

proto.getInteraction = function() {
  return this._interaction;
};

proto.isToggled = function() {
  return this._toggled;
};

// press or not press
proto.toggle = function(toggle) {
  toggle = toggle !== undefined ? toggle : !this._toggled;
  this._toggled = toggle;
  const controlButton = $(this.element).find('button').first();
  if (toggle) {
    this._showModalHelp();
    if (this._interaction) {
      this._interaction.setActive(true);
    }
    controlButton.addClass('g3w-ol-toggled');
  }
  else {
    if (this._interaction) {
      this._interaction.setActive(false);
    }
    controlButton.removeClass('g3w-ol-toggled');
  }
};

// funzione che abilita e disabilita il controllo
proto.setEnable = function(bool) {
  const controlButton = $(this.element).find('button').first();
  if (bool)  {
    controlButton.removeClass('g3w-ol-disabled');
  } else {
    controlButton.addClass('g3w-ol-disabled');
    controlButton.removeClass('g3w-ol-toggled');
    if (this._interaction) {
      this._interaction.setActive(false);
    }
  }
  this._enabled = bool;
};

proto.getEnable = function() {
  return this._enabled;
};

proto.getGeometryTypes = function() {
  return this._geometryTypes;
};

proto.setGeometryTypes = function(types) {
  this._geometryTypes = types;
};

proto.onSelectLayer = function() {
  return this._onSelectLayer;
};

proto.setMap = function(map) {
  if (!this._interaction && this._interactionClass) {
    this._interaction = new this._interactionClass;
    map.addInteraction(this._interaction);
    this._interaction.setActive(false);
  }
  Control.prototype.setMap.call(this,map);
};

proto._handleClick = function(e) {
  if (this._enabled) {
    this.toggle();
    Control.prototype._handleClick.call(this,e);
  }
};

proto.getIteraction = function() {
  return this._interaction;
};


module.exports = InteractionControl;
