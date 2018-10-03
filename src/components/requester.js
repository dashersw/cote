const Configurable = require('./configurable');
const Monitorable = require('./monitorable');
const Component = require('./component');
const axon = require('@dashersw/axon');

module.exports = class Requester extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.sock = new axon.types[this.type]();
        this.sock.set('retry timeout', 0);
        this.timeout = advertisement.timeout || process.env.COTE_REQUEST_TIMEOUT;

        this.startDiscovery();
    }

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
