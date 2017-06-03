'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Configurable = require('./configurable');
var Component = require('./component');
var axon = require('@dashersw/axon');
var portfinder = require('portfinder');

module.exports = function (_Configurable) {
    _inherits(Publisher, _Configurable);

    function Publisher(advertisement, discoveryOptions) {
        _classCallCheck(this, Publisher);

        var _this = _possibleConstructorReturn(this, (Publisher.__proto__ || Object.getPrototypeOf(Publisher)).call(this, advertisement, discoveryOptions));

        _this.sock = new axon.types[_this.type]();
        _this.sock.sock.on('bind', function () {
            return _this.startDiscovery();
        });

        var onPort = function onPort(err, port) {
            _this.advertisement.port = +port;

            _this.sock.bind(port);
            _this.sock.sock.server.on('error', function (err) {
                if (err.code != 'EADDRINUSE') throw err;

                portfinder.getPort({
                    host: _this.discoveryOptions.address,
                    port: _this.advertisement.port
                }, onPort);
            });
        };

        portfinder.getPort({
            host: _this.discoveryOptions.address,
            port: advertisement.port
        }, onPort);
        return _this;
    }

    _createClass(Publisher, [{
        key: 'publish',
        value: function publish(topic, data) {
            var namespace = '';

            if (this.advertisement.namespace) namespace = this.advertisement.namespace + '::';

            topic = 'message::' + namespace + topic;

            this.sock.emit(topic, data);
        }
    }, {
        key: 'type',
        get: function get() {
            return 'pub-emitter';
        }
    }, {
        key: 'oppo',
        get: function get() {
            return 'sub-emitter';
        }
    }]);

    return Publisher;
}(Configurable(Component));
//# sourceMappingURL=publisher.js.map