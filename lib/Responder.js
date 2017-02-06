import {EventEmitter2 as EventEmitter} from 'eventemitter2';
import util from 'util';
import Discovery from './Discovery';
import axon from '@dashersw/axon';

class Responder extends EventEmitter {
    constructor(advertisement, discoveryOptions) {
        super({
            wildcard: true, // should the event emitter use wildcards.
            delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
            newListener: false, // if you want to emit the newListener event set to true.
            maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
        });

        advertisement.key = Responder.environment + (advertisement.key || '');

        advertisement.axon_type = 'rep';
        this.advertisement = advertisement;

        const that = this;
        const d = that.discovery = Discovery(advertisement, discoveryOptions);
        const statusInterval = discoveryOptions && discoveryOptions.statusInterval || 5000;

        d.on('added', obj => {
            const adv = obj.advertisement;

            if (adv.type == 'monitor' && (adv.key ? adv.key == advertisement.key : true)) {
                const statusPublisher = new axon.PubEmitterSocket();
                statusPublisher.connect(adv.port, Responder.useHostNames ? obj.hostName : obj.address);

                setInterval(() => {
                    const nodes = [];

                    for (const id in that.discovery.nodes) {
                        const node = that.discovery.nodes[id];

                        if (node.sock)
                            nodes.push(id);
                    }

                    statusPublisher.emit('status', {
                        id: d.me.id,
                        nodes
                    });
                }, statusInterval);
            }

            if (obj.advertisement.key != advertisement.key) return;

            that.emit('added', obj);

            if (adv.axon_type != 'req') return;
            if (advertisement.namespace != adv.namespace) return;

            obj.sock = new axon.RepSocket();
            obj.sock.connect(adv.port, Responder.useHostNames ? obj.hostName : obj.address);
            obj.sock.set('retry timeout', 0);

            obj.sock.on('socket close', () => {
                that.emit('removed', obj);
            });

            obj.sock.on('message', (req, cb) => {
                if (!req.type) return;

                that.emit(req.type, req, cb);
            });
        });

        d.on('removed', obj => {
            if (obj && obj.sock)
                obj.sock.close();
        });
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
        Responder.environment = `${environment}:`;
    }

    static setUseHostNames(useHostNames) {
        Responder.useHostNames = useHostNames;
    }
}

Responder.environment = '';


Responder.useHostNames = false;


export default Responder;
