'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Requester = require('./requester');
var _ = require('lodash');
var uuid = require('uuid');

module.exports = function (_Requester) {
    _inherits(PendingBalancedRequester, _Requester);

    function PendingBalancedRequester(advertisement, discoveryOptions) {
        _classCallCheck(this, PendingBalancedRequester);

        var _this = _possibleConstructorReturn(this, (PendingBalancedRequester.__proto__ || Object.getPrototypeOf(PendingBalancedRequester)).call(this, advertisement, discoveryOptions));

        _this.sock.on('connect', function (sock) {
            sock.uuid = uuid.v4();
        });
        return _this;
    }

    _createClass(PendingBalancedRequester, [{
        key: 'send',
        value: function send() {
            var sock = this.sock;

            if (sock.socks.length) {
                sock.socks.forEach(function (s) {
                    s.count = 0;
                });

                _.forEach(sock.callbacks, function (cb) {
                    cb.sock && cb.sock.count++;
                });

                sock.n = sock.socks.indexOf(_.minBy(sock.socks, 'count'));
            }

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var rv = Requester.prototype.send.apply(this, args);

            if (!sock.socks.length) return rv;

            var sentSock = sock.socks[sock.n - 1];

            var cbId = sock.identity + ':' + (sock.ids - 1);
            sock.callbacks[cbId].sock = sentSock;

            return rv || sentSock.uuid;
        }
    }]);

    return PendingBalancedRequester;
}(Requester);
//# sourceMappingURL=pending-balanced-requester.js.map