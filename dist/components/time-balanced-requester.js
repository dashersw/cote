'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Requester = require('./requester');
var _ = require('lodash');
var uuid = require('uuid');

module.exports = function (_Requester) {
    _inherits(TimeBalancedRequester, _Requester);

    function TimeBalancedRequester(advertisement, discoveryOptions) {
        _classCallCheck(this, TimeBalancedRequester);

        var _this = _possibleConstructorReturn(this, (TimeBalancedRequester.__proto__ || Object.getPrototypeOf(TimeBalancedRequester)).call(this, advertisement, discoveryOptions));

        _this.responders = {};
        _this.timers = {};
        _this.requestId = 0;
        _this.callbacks = {};
        _this.MAX_REQUESTS = 10;
        _this.CALCULATION_TIMEOUT = 10000;
        _this.SAMPLE_INTERVAL = 100;

        // neglect requests from calculation this took longer then the given timeout
        setInterval(function () {
            var now = new Date();

            for (var index in _this.responders) {
                for (var id in _this.responders[index]) {
                    if (now - _this.responders[index][id].sent > _this.CALCULATION_TIMEOUT) {
                        if (_this.timers[id]) clearInterval(_this.timers[id]); // if the response is lost, don't leave garbage

                        delete _this.responders[index][id];
                    }
                }
            }
        }, _this.SAMPLE_INTERVAL);

        // clear all gathered data when a socket disconnects
        _this.sock.on('socket close', function (sock) {
            if (sock.uuid) {
                var responder = _this.responders[sock.uuid];

                for (var id in responder) {
                    // clear timers and callbacks for the disconnected socket
                    clearInterval(_this.timers[id]);
                    delete _this.timers[id];

                    if (typeof _this.callbacks[id] == 'function') {
                        _this.callbacks[id](new Error('lost connection'));
                    } else {
                        _this.callbacks[id] && _this.callbacks[id].reject(new Error('lost connection'));
                    }
                    delete _this.callbacks[id];
                }
                delete _this.responders[sock.uuid];
            }
        });
        return _this;
    }

    _createClass(TimeBalancedRequester, [{
        key: 'send',
        value: function send() {
            var _this2 = this,
                _get2;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var id = this.requestId++;

            var hasCallback = 'function' == typeof args[args.length - 1];
            if (hasCallback) this.callbacks[id] = args.pop();else {
                var resolve = void 0;
                var reject = void 0;
                this.callbacks[id] = new Promise(function (_resolve, _reject) {
                    resolve = _resolve;
                    reject = _reject;
                });

                this.callbacks[id].resolve = resolve;
                this.callbacks[id].reject = reject;
            }

            var originalPromise = void 0;

            var index = 0;
            var socks = this.sock.socks;
            var len = socks.length;
            var minAvgResponseTime = Number.MAX_VALUE;
            var minIndex = 0;
            var average = 0;

            if (len > 0 && _.size(this.responders) == len) {
                // have data for all sockets
                for (index in this.responders) {
                    var item = this.responders[index];
                    var totalTime = 0;

                    for (var request in item) {
                        var time = item[request].time || 0;
                        totalTime += time;
                    }
                    average = totalTime / _.size(item) || 0;

                    if (average < minAvgResponseTime) {
                        minAvgResponseTime = average;
                        minIndex = index;
                    }
                    this.responders[index].average = average;
                }

                minIndex = _.findIndex(socks, { uuid: minIndex });

                // explore other servers every once in a while
                if (id % this.MAX_REQUESTS == 0) {
                    minIndex = Math.floor(Math.random() * len);
                }
            } else if (len != 0) {
                // there is a new socket to be explored use it
                minIndex = _.findIndex(socks, function (s) {
                    return !s.uuid;
                });
            }

            var n = this.sock.n = minIndex % len || 0; // select the socket to be used
            if (!this.sock.socks[n]) n = this.sock.n = 0;
            if (socks[n] && typeof socks[n].uuid == 'undefined') socks[n].uuid = uuid.v4(); // assign a unique identifier to this socket

            index = socks[n] && socks[n].uuid || 0; // save the index of selected socket

            var cb = function cb() {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                var lastRequests = _this2.responders[index];
                if (lastRequests && lastRequests[id]) lastRequests[id].time = new Date() - lastRequests[id].sent; // save response time
                clearInterval(_this2.timers[id]); // clear timers for this request
                delete _this2.timers[id];

                var stats = { averageTime: lastRequests && lastRequests.average || 0 };

                if (hasCallback) {
                    var _callbacks;

                    (_callbacks = _this2.callbacks)[id].apply(_callbacks, args.concat([stats]));
                } else {
                    if (originalPromise.state == 'rejected') _this2.callbacks[id].reject(args[0]);else _this2.callbacks[id].resolve(args[0]);
                }
                delete _this2.callbacks[id];
            };

            if (index != 0) {
                if (!this.responders[index]) this.responders[index] = {}; // create if it's the first request for this index
                this.responders[index][id] = { // create a container object
                    time: 0,
                    sent: new Date()
                };

                // increment responseTime of this request every 0.1 seconds
                this.timers[id] = setInterval(function () {
                    var lastRequests = _this2.responders[index];
                    if (!lastRequests) return clearInterval(_this2.timers[id]);

                    if (lastRequests[id]) lastRequests[id].time += _this2.SAMPLE_INTERVAL;
                }, this.SAMPLE_INTERVAL);
            }

            if (hasCallback) return (_get2 = _get(TimeBalancedRequester.prototype.__proto__ || Object.getPrototypeOf(TimeBalancedRequester.prototype), 'send', this)).call.apply(_get2, [this].concat(args, [cb]));else {
                var _get3;

                originalPromise = (_get3 = _get(TimeBalancedRequester.prototype.__proto__ || Object.getPrototypeOf(TimeBalancedRequester.prototype), 'send', this)).call.apply(_get3, [this].concat(args));
                originalPromise.then(function (res) {
                    originalPromise.state = 'resolved';
                    cb(res);
                }).catch(function (err) {
                    originalPromise.state = 'rejected';
                    cb(err);
                });
                return this.callbacks[id];
            }
        }
    }]);

    return TimeBalancedRequester;
}(Requester);
//# sourceMappingURL=time-balanced-requester.js.map