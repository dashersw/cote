const Discover = require('node-discover');
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

    this.me.processId = this.broadcast.processUuid;
    this.me.processCommand = process.argv.slice(1).map((n) => {
      return n.split('/').slice(-2).join('/');
    }).join(' ');

    options.log && this.log(this.helloLogger());

    this.on('added', function(obj) {
      if (!options.monitor && !_.isEqual(obj.advertisement.key, advertisement.key)) return;
      options.log && options.helloLogsEnabled && this.log(this.statusLogger('online'));
    });

    this.on('removed', function(obj) {
      if (!options.monitor && !_.isEqual(obj.advertisement.key, advertisement.key)) return;
      options.log && options.statusLogsEnabled && this.log(this.statusLogger('offline'));
    });

    // BIND ALL METHODS
    this.setDefaults = this.log.bind(this);
    this.log = this.log.bind(this);
    this.helloLogger = this.helloLogger.bind(this);
    this.statusLogger = this.statusLogger.bind(this);

  }

  static setDefaults(options) {

    this.defaults = options;

  }

  log(logs) {

    console.log.apply(console.log, logs);

  }

  helloLogger() {

    return _.concat('\nHello! I\'m'.white, this.statusLogger(), '\n========================\n'.white);

  }

  statusLogger(status) {

    const logs = [];

    if (status) {
      const statusLog = _.isEqual(status, 'online') ? '.online'.green : '.offline'.red;
      logs.push(this.advertisement.type.magenta + statusLog);
    }

    logs.push(`${this.advertisement.name.white} ${' #'.grey}${this.broadcast.instanceUuid.grey}`);

    if (this.advertisement.port) {
      logs.push('on', this.advertisement.port.toString().blue);
    }

    return logs;

  }

}

module.exports = Discovery;
