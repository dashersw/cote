import {EventEmitter2 as EventEmitter} from 'eventemitter2';
import util from 'util';
import Discovery from './Discovery';
import axon from '@dashersw/axon';
import portfinder from 'portfinder';

class Requester extends EventEmitter {
    constructor(advertisement, discoveryOptions) {
        EventEmitter.call(this, {
            wildcard: true, // should the event emitter use wildcards.
            delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
            newListener: false, // if you want to emit the newListener event set to true.
            maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
        });

        advertisement.key = Requester.environment + (advertisement.key || '');

        const that = this;
        advertisement.axon_type = 'req';

        this.advertisement = advertisement;

        const host = discoveryOptions && discoveryOptions.address || '0.0.0.0';

        portfinder.getPort({host, port: advertisement.port}, onPort);

        function onPort(err, port) {
            advertisement.port = +port;

            const d = that.discovery = Discovery(advertisement, discoveryOptions);

            that.sock = new axon.ReqSocket();
            that.sock.bind(port);
            that.sock.server.on('error', err => {
                if (err.code != 'EADDRINUSE') throw err;

                portfinder.getPort({host, port: advertisement.port}, onPort);
            });

            that.sock.on('bind', () => {
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

    send() {
        const args = Array.prototype.slice.call(arguments);

        this.sock && this.sock.send(...args);
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
        Requester.environment = `${environment}:`;
    }
}

Requester.environment = '';


export default Requester;
