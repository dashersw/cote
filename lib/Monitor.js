var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon'),
    portfinder = require('portfinder'),
    _ = require('lodash'),
    charm = require('charm')();



var Monitor = function(advertisement, discoveryOptions) {
    discoveryOptions = discoveryOptions || {};

    _.defaults(discoveryOptions, {
        monitor: true,
        log: false
    });

    var interval = discoveryOptions.interval || 1000;

    var d = this.discovery = Discovery(advertisement, discoveryOptions);

    charm.pipe(process.stdout);
    charm.reset().erase('screen').position(0,0).
        write('                                                                                    ');

    (function draw() {
        charm.erase('screen');
        var index = 3;
        charm.position(0, 2);
        charm.foreground('green').
            write('Name').move(16).
            write('id').move(33).
            write('Address').move(11).
            write('Port');

        charm.erase('down');

        d.eachNode(function(node) {
            var port = node.advertisement.port || '----';
            port += '';
            charm.position(0, index).foreground('cyan').
                write(node.advertisement.name.slice(0, 20)).move(20 - node.advertisement.name.length, 0).
                foreground('magenta').write(node.id).move(3, 0).
                foreground('yellow').write(node.address).move(3, 0).
                foreground('red').write(port);
            index++;
        });

        charm.position(0,1);

        setTimeout(draw, interval);
    })();
};
util.inherits(Monitor, EventEmitter);


module.exports = Monitor;
