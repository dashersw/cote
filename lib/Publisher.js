const Configurable = require('./Configurable');
const Component = require('./Component');
const axon = require('@dashersw/axon');
const portfinder = require('portfinder');

module.exports = class Publisher extends Configurable(Component) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        let host = this.discoveryOptions.address || '0.0.0.0';

        const onPort = (err, port) => {
            this.advertisement.port = +port;

            this.sock = new axon.types[this.type]();
            this.sock.sock.bind(port);
            this.sock.sock.server.on('error', (err) => {
                if (err.code != 'EADDRINUSE') throw err;

                const opts = {host, port: this.advertisement.port};
                portfinder.getPort(opts, onPort);
            });

            this.sock.sock.on('bind', (_) => this.emit('ready', this.sock));
        };

        portfinder.getPort({host, port: this.advertisement.port}, onPort);
    }

    publish(topic, data) {
        let namespace = '';

        if (this.advertisement.namespace)
            namespace = this.advertisement.namespace + '::';

        topic = 'message::' + namespace + topic;

        this.sock && this.sock.emit(topic, data);
    };

    get type() {
        return 'pub-emitter';
    }
    get oppo() {
        return 'sub-emitter';
    }
};
