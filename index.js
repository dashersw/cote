var Discovery = require('./lib/Discovery'),
    Requester = require('./lib/Requester.js'),
    Responder = require('./lib/Responder.js'),
    Publisher = require('./lib/Publisher.js'),
    Subscriber = require('./lib/Subscriber.js'),
    Sockend = require('./lib/Sockend.js'),
    Monitor = require('./lib/Monitor.js'),
    TimeBalancedRequester = require('./lib/TimeBalancedRequester.js'),
    PendingBalancedRequester = require('./lib/PendingBalancedRequester.js');

function cote(discoveryOptions) {
    Discovery.setDefaults(discoveryOptions);

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

module.exports = cote;
