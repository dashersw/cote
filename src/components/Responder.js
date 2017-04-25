const axon = require('@dashersw/axon');
const portfinder = require('portfinder');
const Configurable = require('./Configurable');
const Monitorable = require('./Monitorable');
const Component = require('./Component');

module.exports = class Responder extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        let that = this;
        let host = discoveryOptions && discoveryOptions.address || '0.0.0.0';

        const onPort = (err, port) => {
            advertisement.port = +port;

            that.sock = new axon.RepSocket();
            that.sock.bind(port);
            that.sock.server.on('error', function(err) {
                if (err.code != 'EADDRINUSE') throw err;

                portfinder.getPort({host, port: advertisement.port}, onPort);
            });

            that.sock.on('bind', function() {
                that.emit('ready', that.sock);
            });

            that.sock.on('message', function(req, cb) {
                if (!req.type) return;

                that.emit(req.type, req, cb);
            });
        };

        portfinder.getPort({host, port: advertisement.port}, onPort);
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
