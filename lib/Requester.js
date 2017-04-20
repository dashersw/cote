var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('@dashersw/axon');

var Requester = function(advertisement, discoveryOptions) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
    });


    if (!advertisement.key || advertisement.key && advertisement.key.indexOf('$$') == -1)
        advertisement.key = Requester.environment + '$$' + (advertisement.key || '');

    var that = this;
    advertisement.axon_type = 'req';

    this.advertisement = advertisement;

    var d = that.discovery = Discovery(advertisement, discoveryOptions),
        statusInterval = discoveryOptions && discoveryOptions.statusInterval || 5000;

    this.sock = new axon.ReqSocket();
    this.sock.set('retry timeout', 0);

    d.on('added', function(obj) {
        var adv = obj.advertisement;

        if (adv.type == 'monitor' && (adv.key ? adv.key == advertisement.key : true)) {
            var statusPublisher = new axon.PubEmitterSocket();
            statusPublisher.connect(adv.port, Requester.useHostNames ? obj.hostName : obj.address);

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

        if (adv.axon_type != 'rep') return;
        if (advertisement.namespace != adv.namespace) return;

        that.sock.connect(adv.port, Requester.useHostNames ? obj.hostName : obj.address);
    });
};
util.inherits(Requester, EventEmitter);


Requester.prototype.send = function(...args) {
    if (args.length == 1 || typeof args[args.length - 1] != 'function') {
        return new Promise((resolve, reject) => {
            if (!this.sock) return reject(new Error('No socket found'));

            this.sock.send(...args, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    if (!this.sock) return;

    this.sock.send(...args);
};


Requester.prototype.close = function() {
    if (this.discovery) {
        this.discovery.stop();

        this.discovery.broadcast &&
            this.discovery.broadcast.socket &&
            this.discovery.broadcast.socket.close();
    }

    this.sock && this.sock.close();
};


Requester.environment = '';


Requester.setEnvironment = function(environment) {
    Requester.environment = environment + ':';
};


module.exports = Requester;
