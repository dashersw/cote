var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon');

var Subscriber = function(advertisement) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 200 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    advertisement.axon_type = 'sub-emitter';

    var that = this,
        d = Discovery(advertisement);

    d.on('added', function(obj) {
        that.emit('added', obj);

        var adv = obj.advertisement;
        if (adv.axon_type != 'pub-emitter') return;

        obj.sock = new axon.SubEmitterSocket();
        obj.sock.connect(adv.port);

        advertisement.subscribesTo.forEach(function(eventName) {
            obj.sock.on(eventName, function(data) {
                that.emit(eventName, data);
            });
        });
    });

    d.on('removed', function(obj) {
        obj.sock && obj.sock.close();
        that.emit('removed', obj);
    });
};
util.inherits(Subscriber, EventEmitter);

module.exports = Subscriber;
