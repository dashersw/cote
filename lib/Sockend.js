import {EventEmitter2 as EventEmitter} from 'eventemitter2';
import util from 'util';
import Discovery from './Discovery';
import axon from '@dashersw/axon';
import Subscriber from './Subscriber';
import Requester from './Requester';

class Sockend extends EventEmitter {
    constructor(io, advertisement, discoveryOptions) {
        super({
            wildcard: true, // should the event emitter use wildcards.
            delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
            newListener: false, // if you want to emit the newListener event set to true.
            maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
        });

        advertisement = advertisement || {};
        const originalKey = advertisement.key;

        advertisement.key = Sockend.environment + (originalKey || '');

        advertisement.axon_type = 'sockend';
        this.advertisement = advertisement;
        this.requesterTransformators = [];

        const that = this;
        const d = Discovery(advertisement, discoveryOptions);

        const namespaces = {};

        d.on('added', obj => {
            if (obj.advertisement.axon_type != 'rep') return;
            if (obj.advertisement.key != advertisement.key) return;

            const namespace = obj.advertisement.namespace;
            const normalizedNamespace =  namespace || '';

            if (namespaces[`/${normalizedNamespace}`]) return;

            namespaces[`/${normalizedNamespace}`] = true;
            obj.namespace = namespace;

            const requester = new Requester({
                name: 'sockendReq',
                namespace,
                key: originalKey
            }, discoveryOptions);
            obj.requester = requester;

            obj.requesterSocketHandler = socket => {
                if (!Array.isArray(obj.advertisement.respondsTo)) return;

                obj.advertisement.respondsTo.forEach(topic => {
                    socket.on(topic, function(data, cb) {
                        if (arguments.length == 1 && typeof data == 'function') {
                            cb = data;
                            data = {};
                        }

                        data.type = topic;

                        that.requesterTransformators.forEach(transFn => {
                            transFn(data, socket);
                        });

                        requester.send(data, cb);
                    });
                });
            };

            requester.on('ready', () => {
                let server = io;
                if (namespace) server = io.of(`/${namespace}`);
                server.on('connection', obj.requesterSocketHandler);

                for (const sId in server.sockets.sockets) {
                    obj.requesterSocketHandler(server.sockets.sockets[sId]);
                }
            });
        });

        const publisherNamespaces = {};

        d.on('added', obj => {
            if (obj.advertisement.axon_type != 'pub-emitter') return;
            if (obj.advertisement.key != advertisement.key) return;

            const namespace = obj.advertisement.namespace;
            const normalizedNamespace =  namespace || '';

            if (publisherNamespaces[`/${normalizedNamespace}`]) return;

            publisherNamespaces[`/${normalizedNamespace}`] = true;
            obj.namespace = namespace;

            obj.advertisement.broadcasts && obj.advertisement.broadcasts.forEach(topic => {
                const parts = topic.split('::');
                if (parts.length > 1)  // if a topic includes a namespace
                    io.of(parts[0]);   // allow sockets to connect to that namespace
            });

            const subscriber = new Subscriber({
                name: 'sockendSub',
                namespace,
                key: originalKey,
                subscribesTo: obj.advertisement.broadcasts
            }, discoveryOptions);

            obj.subscriber = subscriber;

            subscriber.on('**', function(data) {
                if (this.event == 'added' || this.event == 'removed') return;

                let topic = this.event.split('::');
                let namespace = '';

                if (topic.length > 1) {
                    namespace += `/${topic[0]}`;
                    topic = topic.slice(1)
                }

                topic = topic.join('');

                io.of(namespace).emit(topic, data);
            });
        });
    }

    static setEnvironment(environment) {
        Sockend.environment = `${environment}:`;
    }
}


Sockend.environment = '';


export default Sockend;
