"use strict";

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.to-string");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const EventEmitter = require('eventemitter2').EventEmitter2;

const Discovery = require('./discovery');

module.exports = class Component extends EventEmitter {
  constructor(advertisement, discoveryOptions = {}) {
    super({
      wildcard: true,
      // should the event emitter use wildcards.
      delimiter: '::',
      // the delimiter used to segment namespaces, defaults to `.`.
      newListener: false,
      // if you want to emit the newListener event set to true.
      maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.

    });
    advertisement.key = this.constructor.environment + '$$' + (advertisement.key || '');
    this.advertisement = advertisement;
    this.advertisement.axon_type = this.type;
    this.discoveryOptions = _objectSpread({}, Discovery.defaults, {}, discoveryOptions);
    this.discoveryOptions.address = this.discoveryOptions.address || '0.0.0.0';
  }

  startDiscovery() {
    this.discovery = new Discovery(this.advertisement, this.discoveryOptions);
    this.discovery.on('added', obj => {
      if (obj.advertisement.axon_type != this.oppo || obj.advertisement.key != this.advertisement.key || this.advertisement.namespace != obj.advertisement.namespace) return;
      this.onAdded(obj);
      this.emit('cote:added', obj);
    });
    this.discovery.on('removed', obj => {
      if (obj.advertisement.axon_type != this.oppo || obj.advertisement.key != this.advertisement.key || this.advertisement.namespace != obj.advertisement.namespace) return;
      this.onRemoved(obj);
      this.emit('cote:removed', obj);
    });
  }

  onAdded() {}

  onRemoved() {}

  close() {
    this.sock && this.sock.close();
    this.discovery && this.discovery.stop();
  }

};
//# sourceMappingURL=component.js.map