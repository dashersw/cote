const Configurable = require('./Configurable');
const Monitorable = require('./Monitorable');
const Component = require('./Component');
const axon = require('@dashersw/axon');

module.exports = class Subscriber extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.startDiscovery();

        this.sock = new axon.types[this.type]();
        this.sock.sock.set('retry timeout', 0);

        this.advertisement.subscribesTo = this.advertisement.subscribesTo || ['*'];

        this.advertisement.subscribesTo.forEach((topic) => {
            let namespace = '';
            if (this.advertisement.namespace)
                namespace = this.advertisement.namespace + '::';

            topic = 'message::' + namespace + topic;

            ((topic) => {
                this.sock.on(topic, (...args) => {
                    if (args.length == 1)
                        args.unshift(topic.substr(9));
                    else
                        args[0] = namespace + args[0];

                    this.emit(...args);
                });
            })(topic);
        });
    }

    onAdded(obj) {
        let address = Subscriber.useHostNames ? obj.hostName : obj.address;

        this.sock.connect(obj.advertisement.port, address);
    }

    on(type, listener) {
        return super.on(this.formatTypeWithNamespace(type), listener);
    }

    formatTypeWithNamespace(type) {
        let namespace = '';
        if (this.advertisement.namespace)
            namespace = this.advertisement.namespace + '::';

        return namespace + type;
    }

    get type() {
        return 'sub-emitter';
    }
    get oppo() {
        return 'pub-emitter';
    }
};
