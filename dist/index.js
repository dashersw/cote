'use strict';

var Discovery = require('./components/discovery');
var Requester = require('./components/requester');
var Responder = require('./components/responder');
var Publisher = require('./components/publisher');
var Subscriber = require('./components/subscriber');
var Sockend = require('./components/sockend');
var Monitor = require('./components/monitor');
var MonitoringTool = require('./monitoring-tool');
var TimeBalancedRequester = require('./components/time-balanced-requester');
var PendingBalancedRequester = require('./components/pending-balanced-requester');

var _ = require('lodash');

var cote = function cote(options) {
    options = options || {};

    var defaults = {
        environment: '',
        useHostNames: false,
        broadcast: null,
        multicast: null
    };

    var environmentSettings = {
        environment: process.env.COTE_ENV,
        useHostNames: !!process.env.COTE_USE_HOST_NAMES,
        broadcast: process.env.COTE_BROADCAST_ADDRESS || (process.env.DOCKERCLOUD_IP_ADDRESS ? '10.7.255.255' : undefined),
        multicast: process.env.COTE_MULTICAST_ADDRESS
    };

    var keys = Object.keys(process.env).filter(function (k) {
        return k.slice(0, 15) == 'COTE_DISCOVERY_';
    });

    keys.forEach(function (k) {
        var keyName = k.slice(15);
        var keyArray = keyName.split('_').map(function (k) {
            return k.toLowerCase();
        });
        var pluginName = keyArray.shift();

        var pluginObj = environmentSettings[pluginName] = environmentSettings[pluginName] || {};

        keyArray.forEach(function (k) {
            pluginObj[k] = process.env['COTE_DISCOVERY_' + pluginName.toUpperCase() + '_' + k.toUpperCase()];
        });

        // Discovery plugins (such as redis) may not have access to real IP addresses.
        // Therefore we automatically default to `true` for `COTE_USE_HOST_NAMES`,
        // since host names are accurate.
        environmentSettings.useHostNames = true;
    });

    _.defaults(options, environmentSettings, defaults);

    Discovery.setDefaults(options);

    var components = [Requester, Responder, Publisher, Subscriber, Sockend, TimeBalancedRequester, PendingBalancedRequester];

    components.forEach(function (component) {
        component.setEnvironment(options.environment);
        component.setUseHostNames && component.setUseHostNames(options.useHostNames);
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
//# sourceMappingURL=index.js.map