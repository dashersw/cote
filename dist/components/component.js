'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('eventemitter2').EventEmitter2;
var Discovery = require('./discovery');

module.exports = function (_EventEmitter) {
    _inherits(Component, _EventEmitter);

    function Component(advertisement, discoveryOptions) {
        _classCallCheck(this, Component);

        var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, {
            wildcard: true, // should the event emitter use wildcards.
            delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
            newListener: false, // if you want to emit the newListener event set to true.
            maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
        }));

        advertisement.key = _this.constructor.environment + '$$' + (advertisement.key || '');

        _this.advertisement = advertisement;
        _this.advertisement.axon_type = _this.type;

        _this.discoveryOptions = discoveryOptions || {};
        _this.discoveryOptions.address = _this.discoveryOptions.address || '0.0.0.0';
        return _this;
    }

    _createClass(Component, [{
        key: 'startDiscovery',
        value: function startDiscovery() {
            var _this2 = this;

            this.discovery = new Discovery(this.advertisement, this.discoveryOptions);

            this.discovery.on('added', function (obj) {
                if (obj.advertisement.axon_type != _this2.oppo || obj.advertisement.key != _this2.advertisement.key || _this2.advertisement.namespace != obj.advertisement.namespace) return;

                _this2.onAdded(obj);
                _this2.emit('cote:added', obj);
            });
            this.discovery.on('removed', function (obj) {
                if (obj.advertisement.axon_type != _this2.oppo || obj.advertisement.key != _this2.advertisement.key || _this2.advertisement.namespace != obj.advertisement.namespace) return;

                _this2.onRemoved(obj);
                _this2.emit('cote:removed', obj);
            });
        }
    }, {
        key: 'onAdded',
        value: function onAdded() {}
    }, {
        key: 'onRemoved',
        value: function onRemoved() {}
    }, {
        key: 'close',
        value: function close() {
            this.sock && this.sock.close();
            this.discovery && this.discovery.stop();
        }
    }]);

    return Component;
}(EventEmitter);
//# sourceMappingURL=component.js.map