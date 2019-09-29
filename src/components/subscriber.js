const Configurable = require('./configurable');
const Monitorable = require('./monitorable');
const Component = require('./component');
const axon = require('@dashersw/axon');

// eslint-disable-next-line
const colors = require('colors');

module.exports = class Subscriber extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.startDiscovery();

        this.sock = new axon.types[this.type]();
        this.sock.sock.set('retry timeout', 0);

        this.advertisement.subscribesTo = this.advertisement.subscribesTo || ['*'];

        this.advertisement.subscribesTo.forEach((topic) => {
            let namespace = '';
            if (this.advertisement.namespace) {
                namespace = this.advertisement.namespace + '::';
            }

            topic = 'message::' + namespace + topic;

            ((topic) => {
                this.sock.on(topic, (...args) => {
                    if (args.length == 1) {
                        args.unshift(topic.substr(9));
                    } else {
                        args[0] = namespace + args[0];
                    }

                    if (this.listeners(args[0]).length === 0 && this.discoveryOptions.logUnknownEvents) {
                        this.discovery.log([this.advertisement.name, '>',
                            `No listeners found for event: ${args[0]}`.yellow]);
                    }

                    this.emit(...args);
                });
            })(topic);
        });
    }

    onAdded(obj) {
        super.onAdded(obj);

        const address = this.constructor.useHostNames ? obj.hostName : obj.address;

        const alreadyConnected = this.sock.sock.socks.some((s) =>
            (this.constructor.useHostNames ? s._host == obj.hostName : s.remoteAddress == address) &&
            s.remotePort == obj.advertisement.port);

        if (alreadyConnected) return;

        this.sock.connect(obj.advertisement.port, address);
    }

    on(type, listener) {
        return super.on(this.formatTypeWithNamespace(type), listener);
    }

    formatTypeWithNamespace(type) {
        let namespace = '';
        if (this.advertisement.namespace) {
            namespace = this.advertisement.namespace + '::';
        }

        return namespace + type;
    }

    get type() {
        return 'sub-emitter';
    }

    get oppo() {
        return 'pub-emitter';
    }
};
