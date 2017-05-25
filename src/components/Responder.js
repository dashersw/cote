const axon = require('@dashersw/axon');
const portfinder = require('portfinder');
const Configurable = require('./Configurable');
const Monitorable = require('./Monitorable');
const Component = require('./Component');

module.exports = class Responder extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.sock = new axon.RepSocket();
        this.sock.on('bind', () => this.startDiscovery());

        this.sock.on('message', (req, cb) => {
            if (!req.type) return;

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
            let rv = listener(...args);

            if (rv && typeof rv.then == 'function') {
                let cb = args.pop();
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
