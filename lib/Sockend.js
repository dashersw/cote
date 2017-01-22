var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('@dashersw/axon'),
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
    var originalKey = advertisement.key;

    advertisement.key = Sockend.environment + (originalKey || '');

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
            key: originalKey
        }, discoveryOptions);
        obj.requester = requester;

        obj.requesterSocketHandler = function(socket) {
            if (!Array.isArray(obj.advertisement.respondsTo)) return;

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
            var server = io;
            if (namespace) server = io.of('/' + namespace);
            server.on('connection', obj.requesterSocketHandler);

            for (var sId in server.sockets.sockets) {
                obj.requesterSocketHandler(server.sockets.sockets[sId]);
            }
        });

        io.httpServer.prependListener('request', function(req, res) {
            var data = '';
            var urlParts = req.url.slice(1).split('/');
            var reqNs = urlParts[0];
            var topic = urlParts[1];

            if (reqNs == 'socket.io' || reqNs !== namespace)
                return;

            if (['POST', 'PUT'].indexOf(req.method) > -1) {
                req.on('data', function (chunk) {
                    data += chunk;
                }).on('end', function () {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {}

                    sendRequest(data, res);
                });
            } else {
                sendRequest({ type: topic }, res);
            }

            function sendRequest(data, res) {
                requester.send(data, function(rv) {
                    res.writeHead(200);
                    res.end(JSON.stringify(arguments.length == 1 ? rv : [].slice.call(arguments)));
                });
            }
        });
    });

    var publisherNamespaces = {};

    d.on('added', function(obj) {
        if (obj.advertisement.axon_type != 'pub-emitter') return;
        if (obj.advertisement.key != advertisement.key) return;

        var namespace = obj.advertisement.namespace,
            normalizedNamespace =  namespace || '';

        if (publisherNamespaces['/' + normalizedNamespace]) return;

        publisherNamespaces['/' + normalizedNamespace] = true;
        obj.namespace = namespace;

        obj.advertisement.broadcasts && obj.advertisement.broadcasts.forEach(function(topic) {
            var parts = topic.split('::');
            if (parts.length > 1)  // if a topic includes a namespace
                io.of(parts[0]);   // allow sockets to connect to that namespace
        });

        var subscriber = new Subscriber({
            name: 'sockendSub',
            namespace: namespace,
            key: originalKey,
            subscribesTo: obj.advertisement.broadcasts
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
    });
};
util.inherits(Sockend, EventEmitter);


Sockend.environment = '';


Sockend.setEnvironment = function(environment) {
    Sockend.environment = environment + ':';
};


module.exports = Sockend;
