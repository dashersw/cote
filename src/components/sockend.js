const Subscriber = require('./subscriber');
const Requester = require('./requester');
const Configurable = require('./configurable');
const Component = require('./component');

module.exports = class Sockend extends Configurable(Component) {
    constructor(io, advertisement, discoveryOptions) {
        const originalKey = advertisement.key;
        super(advertisement, discoveryOptions);

        this.requesterTransformators = [];

        this.startDiscovery();

        const namespaces = {};

        this.discovery.on('added', (obj) => {
            if (obj.advertisement.axon_type != 'rep') return;
            if (obj.advertisement.key != this.advertisement.key) return;
            if (!Array.isArray(obj.advertisement.respondsTo)) return;

            const namespace = obj.advertisement.namespace;
            const normalizedNamespace = namespace || '';

            if (namespaces['/' + normalizedNamespace]) return;

            namespaces['/' + normalizedNamespace] = true;
            obj.namespace = namespace;

            const requester = new Requester({
                name: 'sockendReq',
                namespace,
                key: originalKey,
            }, discoveryOptions);
            obj.requester = requester;

            const originalRequestOnAdded = requester.onAdded.bind(requester);
            requester.onAdded = (obj) => {
                if (!Array.isArray(obj.advertisement.respondsTo)) return;
                originalRequestOnAdded(obj);
            };

            obj.requesterSocketHandler = (socket) => {
                obj.advertisement.respondsTo.forEach((topic) => {
                    socket.on(topic, (data, cb) => {
                        if (typeof data == 'function' && typeof cb == 'undefined') {
                            cb = data;
                            data = {};
                        }

                        data.type = topic;

                        this.requesterTransformators.forEach((transFn) => transFn(data, socket));

                        requester.send(data, cb);
                    });
                });
            };

            let server = io.of('/');
            if (namespace) server = io.of('/' + namespace);
            server.on('connection', obj.requesterSocketHandler);

            for (const sId in server.sockets) {
                obj.requesterSocketHandler(server.sockets[sId]);
            }
        });

        const publisherNamespaces = {};

        this.discovery.on('added', (obj) => {
            if (obj.advertisement.axon_type != 'pub-emitter') return;
            if (obj.advertisement.key != this.advertisement.key) return;

            const namespace = obj.advertisement.namespace;
            const normalizedNamespace = namespace || '';

            if (publisherNamespaces['/' + normalizedNamespace]) return;

            publisherNamespaces['/' + normalizedNamespace] = true;
            obj.namespace = namespace;

            const subscriber = new Subscriber({
                name: 'sockendSub',
                namespace: namespace,
                key: originalKey,
                subscribesTo: obj.advertisement.broadcasts,
            }, discoveryOptions);

            subscriber.onMonitorAdded = () => {
            };

            obj.subscriber = subscriber;

            subscriber.on('**', function(data) {
                /* eslint-disable no-invalid-this */
                if (this.event == 'cote:added' || this.event == 'cote:removed') return;

                let topic = this.event.split('::');
                let namespace = '';
                if (topic.length > 1) {
                    namespace += '/' + topic[0];
                    topic = topic.slice(1);
                }
                topic = topic.join('');

                const emitter = io.of(namespace);
                if (data.__room) {
                    data.__rooms = new Set(data.__rooms || []);
                    data.__rooms.add(data.__room);
                    delete data.__room;
                }
                if (data.__rooms) {
                    const rooms = data.__rooms;
                    delete data.__rooms;
                    rooms.forEach((room) => {
                        emitter.to(room).emit(topic, data);
                    });
                } else {
                    emitter.emit(topic, data);
                }
            });
        });
    };

    get type() {
        return 'sockend';
    }
};
