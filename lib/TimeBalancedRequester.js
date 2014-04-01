var util = require('util'),
    Requester = require('./Requester');

var TimeBalancedRequester = function(advertisement, discoveryOptions) {
    Requester.call(this, advertisement, discoveryOptions);
    this.responseTimes = [];
    this.requestId = 0;
    this.callbacks = [];
    this.MAX_REQUESTS = 50;
};
util.inherits(TimeBalancedRequester, Requester);

TimeBalancedRequester.prototype.send = function() {
    var that = this;
    var args = Array.prototype.slice.call(arguments);
    var sent = new Date();
    var id = this.requestId++;

    var hasCallback = 'function' == typeof args[args.length - 1];
    if (hasCallback)
        this.callbacks[id] = args.pop();

    var index = 0;
    if (this.sock && this.sock.socks) {
        var socks = this.sock.socks;
        var len = socks.length;
        var minAvgResponseTime = Number.MAX_VALUE;
        var minIndex = 0, average = 0;

        if (len > 0 && this.responseTimes.length == len) { //have data for all sockets
            this.responseTimes.forEach(function(item, index) { //find the minimum average response time
                average = item.reduce(function(i, v) {
                    return i + v;
                }, 0) / item.length;

                if (average < minAvgResponseTime) {
                    minAvgResponseTime = average;
                    minIndex = index;
                }
            });

            // explore other servers every once in a while
            if (id % this.MAX_REQUESTS == 0)
                minIndex = Math.floor(Math.random() * len);

        } else if (len != 0) { //there is a new socket to be explored use it
            minIndex = len - 1;
        };

        this.sock.n = (minIndex % len) || 0; //select the socket to be used
        index = this.sock.n; //save the index of selected socket
    }

    var cb = function(res) {
        var lastRequests = that.responseTimes[index];
        if (!lastRequests) lastRequests = that.responseTimes[index] = []; //create if this is the first response for that index
        if (lastRequests.length == that.MAX_REQUESTS && lastRequests.length > 0)
            lastRequests.shift(); // cap the last requests at MAX_REQUESTS.

        lastRequests.push(new Date() - sent); //save response time

        if (!that.callbacks[id]) return; //missing callback
        that.callbacks[id](res);
        delete that.callbacks[id];
    };

    args.push(cb);
    this.sock && this.sock.send.apply(this.sock, args);
};


TimeBalancedRequester.prototype.close = function() {
    if (this.discovery) {
        this.discovery.stop();

        this.discovery.broadcast &&
            this.discovery.broadcast.socket &&
            this.discovery.broadcast.socket.close();
    }
};

module.exports = TimeBalancedRequester;
