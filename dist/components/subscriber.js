'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Configurable = require('./configurable');
var Monitorable = require('./monitorable');
var Component = require('./component');
var axon = require('@dashersw/axon');

module.exports = function (_Monitorable) {
    _inherits(Subscriber, _Monitorable);

    function Subscriber(advertisement, discoveryOptions) {
        _classCallCheck(this, Subscriber);

        var _this = _possibleConstructorReturn(this, (Subscriber.__proto__ || Object.getPrototypeOf(Subscriber)).call(this, advertisement, discoveryOptions));

        _this.startDiscovery();

        _this.sock = new axon.types[_this.type]();
        _this.sock.sock.set('retry timeout', 0);

        _this.advertisement.subscribesTo = _this.advertisement.subscribesTo || ['*'];

        _this.advertisement.subscribesTo.forEach(function (topic) {
            var namespace = '';
            if (_this.advertisement.namespace) namespace = _this.advertisement.namespace + '::';

            topic = 'message::' + namespace + topic;

            (function (topic) {
                _this.sock.on(topic, function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    if (args.length == 1) args.unshift(topic.substr(9));else args[0] = namespace + args[0];

                    _this.emit.apply(_this, args);
                });
            })(topic);
        });
        return _this;
    }

    _createClass(Subscriber, [{
        key: 'onAdded',
        value: function onAdded(obj) {
            var _this2 = this;

            _get(Subscriber.prototype.__proto__ || Object.getPrototypeOf(Subscriber.prototype), 'onAdded', this).call(this, obj);

            var address = this.constructor.useHostNames ? obj.hostName : obj.address;

            var alreadyConnected = this.sock.sock.socks.some(function (s) {
                return (_this2.constructor.useHostNames ? s._host == obj.hostName : s.remoteAddress == address) && s.remotePort == obj.advertisement.port;
            });

            if (alreadyConnected) return;

            this.sock.connect(obj.advertisement.port, address);
        }
    }, {
        key: 'on',
        value: function on(type, listener) {
            return _get(Subscriber.prototype.__proto__ || Object.getPrototypeOf(Subscriber.prototype), 'on', this).call(this, this.formatTypeWithNamespace(type), listener);
        }
    }, {
        key: 'formatTypeWithNamespace',
        value: function formatTypeWithNamespace(type) {
            var namespace = '';
            if (this.advertisement.namespace) namespace = this.advertisement.namespace + '::';

            return namespace + type;
        }
    }, {
        key: 'type',
        get: function get() {
            return 'sub-emitter';
        }
    }, {
        key: 'oppo',
        get: function get() {
            return 'pub-emitter';
        }
    }]);

    return Subscriber;
}(Monitorable(Configurable(Component)));
//# sourceMappingURL=subscriber.js.map