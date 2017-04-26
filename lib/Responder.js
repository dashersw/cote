var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('@dashersw/axon'),
    portfinder = require('portfinder');

var Responder = function(advertisement, discoveryOptions) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    if (!advertisement.key || advertisement.key && advertisement.key.indexOf('$$') == -1)
        advertisement.key = Responder.environment + '$$' + (advertisement.key || '');

    advertisement.axon_type = 'rep';
    this.advertisement = advertisement;

    var that = this;
    var host = discoveryOptions && discoveryOptions.address || '0.0.0.0';

    portfinder.getPort({host: host, port: advertisement.port}, onPort);

    function onPort(err, port) {
        advertisement.port = +port;

        var d = that.discovery = Discovery(advertisement, discoveryOptions);

        that.sock = new axon.RepSocket();
        that.sock.bind(port);
        that.sock.server.on('error', function(err) {
            if (err.code != 'EADDRINUSE') throw err;

            portfinder.getPort({host: host, port: advertisement.port}, onPort);
        });

        that.sock.on('bind', function() {
            that.emit('ready', that.sock);
        });

        that.sock.on('message', function(req, cb) {
            if (!req.type) return;

            that.emit(req.type, req, cb);
        });

    }
};
util.inherits(Responder, EventEmitter);


Responder.prototype.close = function() {
    if (this.discovery) {
        this.discovery.stop();

        this.discovery.broadcast &&
            this.discovery.broadcast.socket &&
            this.discovery.broadcast.socket.close();
    }

    this.sock && this.sock.close();
};


Responder.environment = '';


Responder.setEnvironment = function(environment) {
    Responder.environment = environment + ':';
};


Responder.useHostNames = false;


Responder.setUseHostNames = function(useHostNames) {
    Responder.useHostNames = useHostNames;
};


module.exports = Responder;
