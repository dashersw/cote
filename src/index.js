const Discovery = require('./components/discovery');
const Requester = require('./components/requester');
const Responder = require('./components/responder');
const Publisher = require('./components/publisher');
const Subscriber = require('./components/subscriber');
const Sockend = require('./components/sockend');
const Monitor = require('./components/monitor');
const MonitoringTool = require('./monitoring-tool');
const TimeBalancedRequester = require('./components/time-balanced-requester');
const PendingBalancedRequester = require('./components/pending-balanced-requester');

const parser = require('../lib/env-var-parser');

const defaultOptions = {
    environment: '',
    useHostNames: false,
    broadcast: null,
    multicast: null,
};

const cote = (options = {}) => {
    const environmentSettings = {
        environment: process.env.COTE_ENV,
        useHostNames: !!process.env.COTE_USE_HOST_NAMES,
        broadcast: process.env.COTE_BROADCAST_ADDRESS ||
        (process.env.DOCKERCLOUD_IP_ADDRESS ? '10.7.255.255' : undefined),
        multicast: process.env.COTE_MULTICAST_ADDRESS,
        checkInterval: parser.int(process.env.COTE_CHECK_INTERVAL),
        helloInterval: parser.int(process.env.COTE_HELLO_INTERVAL),
        helloLogsEnabled: parser.bool(process.env.COTE_HELLO_LOGS_ENABLED),
        statusLogsEnabled: parser.bool(process.env.COTE_STATUS_LOGS_ENABLED),
        log: parser.bool(process.env.COTE_LOG),
        nodeTimeout: parser.int(process.env.COTE_NODE_TIMEOUT),
    };

    const keys = Object.keys(process.env).filter((k) => k.slice(0, 15) == 'COTE_DISCOVERY_');

    keys.forEach((k) => {
        const keyName = k.slice(15);
        const keyArray = keyName.split('_').map((k) => k.toLowerCase());
        const pluginName = keyArray.shift();

        const pluginObj = environmentSettings[pluginName] = environmentSettings[pluginName] || {};

        keyArray.forEach((k) => {
            pluginObj[k] = process.env[`COTE_DISCOVERY_${pluginName.toUpperCase()}_${k.toUpperCase()}`];
        });

        // Discovery plugins (such as redis) may not have access to real IP addresses.
        // Therefore we automatically default to `true` for `COTE_USE_HOST_NAMES`,
        // since host names are accurate.
        environmentSettings.useHostNames = true;
    });

    options = { ...defaultOptions, ...environmentSettings, ...options };

    Discovery.setDefaults(options);

    const components = [
        Requester,
        Responder,
        Publisher,
        Subscriber,
        Sockend,
        TimeBalancedRequester,
        PendingBalancedRequester,
    ];

    components.forEach(function(component) {
        component.setEnvironment(options.environment);
        component.setUseHostNames &&
            component.setUseHostNames(options.useHostNames);
    });

    return cote;
};

cote.Requester = Requester;
cote.Responder = Responder;
cote.Publisher = Publisher;
cote.Subscriber = Subscriber;
cote.Sockend = Sockend;
cote.Monitor = Monitor;
cote.MonitoringTool = MonitoringTool;
cote.TimeBalancedRequester = TimeBalancedRequester;
cote.PendingBalancedRequester = PendingBalancedRequester;

module.exports = cote();
