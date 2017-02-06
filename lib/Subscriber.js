import {EventEmitter2 as EventEmitter} from 'eventemitter2';
import util from 'util';
import Discovery from './Discovery';
import axon from '@dashersw/axon';

class Subscriber extends EventEmitter {
    constructor(advertisement, discoveryOptions) {
        super({
            wildcard: true, // should the event emitter use wildcards.
            delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
            newListener: false, // if you want to emit the newListener event set to true.
            maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
        });

        advertisement.key = Subscriber.environment + (advertisement.key || '');

        advertisement.axon_type = 'sub-emitter';
        this.advertisement = advertisement;

        const that = this;
        const d = that.discovery = Discovery(advertisement, discoveryOptions);
        const statusInterval = discoveryOptions && discoveryOptions.statusInterval || 5000;

        d.on('added', obj => {
            const adv = obj.advertisement;

            if (adv.type == 'monitor' && (adv.key ? adv.key == advertisement.key : true)) {
                const statusPublisher = new axon.PubEmitterSocket();
                statusPublisher.connect(adv.port, Subscriber.useHostNames ? obj.hostName : obj.address);

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

            if (adv.axon_type != 'pub-emitter') return;

            obj.sock = new axon.SubEmitterSocket();
            obj.sock.connect(adv.port, Subscriber.useHostNames ? obj.hostName : obj.address);
            obj.sock.sock.set('retry timeout', 0);

            obj.sock.sock.on('socket close', () => {
                that.emit('removed', obj);
            });

            advertisement.subscribesTo = advertisement.subscribesTo || ['*'];

            advertisement.subscribesTo.forEach(topic => {
                let namespace = '';
                if (advertisement.namespace) namespace = `${advertisement.namespace}::`;

                topic = `message::${namespace}${topic}`;

                ((topic => {
                    obj.sock.on(topic, function() {
                        const args = Array.prototype.slice.call(arguments);

                        if (args.length == 1)
                            args.unshift(topic.substr(9));
                        else
                            args[0] = namespace + args[0];

                        that.emit(...args);
                    });
                }))(topic);
            });
        });

        d.on('removed', obj => {
            if (obj && obj.sock)
                obj.sock.close();
        });
    }

    on(type, listener) {
        let namespace = '';
        if (this.advertisement.namespace)
            namespace = `${this.advertisement.namespace}::`;

        return EventEmitter.prototype.on.call(this, namespace + type, listener);
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
        Subscriber.environment = `${environment}:`;
    }

    static setUseHostNames(useHostNames) {
        Subscriber.useHostNames = useHostNames;
    }
}


Subscriber.environment = '';


Subscriber.useHostNames = false;


export default Subscriber;
