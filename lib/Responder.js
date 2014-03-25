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

    advertisement.axon_type = 'rep';
    this.advertisement = advertisement;

    var that = this,
        d = that.discovery = Discovery(advertisement, discoveryOptions);

    d.on('added', function(obj) {
        if (obj.advertisement.key != advertisement.key) return;

        that.emit('added', obj);

        var adv = obj.advertisement;

        if (adv.axon_type != 'req') return;
        if (advertisement.namespace != adv.namespace) return;

        obj.sock = new axon.RepSocket();
        obj.sock.connect(adv.port);
        obj.sock.set('retry timeout', 0);

        obj.sock.on('message', function(req, cb) {
            if (!req.type) return;

            that.emit(req.type, req, cb);
        });
    });

    d.on('removed', function(obj) {
        obj.sock && obj.sock.close();
        that.emit('removed', obj);
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


module.exports = Responder;
