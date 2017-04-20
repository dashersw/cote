var util = require('util'),
    Requester = require('./Requester'),
    uuid = require('node-uuid'),
    _ = require('lodash');

var PendingBalancedRequester = function(advertisement, discoveryOptions) {
    advertisement.key = PendingBalancedRequester.environment + '$$' + (advertisement.key || '');

    Requester.call(this, advertisement, discoveryOptions);

    this.sock.on('connect', function(sock) {
        sock.uuid = uuid.v4();
    });
};
util.inherits(PendingBalancedRequester, Requester);

module.exports = PendingBalancedRequester;


PendingBalancedRequester.prototype.send = function() {
    var sock = this.sock;

    if (sock.socks.length) {
        sock.socks.forEach(function(s) {
            s.count = 0;
        });

        _.forEach(sock.callbacks, function(cb) {
            cb.sock && cb.sock.count++;
        });

        sock.n = sock.socks.indexOf(_.minBy(sock.socks, 'count'));
    }

    var args = Array.prototype.slice.call(arguments);
    var rv = Requester.prototype.send.apply(this, args);

    if (!sock.socks.length) return rv;

    var sentSock = sock.socks[sock.n - 1];

    var cbId = sock.identity + ':' + (sock.ids - 1);
    sock.callbacks[cbId].sock = sentSock;

    return rv || sentSock.uuid;
};


PendingBalancedRequester.environment = '';


PendingBalancedRequester.setEnvironment = function(environment) {
    PendingBalancedRequester.environment = environment + ':';
};
