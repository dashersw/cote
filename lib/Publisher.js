import {EventEmitter2 as EventEmitter} from 'eventemitter2';
import util from 'util';
import Discovery from './Discovery';
import axon from '@dashersw/axon';
import portfinder from 'portfinder';

class Publisher extends EventEmitter {
    constructor(advertisement, discoveryOptions) {
        super({
            wildcard: true, // should the event emitter use wildcards.
            delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
            newListener: false, // if you want to emit the newListener event set to true.
            maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
        });

        advertisement.key = Publisher.environment + (advertisement.key || '');

        const that = this;
        advertisement.axon_type = 'pub-emitter';

        this.advertisement = advertisement;

        const host = discoveryOptions && discoveryOptions.address || '0.0.0.0';

        portfinder.getPort({host, port: advertisement.port}, onPort);

        function onPort(err, port) {
            advertisement.port = +port;

            const d = that.discovery = Discovery(advertisement, discoveryOptions);

            that.sock = new axon.PubEmitterSocket();
            that.sock.bind(port);
            that.sock.sock.server.on('error', err => {
                if (err.code != 'EADDRINUSE') throw err;

                portfinder.getPort({host, port: advertisement.port}, onPort);
            });

            that.sock.sock.on('bind', () => {
                that.emit('ready', that.sock);

                d.on('added', obj => {
                    that.emit('added', obj);
                });

                d.on('removed', obj => {
                    that.emit('removed', obj);
                });
            });
        }
    }

    publish(topic, data) {
        let namespace = '';
        if (this.advertisement.namespace)
            namespace = `${this.advertisement.namespace}::`;

        topic = `message::${namespace}${topic}`;

        this.sock && this.sock.emit(topic, data);
    }

    close() {
        if (this.discovery) {
            this.discovery.stop();

            this.discovery.broadcast &&
                this.discovery.broadcast.socket &&
                this.discovery.broadcast.socket.close();
        }
    }

    static setEnvironment(environment) {
        Publisher.environment = `${environment}:`;
    }
}

Publisher.environment = '';


export default Publisher;
