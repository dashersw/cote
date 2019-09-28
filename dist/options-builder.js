"use strict";

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.object.entries");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const parser = {
  bool: v => v.toLowerCase() == 'true',
  // node always converts process.env values to string, so no need to check
  // for type: https://nodejs.org/api/process.html#process_process_env
  int: v => parseInt(v, 10),
  // see above for skipping type checks
  str: v => v,
  exists: v => !!v
};
const defaultOptions = {
  environment: '',
  useHostNames: false,
  broadcast: null,
  multicast: null
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
  COTE_IGNORE_PROCESS: ['ignoreProcess', parser.bool]
};

module.exports = options => {
  const environmentSettings = {};
  Object.entries(envVarOptionsMap).forEach(([envVar, [setting, parser]]) => {
    if (!(envVar in process.env)) return;
    const value = process.env[envVar];
    environmentSettings[setting] = parser(value);
  });

  if (!process.env.COTE_BROADCAST_ADDRESS && process.env.DOCKERCLOUD_IP_ADDRESS) {
    environmentSettings.broadcast = '10.7.255.255';
  }

  const keys = Object.keys(process.env).filter(k => k.slice(0, 15) == 'COTE_DISCOVERY_');
  keys.forEach(k => {
    const keyName = k.slice(15);
    const keyArray = keyName.split('_').map(k => k.toLowerCase());
    const pluginName = keyArray.shift();
    const pluginObj = environmentSettings[pluginName] = environmentSettings[pluginName] || {};
    keyArray.forEach(k => {
      pluginObj[k] = process.env[`COTE_DISCOVERY_${pluginName.toUpperCase()}_${k.toUpperCase()}`];
    }); // Discovery plugins (such as redis) may not have access to real IP addresses.
    // Therefore we automatically default to `true` for `COTE_USE_HOST_NAMES`,
    // since host names are accurate.

    environmentSettings.useHostNames = true;
  });
  return _objectSpread({}, defaultOptions, {}, environmentSettings, {}, options);
};
//# sourceMappingURL=options-builder.js.map