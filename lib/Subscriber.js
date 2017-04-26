var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('@dashersw/axon');

var Subscriber = function(advertisement, discoveryOptions) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    if (!advertisement.key || advertisement.key && advertisement.key.indexOf('$$') == -1)
        advertisement.key = Subscriber.environment + '$$' + (advertisement.key || '');

    advertisement.axon_type = 'sub-emitter';
    this.advertisement = advertisement;

    var that = this,
        d = that.discovery = Discovery(advertisement, discoveryOptions),
        statusInterval = discoveryOptions && discoveryOptions.statusInterval || 5000;

    this.sock = new axon.SubEmitterSocket();
    this.sock.sock.set('retry timeout', 0);

    advertisement.subscribesTo = advertisement.subscribesTo || ['*'];

    advertisement.subscribesTo.forEach(function(topic) {
        var namespace = '';
        if (advertisement.namespace) namespace = advertisement.namespace + '::';

        topic = 'message::' + namespace + topic;

        (function(topic) {
            that.sock.on(topic, function() {
                var args = Array.prototype.slice.call(arguments);

                if (args.length == 1)
                    args.unshift(topic.substr(9));
                else
                    args[0] = namespace + args[0];

                that.emit.apply(that, args);
            });
        })(topic);
    });

    d.on('added', function(obj) {
        var adv = obj.advertisement;

        if (adv.type == 'monitor' && (adv.key ? adv.key == advertisement.key : true)) {
            var statusPublisher = new axon.PubEmitterSocket();
            statusPublisher.connect(adv.port, Subscriber.useHostNames ? obj.hostName : obj.address);

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

        if (adv.axon_type != 'pub-emitter') return;

        that.sock.connect(adv.port, Subscriber.useHostNames ? obj.hostName : obj.address);
    });
};
util.inherits(Subscriber, EventEmitter);


Subscriber.prototype.on = function(type, listener) {
    var namespace = '';
    if (this.advertisement.namespace)
        namespace = this.advertisement.namespace + '::';

    return EventEmitter.prototype.on.call(this, namespace + type, listener);
};


Subscriber.prototype.close = function() {
    if (this.discovery) {
        this.discovery.stop();

        this.discovery.broadcast &&
            this.discovery.broadcast.socket &&
            this.discovery.broadcast.socket.close();
    }

    this.sock && this.sock.close();
};


Subscriber.environment = '';


Subscriber.setEnvironment = function(environment) {
    Subscriber.environment = environment + ':';
};


Subscriber.useHostNames = false;


Subscriber.setUseHostNames = function(useHostNames) {
    Subscriber.useHostNames = useHostNames;
};


module.exports = Subscriber;
