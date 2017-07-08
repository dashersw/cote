const Discover = require('@dashersw/node-discover');
const colors = require('colors');
const _ = require('lodash');

class Discovery extends Discover {
    constructor(advertisement, options = {}) {
        _.defaults(options, Discovery.defaults, {
            helloInterval: 2000,
            checkInterval: 4000,
            nodeTimeout: 5000,
            masterTimeout: 6000,
            monitor: false,
            log: true,
            helloLogsEnabled: true,
            statusLogsEnabled: true,
            ignoreProcess: false,
        });

        super(options);

        this.advertisement = _.defaults(advertisement, {
            type: 'service',
        });

        this.advertise(advertisement);

        this.me.id = this.broadcast.instanceUuid;
        this.me.processId = this.broadcast.processUuid;
        this.me.processCommand = process.argv.slice(1).map((n) => {
            return n.split('/').slice(-2).join('/');
        }).join(' ');

        options.log && this.log(this.helloLogger());

        this.on('added', (obj) => {
            if (!options.monitor && obj.advertisement.key != this.advertisement.key) return;

            options.log && options.statusLogsEnabled && options.helloLogsEnabled &&
                this.log(this.statusLogger(obj, 'online'));
        });

        this.on('removed', (obj) => {
            if (!options.monitor && obj.advertisement.key != this.advertisement.key) return;

            options.log && options.statusLogsEnabled &&
                this.log(this.statusLogger(obj, 'offline'));
        });
    }

    static setDefaults(options) {
        this.defaults = options;
    }

    log(logs) {
        console.log.apply(console.log, logs);
    }

    helloLogger() {
        return _.concat('\nHello! I\'m'.white, this.statusLogger(this.me),
            '\n========================\n'.white);
    }

    statusLogger(obj, status) {
        const logs = [];

        if (status) {
            const statusLog = status == 'online' ? '.online'.green : '.offline'.red;
            logs.push(this.advertisement.name, '>', obj.advertisement.type.magenta + statusLog);
        } else {
            logs.push();
        }

        logs.push(
            `${obj.advertisement.name.white}${'#'.grey}${obj.id.grey}`);

        if (obj.advertisement.port) {
            logs.push('on', obj.advertisement.port.toString().blue);
        }

        return logs;
    }

}

module.exports = Discovery;
