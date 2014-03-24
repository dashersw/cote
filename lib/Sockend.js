var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon'),
    Subscriber = require('./Subscriber'),
    Requester = require('./Requester');


var Sockend = function(io, advertisement, discoveryOptions) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    advertisement = advertisement || {};
    advertisement.axon_type = 'sockend';
    this.advertisement = advertisement;
    this.requesterTransformators = [];

    var that = this,
        d = Discovery(advertisement, discoveryOptions);

    var namespaces = {};

    d.on('added', function(obj) {
        if (obj.advertisement.axon_type != 'rep') return;
        if (obj.advertisement.key != advertisement.key) return;

        var namespace = obj.advertisement.namespace,
            normalizedNamespace =  namespace || '';

        if (namespaces['/' + normalizedNamespace]) return;

        namespaces['/' + normalizedNamespace] = true;
        obj.namespace = namespace;

        var requester = new Requester({
            name: 'sockendReq',
            namespace: namespace,
            key: that.advertisement.key
        }, discoveryOptions);
        obj.requester = requester;

        obj.requesterSocketHandler = function(socket) {
            obj.advertisement.respondsTo.forEach(function(topic) {
                socket.on(topic, function(data, cb) {
                    if (arguments.length == 1 && typeof data == 'function') {
                        cb = data;
                        data = {};
                    }

                    data.type = topic;

                    that.requesterTransformators.forEach(function(transFn) {
                        transFn(data, socket);
                    });

                    requester.send(data, cb);
                });
            });
        };

        requester.on('ready', function() {
            var server = io.sockets;
            if (namespace) server = io.of('/' + namespace);
            server.on('connection', obj.requesterSocketHandler);

            for (var sId in server.sockets)
                obj.requesterSocketHandler(server.sockets[sId]);
        });
    });

    d.on('added', function(obj) {
        if (obj.advertisement.axon_type != 'pub-emitter') return;
        if (obj.advertisement.key != advertisement.key) return;

        var subscriber = new Subscriber({
            name: 'sockendSub',
            namespace: obj.advertisement.namespace,
            key: that.advertisement.key
        }, discoveryOptions);

        obj.subscriber = subscriber;

        subscriber.on('**', function(data) {
            if (this.event == 'added' || this.event == 'removed') return;

            var topic = this.event.split('::'),
                namespace = '';

            if (topic.length > 1) {
                namespace += '/' + topic[0];
                topic = topic.slice(1)
            }

            topic = topic.join('');

            io.of(namespace).emit(topic, data);
        });

        subscriber.on('removed', function() {
            subscriber.close();
        });
    });
};
util.inherits(Sockend, EventEmitter);

module.exports = Sockend;
