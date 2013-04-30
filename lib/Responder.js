var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon');

var Responder = function(advertisement) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 200 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    advertisement.axon_type = 'rep';
    this.advertisement = advertisement;

    var that = this,
        d = Discovery(advertisement);

    d.on('added', function(obj) {
        that.emit('added', obj);

        var adv = obj.advertisement;

        if (adv.axon_type != 'req') return;

        obj.sock = new axon.RepSocket();
        obj.sock.format('json');
        obj.sock.connect(adv.port);
        obj.sock.on('message', function(req, cb) {
            that.emit(req.type, req, cb);
        });
    });

    d.on('removed', function(obj) {
        obj.sock && obj.sock.close();
        that.emit('removed', obj);
    });
};
util.inherits(Responder, EventEmitter);

module.exports = Responder;
