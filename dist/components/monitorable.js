'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var axon = require('@dashersw/axon');

module.exports = function (Base) {
    return function (_Base) {
        _inherits(Monitorable, _Base);

        function Monitorable() {
            _classCallCheck(this, Monitorable);

            return _possibleConstructorReturn(this, (Monitorable.__proto__ || Object.getPrototypeOf(Monitorable)).apply(this, arguments));
        }

        _createClass(Monitorable, [{
            key: 'startDiscovery',
            value: function startDiscovery() {
                var _this2 = this;

                _get(Monitorable.prototype.__proto__ || Object.getPrototypeOf(Monitorable.prototype), 'startDiscovery', this).call(this);

                this.discovery.on('added', function (obj) {
                    var adv = obj.advertisement;

                    if (adv.type != 'monitor' || !_this2.advertisement.key.startsWith(adv.key)) return;

                    _this2.onMonitorAdded(obj);
                });
            }
        }, {
            key: 'onMonitorAdded',
            value: function onMonitorAdded(obj) {
                var _this3 = this;

                if (!this.monitorStatusPublisher) {
                    this.monitorStatusPublisher = new axon.PubEmitterSocket();
                    this.monitorStatusPublisher.sock.set('retry timeout', 0);
                    var statusInterval = this.discoveryOptions.statusInterval || 5000;

                    this.monitorInterval = setInterval(function () {
                        return _this3.onMonitorInterval();
                    }, statusInterval);
                }

                var address = obj.address;
                if (this.constructor.useHostNames) address = obj.hostName;

                this.monitorStatusPublisher.connect(obj.advertisement.port, address);
            }
        }, {
            key: 'onMonitorInterval',
            value: function onMonitorInterval() {
                var _this4 = this;

                if (!this.monitorStatusPublisher.sock.socks.length) return;

                var nodes = (this.sock.socks || this.sock.sock.socks).map(function (s) {
                    if (s.id) return s.id;

                    for (var id in _this4.discovery.nodes) {
                        var node = _this4.discovery.nodes[id];

                        if ((_this4.constructor.useHostNames ? s._host == node.hostName : s.remoteAddress == node.address) && s.remotePort == node.advertisement.port) {
                            s.id = node.id;

                            return s.id;
                        }
                    }
                });

                this.monitorStatusPublisher.emit('status', {
                    id: this.discovery.me.id,
                    nodes: nodes
                });
            }
        }]);

        return Monitorable;
    }(Base);
};
//# sourceMappingURL=monitorable.js.map