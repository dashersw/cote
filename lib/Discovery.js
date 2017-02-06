import Discover from 'node-discover';
import colors from 'colors';
import _ from 'lodash';

class Discovery {
    constructor(advertisement, discoveryOptions) {
        this.options = discoveryOptions || {};


        _.defaults(this.options, Discovery.defaults, {
            helloInterval: 2000,
            checkInterval: 4000,
            nodeTimeout: 5000,
            masterTimeout: 6000,
            monitor: false,
            log: true,
            helloLogsEnabled: true,
            statusLogsEnabled: true,
            ignoreProcess: false
        });

        _.defaults(advertisement, {
            type: 'service'
        });

        const that = this;
        const d = new Discover(this.options);

        d.advertise(advertisement);

        this.options.log && log(helloLogger(d));

        d.on('added', obj => {
            if (!that.options.monitor && obj.advertisement.key != advertisement.key) return;

            that.options.log && that.options.helloLogsEnabled && log(statusLogger(obj, 'online'));
        });

        d.on('removed', obj => {
            if (!that.options.monitor && obj.advertisement.key != advertisement.key) return;

            that.options.log && that.options.statusLogsEnabled && log(statusLogger(obj, 'offline'));
        });

        return d;
    }

    static setDefaults(options) {
        Discovery.defaults = options;
    }
}

var helloLogger = d => {
    const adv = d.me;
    let log = [];

    d.me.id = d.broadcast.instanceUuid;

    log.push('\nHello! I\'m'.white);
    log = log.concat(statusLogger(adv));
    log.push('\n========================\n'.white);

    return log;
};

var statusLogger = (obj, config) => {
    const adv = obj.advertisement;
    const log = [];
    let status;

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

var log = log => {
    console.log.apply(console.log, log);
};

export default Discovery;
