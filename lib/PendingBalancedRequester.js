import util from 'util';
import Requester from './Requester';
import uuid from 'node-uuid';
import _ from 'lodash';

class PendingBalancedRequester extends Requester {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        advertisement.key = PendingBalancedRequester.environment + (advertisement.key || '');

        this.on('ready', function() {
            this.sock.on('connect', sock => {
                sock.uuid = uuid.v4();
            });
        });
    }

    send() {
        const sock = this.sock;

        if (sock.socks.length) {
            sock.socks.forEach(s => {
                s.count = 0;
            });

            _.forEach(sock.callbacks, cb => {
                cb.sock && cb.sock.count++;
            });

            sock.n = sock.socks.indexOf(_.minBy(sock.socks, 'count'));
        }

        const args = Array.prototype.slice.call(arguments);
        Requester.prototype.send.apply(this, args);

        if (!sock.socks.length) return;

        const sentSock = sock.socks[sock.n - 1];

        const cbId = `${sock.identity}:${sock.ids - 1}`;
        sock.callbacks[cbId].sock = sentSock;

        return sentSock.uuid;
    }

    static setEnvironment(environment) {
        PendingBalancedRequester.environment = `${environment}:`;
    }
}

PendingBalancedRequester.environment = '';

export default PendingBalancedRequester;
