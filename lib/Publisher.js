var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon'),
    portfinder = require('portfinder');

var Publisher = function(advertisement) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 200 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    var that = this;

    portfinder.getPort(function(err, port) {
        advertisement.axon_type = 'pub-emitter';
        advertisement.port = +port;

        var d = Discovery(advertisement);

        that.sock = new axon.PubEmitterSocket();
        that.sock.bind(port);

        that.emit('ready', that.sock);

        d.on('added', function(obj) {
            that.emit('added', obj);
        });

        d.on('removed', function(obj) {
            that.emit('removed', obj);
        });
    });
};
util.inherits(Publisher, EventEmitter);

module.exports = Publisher;
