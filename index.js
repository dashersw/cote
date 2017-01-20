var Discovery = require('./lib/Discovery'),
    Requester = require('./lib/Requester.js'),
    Responder = require('./lib/Responder.js'),
    Publisher = require('./lib/Publisher.js'),
    Subscriber = require('./lib/Subscriber.js'),
    Sockend = require('./lib/Sockend.js'),
    Monitor = require('./lib/Monitor.js'),
    TimeBalancedRequester = require('./lib/TimeBalancedRequester.js'),
    PendingBalancedRequester = require('./lib/PendingBalancedRequester.js');

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
cote.TimeBalancedRequester = TimeBalancedRequester;
cote.PendingBalancedRequester = PendingBalancedRequester;

module.exports = cote();
