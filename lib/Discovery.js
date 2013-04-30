var Discover = require('node-discover'),
    colors = require('colors');

var Discovery = function(advertisement) {
    var d = new Discover();
    advertisement.type = advertisement.type || 'service';

    d.advertise(advertisement);

    log(helloLogger(d));

    d.on('added', function(obj) {
        log(statusLogger(obj, 'online'));
    });

    d.on('removed', function(obj) {
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
