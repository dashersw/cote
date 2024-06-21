const axon = require('@dashersw/axon');
const portfinder = require('portfinder');
const Configurable = require('./configurable');
const Component = require('./component');
const uuid = require('uuid');

// eslint-disable-next-line
const colors = require('colors');

module.exports = class Responder extends Configurable(Component) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.messageIds = [];

        this.sock = new axon.types[this.type]();
        this.sock.on('bind', () => this.startDiscovery());

        this.sock.on('message', (req, cb) => {
            if (!req.type) return;

            if (this.listeners(req.type).length === 0 && this.discoveryOptions.logUnknownEvents) {
                this.discovery.log([this.advertisement.name, '>', `No listeners found for event: ${req.type}`.yellow]);
            }

            const messageId = uuid.v4();
            this.messageIds.push(messageId);
            const cbWithCounter = (...cbArgs) => {
                cb(...cbArgs);
                const index = this.messageIds.indexOf(messageId);
                index >= 0 && this.messageIds.splice(index, 1);
            };

            this.emit(req.type, req, cbWithCounter);
        });

        const onPort = (err, port) => {
            this.advertisement.port = +port;

            this.sock.bind(port);
            this.sock.server.on('error', (err) => {
                if (err.code != 'EADDRINUSE') throw err;

                portfinder.getPort({
                    host: this.discoveryOptions.address,
                    port: this.advertisement.port,
                }, onPort);
            });
        };

        portfinder.getPort({
            host: this.discoveryOptions.address,
            port: advertisement.port,
        }, onPort);
    }

    on(type, listener) {
        super.on(type, (...args) => {
            const rv = listener(...args);

            if (this.event.startsWith('cote:')) return;

            if (rv && typeof rv.then == 'function') {
                const cb = args.pop();
                rv.then((val) => cb(null, val)).catch(cb);
            }
        });
    }

    close(cb) {
        if (cb) {
            // Send closing event to all requesters so they will stop sending messages to it
            for (const sock of this.sock.socks) {
                const key = `closing__${sock._peername.address}:${sock.remotePort}`;
                sock.writable && sock.write(this.sock.pack([null, key]));
            }
        }

        super.close(cb);
    }

    get type() {
        return 'rep';
    }

    get oppo() {
        return 'req';
    }
};
