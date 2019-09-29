const EventEmitter = require('eventemitter2').EventEmitter2;
const Discovery = require('./discovery');

module.exports = class Component extends EventEmitter {
    constructor(advertisement, discoveryOptions = {}) {
        super({
            wildcard: true, // should the event emitter use wildcards.
            delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
            newListener: false, // if you want to emit the newListener event set to true.
            maxListeners: 2000, // the max number of listeners that can be assigned to an event, defaults to 10.
        });

        advertisement.key = this.constructor.environment + '$$' + (advertisement.key || '');

        this.advertisement = advertisement;
        this.advertisement.axon_type = this.type;

        this.discoveryOptions = { ...Discovery.defaults, ...discoveryOptions };
        this.discoveryOptions.address = this.discoveryOptions.address || '0.0.0.0';
    }

    startDiscovery() {
        this.discovery = new Discovery(this.advertisement, this.discoveryOptions);

        this.discovery.on('added', (obj) => {
            if (
                obj.advertisement.axon_type != this.oppo ||
                obj.advertisement.key != this.advertisement.key ||
                this.advertisement.namespace != obj.advertisement.namespace
            ) return;

            this.onAdded(obj);
            this.emit('cote:added', obj);
        });
        this.discovery.on('removed', (obj) => {
            if (
                obj.advertisement.axon_type != this.oppo ||
                obj.advertisement.key != this.advertisement.key ||
                this.advertisement.namespace != obj.advertisement.namespace
            ) return;

            this.onRemoved(obj);
            this.emit('cote:removed', obj);
        });
    }

    onAdded() { };

    onRemoved() { };

    close() {
        this.sock && this.sock.close();
        this.discovery && this.discovery.stop();
    }
};
