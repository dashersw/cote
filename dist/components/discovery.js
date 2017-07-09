'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Discover = require('@dashersw/node-discover');
var colors = require('colors');
var _ = require('lodash');

var Discovery = function (_Discover) {
    _inherits(Discovery, _Discover);

    function Discovery(advertisement) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Discovery);

        _.defaults(options, Discovery.defaults, {
            helloInterval: 2000,
            checkInterval: 4000,
            nodeTimeout: 5000,
            masterTimeout: 6000,
            monitor: false,
            log: true,
            helloLogsEnabled: true,
            statusLogsEnabled: true,
            ignoreProcess: false
        });

        var _this = _possibleConstructorReturn(this, (Discovery.__proto__ || Object.getPrototypeOf(Discovery)).call(this, options));

        _this.advertisement = _.defaults(advertisement, {
            type: 'service'
        });

        _this.advertise(advertisement);

        _this.me.id = _this.broadcast.instanceUuid;
        _this.me.processId = _this.broadcast.processUuid;
        _this.me.processCommand = process.argv.slice(1).map(function (n) {
            return n.split('/').slice(-2).join('/');
        }).join(' ');

        options.log && _this.log(_this.helloLogger());

        _this.on('added', function (obj) {
            if (!options.monitor && obj.advertisement.key != _this.advertisement.key) return;

            options.log && options.statusLogsEnabled && options.helloLogsEnabled && _this.log(_this.statusLogger(obj, 'online'));
        });

        _this.on('removed', function (obj) {
            if (!options.monitor && obj.advertisement.key != _this.advertisement.key) return;

            options.log && options.statusLogsEnabled && _this.log(_this.statusLogger(obj, 'offline'));
        });
        return _this;
    }

    _createClass(Discovery, [{
        key: 'log',
        value: function log(logs) {
            console.log.apply(console.log, logs);
        }
    }, {
        key: 'helloLogger',
        value: function helloLogger() {
            return _.concat('\nHello! I\'m'.white, this.statusLogger(this.me), '\n========================\n'.white);
        }
    }, {
        key: 'statusLogger',
        value: function statusLogger(obj, status) {
            var logs = [];

            if (status) {
                var statusLog = status == 'online' ? '.online'.green : '.offline'.red;
                logs.push(this.advertisement.name, '>', obj.advertisement.type.magenta + statusLog);
            } else {
                logs.push();
            }

            logs.push('' + obj.advertisement.name.white + '#'.grey + obj.id.grey);

            if (obj.advertisement.port) {
                logs.push('on', obj.advertisement.port.toString().blue);
            }

            return logs;
        }
    }], [{
        key: 'setDefaults',
        value: function setDefaults(options) {
            this.defaults = options;
        }
    }]);

    return Discovery;
}(Discover);

module.exports = Discovery;
//# sourceMappingURL=discovery.js.map