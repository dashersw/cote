'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('eventemitter2').EventEmitter2;
var util = require('util');
var Discovery = require('./discovery');
var axon = require('@dashersw/axon');
var Subscriber = require('./subscriber');
var Requester = require('./requester');
var Configurable = require('./configurable');
var Component = require('./component');

module.exports = function (_Configurable) {
    _inherits(Sockend, _Configurable);

    function Sockend(io, advertisement, discoveryOptions) {
        _classCallCheck(this, Sockend);

        var originalKey = advertisement.key;

        var _this = _possibleConstructorReturn(this, (Sockend.__proto__ || Object.getPrototypeOf(Sockend)).call(this, advertisement, discoveryOptions));

        _this.requesterTransformators = [];

        _this.startDiscovery();

        var namespaces = {};

        _this.discovery.on('added', function (obj) {
            if (obj.advertisement.axon_type != 'rep') return;
            if (obj.advertisement.key != _this.advertisement.key) return;
            if (!Array.isArray(obj.advertisement.respondsTo)) return;

            var namespace = obj.advertisement.namespace;
            var normalizedNamespace = namespace || '';

            if (namespaces['/' + normalizedNamespace]) return;

            namespaces['/' + normalizedNamespace] = true;
            obj.namespace = namespace;

            var requester = new Requester({
                name: 'sockendReq',
                namespace: namespace,
                key: originalKey
            }, discoveryOptions);
            obj.requester = requester;

            var originalRequestOnAdded = requester.onAdded.bind(requester);
            requester.onAdded = function (obj) {
                if (!Array.isArray(obj.advertisement.respondsTo)) return;
                originalRequestOnAdded(obj);
            };

            obj.requesterSocketHandler = function (socket) {
                obj.advertisement.respondsTo.forEach(function (topic) {
                    socket.on(topic, function (data, cb) {
                        if (typeof data == 'function' && typeof cb == 'undefined') {
                            cb = data;
                            data = {};
                        }

                        data.type = topic;

                        _this.requesterTransformators.forEach(function (transFn) {
                            return transFn(data, socket);
                        });

                        requester.send(data, cb);
                    });
                });
            };

            var server = io.of('/');
            if (namespace) server = io.of('/' + namespace);
            server.on('connection', obj.requesterSocketHandler);

            for (var sId in server.sockets) {
                obj.requesterSocketHandler(server.sockets[sId]);
            }
        });

        var publisherNamespaces = {};

        _this.discovery.on('added', function (obj) {
            if (obj.advertisement.axon_type != 'pub-emitter') return;
            if (obj.advertisement.key != _this.advertisement.key) return;

            var namespace = obj.advertisement.namespace;
            var normalizedNamespace = namespace || '';

            if (publisherNamespaces['/' + normalizedNamespace]) return;

            publisherNamespaces['/' + normalizedNamespace] = true;
            obj.namespace = namespace;

            var subscriber = new Subscriber({
                name: 'sockendSub',
                namespace: namespace,
                key: originalKey,
                subscribesTo: obj.advertisement.broadcasts
            }, discoveryOptions);

            subscriber.onMonitorAdded = function () {};

            obj.subscriber = subscriber;

            subscriber.on('**', function (data) {
                if (this.event == 'cote:added' || this.event == 'cote:removed') return;

                var topic = this.event.split('::');
                var namespace = '';

                if (topic.length > 1) {
                    namespace += '/' + topic[0];
                    topic = topic.slice(1);
                }

                topic = topic.join('');

                io.of(namespace).emit(topic, data);
            });
        });
        return _this;
    }

    _createClass(Sockend, [{
        key: 'type',
        get: function get() {
            return 'sockend';
        }
    }]);

    return Sockend;
}(Configurable(Component));
//# sourceMappingURL=sockend.js.map