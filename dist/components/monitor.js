'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var portfinder = require('portfinder');
var _ = require('lodash');
var charm = require('charm')();
var Configurable = require('./configurable');
var Component = require('./component');
var axon = require('@dashersw/axon');

module.exports = function (_Configurable) {
    _inherits(Monitor, _Configurable);

    function Monitor(advertisement, discoveryOptions, stream) {
        _classCallCheck(this, Monitor);

        advertisement.type = 'monitor';

        _.defaults(discoveryOptions, {
            monitor: true,
            log: false
        });

        var _this = _possibleConstructorReturn(this, (Monitor.__proto__ || Object.getPrototypeOf(Monitor)).call(this, advertisement, discoveryOptions));

        _this.stream = stream;

        _this.sock = new axon.SubEmitterSocket();
        _this.sock.sock.on('bind', function () {
            return _this.startDiscovery();
        });

        _this.sock.on('status', function (status) {
            return _this.emit('status', status);
        });

        var onPort = function onPort(err, port) {
            advertisement.port = +port;

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
            port: _this.advertisement.port
        }, onPort);
        return _this;
    }

    _createClass(Monitor, [{
        key: 'startDiscovery',
        value: function startDiscovery() {
            var _this2 = this;

            _get(Monitor.prototype.__proto__ || Object.getPrototypeOf(Monitor.prototype), 'startDiscovery', this).call(this);

            if (this.discoveryOptions.disableScreen) return;

            var interval = this.discoveryOptions.interval || 5000;

            charm.pipe(this.stream || process.stdout);
            charm.reset().erase('screen').position(0, 0).write('                                                                                    ');

            var draw = function draw() {
                charm.erase('screen');
                var index = 3;
                charm.position(0, 2);
                charm.foreground('green').write('Name').move(16).write('id').move(37).write('Address').move(11).write('Port');

                charm.erase('down');

                _this2.discovery.eachNode(function (node) {
                    var port = node.advertisement.port || '----';
                    port += '';
                    charm.position(0, index).foreground('cyan').write(node.advertisement.name.slice(0, 20)).move(20 - node.advertisement.name.length, 0).foreground('magenta').write(node.id).move(3, 0).foreground('yellow').write(node.address).move(3, 0).foreground('red').write(port);
                    index++;
                });

                charm.position(0, 1);

                setTimeout(draw, interval);
            };

            draw();
        }
    }]);

    return Monitor;
}(Configurable(Component));
//# sourceMappingURL=monitor.js.map