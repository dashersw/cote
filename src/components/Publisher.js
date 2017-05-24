const Configurable = require('./Configurable');
const Component = require('./Component');
const axon = require('@dashersw/axon');
const portfinder = require('portfinder');

module.exports = class Publisher extends Configurable(Component) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        setInterval(() => {
            console.log('intervalport', this.discovery.me.advertisement.port);
        }, 1000);

        let host = this.discoveryOptions.address || '0.0.0.0';
        this.sock = new axon.types[this.type]();
console.log('my port', this.advertisement.port);
        const onPort = (err, port) => {
            console.log('trying port', port)
            this.advertisement.port = +port;

            this.sock.sock.bind(port);
            this.sock.sock.server.on('error', (err) => {
                if (err.code != 'EADDRINUSE') throw err;

                const opts = {host, port: this.advertisement.port};
                portfinder.getPort(opts, onPort);
            });

            this.sock.sock.on('bind', () => this.startDiscovery());
        };

        portfinder.getPort({host, port: this.advertisement.port}, onPort);
    }

    publish(topic, data) {
        let namespace = '';

        if (this.advertisement.namespace)
            namespace = this.advertisement.namespace + '::';

        topic = 'message::' + namespace + topic;

        this.sock.emit(topic, data);
    };

    get type() {
        return 'pub-emitter';
    }
    get oppo() {
        return 'sub-emitter';
    }
};
