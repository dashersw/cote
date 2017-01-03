'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var axon = require('@dashersw/axon');
var portfinder = require('portfinder');
var Configurable = require('./configurable');
var Component = require('./component');

module.exports = function (_Configurable) {
    _inherits(Responder, _Configurable);

    function Responder(advertisement, discoveryOptions) {
        _classCallCheck(this, Responder);

        var _this = _possibleConstructorReturn(this, (Responder.__proto__ || Object.getPrototypeOf(Responder)).call(this, advertisement, discoveryOptions));

        _this.sock = new axon.types[_this.type]();
        _this.sock.on('bind', function () {
            return _this.startDiscovery();
        });

        _this.sock.on('message', function (req, cb) {
            if (!req.type) return;

            _this.emit(req.type, req, cb);
        });

        var onPort = function onPort(err, port) {
            _this.advertisement.port = +port;

            _this.sock.bind(port);
            _this.sock.server.on('error', function (err) {
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

    _createClass(Responder, [{
        key: 'on',
        value: function on(type, listener) {
            _get(Responder.prototype.__proto__ || Object.getPrototypeOf(Responder.prototype), 'on', this).call(this, type, function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                var rv = listener.apply(undefined, args);

                if (rv && typeof rv.then == 'function') {
                    var cb = args.pop();
                    rv.then(function (val) {
                        return cb(null, val);
                    }).catch(cb);
                }
            });
        }
    }, {
        key: 'type',
        get: function get() {
            return 'rep';
        }
    }, {
        key: 'oppo',
        get: function get() {
            return 'req';
        }
    }]);

    return Responder;
}(Configurable(Component));
//# sourceMappingURL=responder.js.map