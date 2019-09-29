const parser = {
    bool: (v) => v.toLowerCase() == 'true', // node always converts process.env values to string, so no need to check
    // for type: https://nodejs.org/api/process.html#process_process_env
    int: (v) => parseInt(v, 10), // see above for skipping type checks
    str: (v) => v,
    exists: (v) => !!v,
};

const defaultOptions = {
    environment: '',
    useHostNames: false,
    broadcast: null,
    multicast: null,
    logUnknownEvents: true,
};

const envVarOptionsMap = {
    COTE_ENV: ['environment', parser.str],
    COTE_USE_HOST_NAMES: ['useHostNames', parser.exists],
    COTE_MULTICAST_ADDRESS: ['multicast', parser.str],
    COTE_CHECK_INTERVAL: ['checkInterval', parser.int],
    COTE_HELLO_INTERVAL: ['helloInterval', parser.int],
    COTE_HELLO_LOGS_ENABLED: ['helloLogsEnabled', parser.bool],
    COTE_STATUS_LOGS_ENABLED: ['statusLogsEnabled', parser.bool],
    COTE_LOG: ['log', parser.bool],
    COTE_LOG_UNKNOWN_EVENTS: ['logUnknownEvents', parser.bool],
    COTE_NODE_TIMEOUT: ['nodeTimeout', parser.int],
    COTE_IGNORE_PROCESS: ['ignoreProcess', parser.bool],
};

module.exports = (options) => {
    const environmentSettings = {};

    Object.entries(envVarOptionsMap).forEach(([envVar, [setting, parser]]) => {
        if (!(envVar in process.env)) return;

        const value = process.env[envVar];

        environmentSettings[setting] = parser(value);
    });

    if (!process.env.COTE_BROADCAST_ADDRESS && process.env.DOCKERCLOUD_IP_ADDRESS) {
        environmentSettings.broadcast = '10.7.255.255';
    }

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

    return { ...defaultOptions, ...environmentSettings, ...options };
};
