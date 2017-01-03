const Requester = require('./requester');
const _ = require('lodash');
const uuid = require('uuid');

module.exports = class PendingBalancedRequester extends Requester {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.sock.on('connect', function(sock) {
            sock.uuid = uuid.v4();
        });
    };

    send(...args) {
        const sock = this.sock;

        if (sock.socks.length) {
            sock.socks.forEach(function(s) {
                s.count = 0;
            });

            _.forEach(sock.callbacks, function(cb) {
                cb.sock && cb.sock.count++;
            });

            sock.n = sock.socks.indexOf(_.minBy(sock.socks, 'count'));
        }

        const rv = Requester.prototype.send.apply(this, args);

        if (!sock.socks.length) return rv;

        const sentSock = sock.socks[sock.n - 1];

        const cbId = sock.identity + ':' + (sock.ids - 1);
        sock.callbacks[cbId].sock = sentSock;

        return rv || sentSock.uuid;
    };
};
