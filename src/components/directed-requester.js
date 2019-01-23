const debug = require('debug')('axon:req');

const Requester = require('./requester');
const IDENTIFIER = '__subgroup';

module.exports = class DirectedRequester extends Requester {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);
        this.sock.send = this.socketSend.bind(this);
        this.n = 0;
    }

    socketSend(...args) {
        // Enqueue if no socks connected yet
        const requesterSock = this.sock;
        if (!requesterSock.socks || !requesterSock.socks.length) {
            debug('no connected peers');
            return this.sock.enqueue(args);
        }

        const data = args[0];
        // Requires selector parameter
        if (!data[IDENTIFIER]) {
            let fn = args.pop();
            fn(new Error(`send() needs a "${IDENTIFIER}" property in the request body when using DirectedRequester`));
        }

        // Find correct node
        const possibleNodes = Object.values(this.discovery.nodes).filter((node) => {
            return node.advertisement.subgroup == data[IDENTIFIER];
        });

        // Find corresponding sockets
        const possibleSocks = possibleNodes.map((node) => {
            return requesterSock.socks.find((sock) => {
                return sock.remoteAddress == node.address &&
                       sock.remotePort == node.advertisement.port;
            });
        }).filter((sock) => sock);

        // Load balance between sockets
        const sock = possibleSocks[this.n++ % possibleSocks.length];

        // Enqueue if the correct sock did not connect yet/does not exist
        if (!sock) return this.sock.enqueue(args);

        // Save callback
        let hasCallback = 'function' == typeof args[args.length - 1];
        if (!hasCallback) args.push(function() {});
        let fn = args.pop();
        fn.id = requesterSock.id();
        requesterSock.callbacks[fn.id] = fn;
        args.push(fn.id);

        // Remove identifier from message
        delete args[0][IDENTIFIER];

        // Send over sock
        sock.write(requesterSock.pack(args));
    };
};
