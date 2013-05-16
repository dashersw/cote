var Discover = require('node-discover'),
    colors = require('colors');

var Discovery = function(advertisement, discoveryOptions) {
    discoveryOptions = discoveryOptions || {};

    discoveryOptions.helloInterval = discoveryOptions.helloInterval || 2000;
    discoveryOptions.checkInterval = discoveryOptions.checkInterval || 4000;
    discoveryOptions.nodeTimeout = discoveryOptions.nodeTimeout || 5000;
    discoveryOptions.masterTimeout = discoveryOptions.masterTimeout || 6000;

    var d = new Discover(discoveryOptions);
    advertisement.type = advertisement.type || 'service';

    d.advertise(advertisement);

    log(helloLogger(d));

    d.on('added', function(obj) {
        if (obj.advertisement.key != advertisement.key) return;

        log(statusLogger(obj, 'online'));
    });

    d.on('removed', function(obj) {
        if (obj.advertisement.key != advertisement.key) return;

        log(statusLogger(obj, 'offline'));
    });

    return d;
};

var helloLogger = function(d) {
    var adv = d.me,
        log = [];

    d.me.id = d.broadcast.instanceUuid;

    log.push('\nHello! I\'m'.white);
    log = log.concat(statusLogger(adv));
    log.push('\n========================\n'.white);

    return log;
};

var statusLogger = function(obj, config) {
    var adv = obj.advertisement,
        log = [],
        status;

    switch (config) {
        case 'online':
            status = '.online'.green;
            break;
        case 'offline':
            status = '.offline'.red;
            break;
    }

    if (status)
        log.push(adv.type.magenta + status)

    log.push(adv.name.white + '#'.grey + obj.id.grey);

    if (adv.port)
        log.push('on', adv.port.toString().blue);

    return log;
};

var log = function(log) {
    console.log.apply(console.log, log);
};

module.exports = Discovery;
