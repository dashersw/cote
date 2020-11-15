const axon = require('@dashersw/axon');
const portfinder = require('portfinder');
const Configurable = require('./configurable');
const Component = require('./component');

// eslint-disable-next-line
const colors = require('colors');

module.exports = class Responder extends Configurable(Component) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.sock = new axon.types[this.type]();
        this.sock.on('bind', () => this.startDiscovery());

        this.sock.on('message', (req, cb) => {
            if (!req.type) return;

            if (this.listeners(req.type).length === 0 && this.discoveryOptions.logUnknownEvents) {
                this.discovery.log([this.advertisement.name, '>', `No listeners found for event: ${req.type}`.yellow]);
            }

            this.emit(req.type, req, cb);
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

    get type() {
        return 'rep';
    }

    get oppo() {
        return 'req';
    }
};
