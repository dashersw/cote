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

    publish(topic, data) {
        let namespace = '';

        if (this.advertisement.namespace)
            namespace = this.advertisement.namespace + '::';

        topic = 'message::' + namespace + topic;

        // if sending to room, construct wrapper
        const roomDelim = this.advertisement.roomDelimiter || '#';
        if (topic.indexOf(roomDelim) > 0) {
            const wrapper = {__data: data};
            const parts = topic.split(roomDelim);
            topic = parts[0];
            const room = parts[1];
            if (room) {
                wrapper.__room = room;
            }
            this.sock.emit(topic, wrapper);
        } else {
            this.sock.emit(topic, data);
        }
    };

    get type() {
        return 'pub-emitter';
    }
    get oppo() {
        return 'sub-emitter';
    }
};
