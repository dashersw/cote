var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon');

var Responder = function(advertisement, discoveryOptions) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    advertisement.key = Responder.environment + (advertisement.key || '');

    advertisement.axon_type = 'rep';
    this.advertisement = advertisement;

    var that = this,
        d = that.discovery = Discovery(advertisement, discoveryOptions),
        statusInterval = discoveryOptions && discoveryOptions.statusInterval || 5000;

    d.on('added', function(obj) {
        var adv = obj.advertisement;

        if (adv.type == 'monitor' && (adv.key ? adv.key == advertisement.key : true)) {
            var statusPublisher = new axon.PubEmitterSocket();
            statusPublisher.connect(adv.port, obj.address);

            setInterval(function() {
                var nodes = [];

                for (var id in that.discovery.nodes) {
                    var node = that.discovery.nodes[id];

                    if (node.sock)
                        nodes.push(id);
                }

                statusPublisher.emit('status', {
                    id: d.me.id,
                    nodes: nodes
                });
            }, statusInterval);
        }

        if (obj.advertisement.key != advertisement.key) return;

        that.emit('added', obj);

        if (adv.axon_type != 'req') return;
        if (advertisement.namespace != adv.namespace) return;

        obj.sock = new axon.RepSocket();
        obj.sock.connect(adv.port, obj.address);
        obj.sock.set('retry timeout', 0);

        obj.sock.on('socket close', function() {
            that.emit('removed', obj);
        });

        obj.sock.on('message', function(req, cb) {
            if (!req.type) return;

            that.emit(req.type, req, cb);
        });
    });

    d.on('removed', function(obj) {
        if (obj && obj.sock)
            obj.sock.close();
    });
};
util.inherits(Responder, EventEmitter);


Responder.prototype.close = function() {
    if (this.discovery) {
        this.discovery.stop();

        this.discovery.broadcast &&
            this.discovery.broadcast.socket &&
            this.discovery.broadcast.socket.close();
    }
};


Responder.environment = '';


Responder.setEnvironment = function(environment) {
    Responder.environment = environment + ':';
};


module.exports = Responder;
