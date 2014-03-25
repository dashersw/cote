var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon'),
    portfinder = require('portfinder');

var Requester = function(advertisement, discoveryOptions) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    var that = this;

    portfinder.getPort(function(err, port) {
        advertisement.axon_type = 'req';
        advertisement.port = +port;
        that.advertisement = advertisement;

        var d = that.discovery = Discovery(advertisement, discoveryOptions);

        that.sock = new axon.ReqSocket();
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
util.inherits(Requester, EventEmitter);


Requester.prototype.send = function() {
    var args = Array.prototype.slice.call(arguments);

    this.sock && this.sock.send.apply(this.sock, args);
};


Requester.prototype.close = function() {
    if (this.discovery) {
        this.discovery.stop();

        this.discovery.broadcast &&
            this.discovery.broadcast.socket &&
            this.discovery.broadcast.socket.close();
    }
};


module.exports = Requester;
