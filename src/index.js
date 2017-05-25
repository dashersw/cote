var Discovery = require('./components/Discovery'),
    Requester = require('./components/Requester.js'),
    Responder = require('./components/Responder.js'),
    Publisher = require('./components/Publisher.js'),
    Subscriber = require('./components/Subscriber.js'),
    Sockend = require('./components/Sockend.js'),
    Monitor = require('./components/Monitor.js'),
    MonitoringTool = require('./monitoring-tool'),
    TimeBalancedRequester = require('./components/TimeBalancedRequester.js'),
    PendingBalancedRequester = require('./components/PendingBalancedRequester.js');

var _ = require('lodash');

function cote(options) {
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
        broadcast: process.env.COTE_BROADCAST_ADDRESS ||
            (process.env.DOCKERCLOUD_IP_ADDRESS ? '10.7.255.255' : undefined),
        multicast: process.env.COTE_MULTICAST_ADDRESS
    };

    _.defaults(options, environmentSettings, defaults);

    var components = [Requester, Responder, Publisher, Subscriber, Sockend, TimeBalancedRequester,
        PendingBalancedRequester];

    components.forEach(function(component) {
        component.setEnvironment(options.environment);
        component.setUseHostNames && component.setUseHostNames(options.useHostNames);
    });

    Discovery.setDefaults(options);

    return cote;
}

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