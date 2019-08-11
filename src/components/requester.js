const Configurable = require('./configurable');
const Monitorable = require('./monitorable');
const Component = require('./component');
const axon = require('@dashersw/axon');
const debug = require('debug')('axon:req');

const SUBSET_IDENTIFIER = '__subset';


module.exports = class Requester extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.sock = new axon.types[this.type]();
        this.sock.set('retry timeout', 0);
        this.timeout = advertisement.timeout || process.env.COTE_REQUEST_TIMEOUT;

        this.sock.send = this.socketSend.bind(this);
        this.startDiscovery();
    }

    filterSubsetInSocks(subset, socks) {
    // Find correct nodes
        const possibleNodes = Object.values(this.discovery.nodes).filter((node) => {
            return node.advertisement.subset == subset;
        });

        // Find corresponding sockets
        const possibleSocks = possibleNodes.map((node) => {
            return socks.find((sock) => {
                return sock.remoteAddress == node.address &&
                        sock.remotePort == node.advertisement.port;
            });
        }).filter((sock) => sock);

        return possibleSocks;
    }

    // This function overwrites the axon socket's send() function.
    // The socketSend() function's `this` is bound to this class in
    // order to have access to the advertisement of other nodes.
    // That advertisement contains each node's `subset` properties, which are needed
    // to find specific subset Responders and their corresponding socks.
    socketSend(...args) {
    // (1) Original logic from https://github.com/dashersw/axon/blob/master/lib/sockets/req.js#L94
        const { socks } = this.sock;
        // Enqueue if no socks connected yet
        if (!socks || !socks.length) {
            debug('no connected peers');
            return this.sock.enqueue(args);
        }
        // (1) end

        // The following part chooses either a subset or all connected socks depending on the
        // existence of the SUBSET_IDENTIFIER
        const data = args[0];
        const subset = data[SUBSET_IDENTIFIER];

        const possibleSocks = subset ? this.filterSubsetInSocks(subset, socks) : socks;
        // Enqueue if the correct nodes did not connect yet/does not exist
        if (!possibleSocks.length) return this.sock.enqueue(args);

        // Balance between available
        const sock = possibleSocks[this.sock.n++ % possibleSocks.length];

        // Save callback. In this context it will always have a context as it is called by sendOverSocket()
        // (2) Original logic from https://github.com/dashersw/axon/blob/master/lib/sockets/req.js#L88
        const fn = args.pop();
        fn.id = this.sock.id();
        this.sock.callbacks[fn.id] = fn;
        args.push(fn.id);
        // (2) end

        // Remove possible subset identifier from message
        delete args[0][SUBSET_IDENTIFIER];

        // Send over sock
        // (3) Original logic from https://github.com/dashersw/axon/blob/master/lib/sockets/req.js#L94
        sock.write(this.sock.pack(args));
    // (3) end
    };

    onAdded(obj) {
        super.onAdded(obj);

        const address = this.constructor.useHostNames ? obj.hostName : obj.address;

        const alreadyConnected = this.sock.socks.some((s) =>
            (this.constructor.useHostNames ? s._host == obj.hostName : s.remoteAddress == address) &&
             s.remotePort == obj.advertisement.port);

        if (alreadyConnected) return;

        this.sock.connect(obj.advertisement.port, address);
    }

    send(...args) {
        const hasCallback = typeof args[args.length - 1] == 'function';
        const timeout = args[0].__timeout || this.timeout;

        if (hasCallback) return sendOverSocket(this.sock, timeout, ...args);

        return new Promise((resolve, reject) => {
            sendOverSocket(this.sock, timeout, ...args, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    get type() {
        return 'req';
    }
    get oppo() {
        return 'rep';
    }
};

function sendOverSocket(sock, timeout, ...args) {
    if (!timeout) return sock.send(...args);

    const cb = args.pop();

    const timeoutHandle = setTimeout(() => {
        // Remove the request from the request queue so that it's not sent to responders (#183)
        const req = sock.queue.findIndex((r) => r[r.length - 1] == messageCallback);
        if (req > -1) sock.queue.splice(req, 1);

        // Remove the request callback
        delete sock.callbacks[messageCallback.id];

        cb(new Error('Request timed out.'));
    }, timeout);

    const messageCallback = (...args) => {
        clearTimeout(timeoutHandle);
        cb(...args);
    };

    sock.send(...args, messageCallback);
}
