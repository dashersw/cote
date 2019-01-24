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

const optionsBuilder = require('./options-builder');

const cote = (options = {}) => {
    options = optionsBuilder(options);

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
