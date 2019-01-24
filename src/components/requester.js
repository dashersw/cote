const Configurable = require('./configurable');
const Monitorable = require('./monitorable');
const Component = require('./component');
const axon = require('@dashersw/axon');
const debug = require('debug')('axon:req');

const SUBGROUP_IDENTIFIER = '__subgroup';


module.exports = class Requester extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.sock = new axon.types[this.type]();
        this.sock.set('retry timeout', 0);
        this.timeout = advertisement.timeout || process.env.COTE_REQUEST_TIMEOUT;

        this.sock.send = this.socketSend.bind(this);
        this.startDiscovery();
    }

    filterSubgroupInSocks(subgroup, socks) {
        // Find correct nodes
        const possibleNodes = Object.values(this.discovery.nodes).filter((node) => {
            return node.advertisement.subgroup == subgroup;
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

    socketSend(...args) {
        let { socks } = this.sock;
        // Enqueue if no socks connected yet
        if (!socks || !socks.length) {
            debug('no connected peers');
            return this.sock.enqueue(args);
        }

        const data = args[0];
        const subgroup = data[SUBGROUP_IDENTIFIER];

        let possibleSocks = subgroup ? this.filterSubgroupInSocks(subgroup, socks) : socks;
        // Enqueue if the correct nodes did not connect yet/does not exist
        if (!possibleSocks.length) return this.sock.enqueue(args);

        // Balance between available
        const sock = possibleSocks[this.sock.n++ % possibleSocks.length];

        // Save callback
        let fn = args.pop();
        fn.id = this.sock.id();
        this.sock.callbacks[fn.id] = fn;
        args.push(fn.id);

        // Remove possible subgrouo identifier from message
        delete args[0][SUBGROUP_IDENTIFIER];

        // Send over sock
        sock.write(this.sock.pack(args));
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
        delete sock.callbacks[messageCallback.id];
        cb(new Error('Request timed out.'));
    }, timeout);

    const messageCallback = (...args) => {
        clearTimeout(timeoutHandle);
        cb(...args);
    };

    sock.send(...args, messageCallback);
}
