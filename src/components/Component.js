var EventEmitter = require('eventemitter2').EventEmitter2;
var discovery = require('./discovery');

module.exports = class Component extends EventEmitter {
    constructor(advertisement, discoveryOptions) {
        super({
            wildcard: true, // should the event emitter use wildcards.
            delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
            newListener: false, // if you want to emit the newListener event set to true.
            maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
        });

        if (!advertisement.key ||
            advertisement.key && advertisement.key.indexOf('$$') == -1)
            advertisement.key = this.constructor.environment +
            '$$' + (advertisement.key || '');

        this.advertisement = advertisement;
        this.advertisement.axon_type = this.type;

        this.discoveryOptions = discoveryOptions || {};
        this.discovery = discovery(this.advertisement, this.discoveryOptions);

        this.discovery.on('added', this.onAdded.bind(this));
        this.discovery.on('removed', this.onRemoved.bind(this));
    }

    close() {
        if (!this.discovery) return;

        this.discovery.stop();

        if (this.discovery.broadcast && this.discovery.broadcast.socket)
            this.discovery.broadcast.socket.close();
    }

    onAdded(obj) {
        if (obj.advertisement.axon_type != this.oppo) return;
        if (obj.advertisement.key != this.advertisement.key) return;
        if (this.advertisement.namespace != obj.advertisement.namespace) return;

        this.emit('added', obj);
    }

    onRemoved(obj) {
        if (obj.advertisement.axon_type != this.oppo) return;
        if (obj.advertisement.key != this.advertisement.key) return;
        if (this.advertisement.namespace != obj.advertisement.namespace) return;

        obj && obj.sock && obj.sock.close();
        this.emit('removed', obj);
    }
};
