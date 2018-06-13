const Configurable = require('./configurable');
const Component = require('./component');
const axon = require('@dashersw/axon');
const portfinder = require('portfinder');

module.exports = class Publisher extends Configurable(Component) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.sock = new axon.types[this.type]();
        this.sock.sock.on('bind', () => this.startDiscovery());

        const onPort = (err, port) => {
            this.advertisement.port = +port;

            this.sock.bind(port);
            this.sock.sock.server.on('error', (err) => {
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

    wrap(topic, data) {
        if (topic.indexOf('@') > 0) {
            const parts = topic.split('@');
            return {
                topic: parts[0],
                room: parts[1],
                data: data,
            };
        }
        return { topic: topic, data: data };
    }

    publish(topic, data) {
        let namespace = '';

        if (this.advertisement.namespace) {
            namespace = this.advertisement.namespace + '::';
        }

        topic = 'message::' + namespace + topic;
        const wrapper = this.wrap(topic, data);
        topic = wrapper.topic;
        delete wrapper.topic;
        this.sock.emit(topic, wrapper);
    };

    get type() {
        return 'pub-emitter';
    }

    get oppo() {
        return 'sub-emitter';
    }
};
