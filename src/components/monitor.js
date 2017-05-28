let EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./discovery'),
    axon = require('@dashersw/axon'),
    portfinder = require('portfinder'),
    _ = require('lodash'),
    charm = require('charm')();


let Monitor = function(advertisement, discoveryOptions) {
    discoveryOptions = discoveryOptions || {};

    _.defaults(discoveryOptions, {
        monitor: true,
        log: false,
    });

    advertisement.type = 'monitor';
    advertisement.key = Monitor.environment + (advertisement.key || '');

    let that = this,
        d = this.discovery = new Discovery(advertisement, discoveryOptions),
        host = discoveryOptions && discoveryOptions.address || '0.0.0.0',
        interval = discoveryOptions.interval || 5000;

    portfinder.getPort({ host: host, port: advertisement.port }, onPort);

    function onPort(err, port) {
        advertisement.port = +port;

        let sub = new axon.SubEmitterSocket(port);
        sub.bind(port);

        sub.sock.server.on('error', function(err) {
            if (err.code != 'EADDRINUSE') throw err;

            portfinder.getPort({ host: host, port: advertisement.port }, onPort);
        });

        sub.sock.on('bind', function() {
            sub.on('status', function(status) {
                that.emit('status', status);
            });
        });
    }

    if (discoveryOptions.disableScreen) return;

    charm.pipe(process.stdout);
    charm.reset().erase('screen').position(0, 0).
        write('                                                                                    ');

    (function draw() {
        charm.erase('screen');
        let index = 3;
        charm.position(0, 2);
        charm.foreground('green').
            write('Name').move(16).
            write('id').move(37).
            write('Address').move(11).
            write('Port');

        charm.erase('down');

        d.eachNode(function(node) {
            let port = node.advertisement.port || '----';
            port += '';
            charm.position(0, index).foreground('cyan').
                write(node.advertisement.name.slice(0, 20)).move(20 - node.advertisement.name.length, 0).
                foreground('magenta').write(node.id).move(3, 0).
                foreground('yellow').write(node.address).move(3, 0).
                foreground('red').write(port);
            index++;
        });

        charm.position(0, 1);

        setTimeout(draw, interval);
    })();
};
util.inherits(Monitor, EventEmitter);


Monitor.environment = '';


Monitor.setEnvironment = function(environment) {
    Monitor.environment = environment + ':';
};


module.exports = Monitor;
