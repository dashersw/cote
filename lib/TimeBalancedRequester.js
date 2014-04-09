var util = require('util'),
    Requester = require('./Requester');

var TimeBalancedRequester = function(advertisement, discoveryOptions) {
    Requester.call(this, advertisement, discoveryOptions);
    this.responseTimes = {};
    this.timers = {};
    this.requestId = 0;
    this.callbacks = {};
    this.MAX_REQUESTS = 50;
    this.TIMEOUT = 10000;

    // neglect requests from calculation that took longer then the given timeout
    var that = this;
    setInterval(function(){
        var index, id, now = new Date();
        for (index in that.responseTimes) {
            for (id in that.responseTimes[index]) {
                if (now - that.responseTimes[index][id].sent > that.TIMEOUT) {
                    if (that.timers[id]) clearInterval(that.timers[id]); //if the response is lost, don't leave garbage
                    delete that.responseTimes[index][id];
                }
            }
        }
    }, 100);

    // helper function to get size of value objects
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
};
util.inherits(TimeBalancedRequester, Requester);

TimeBalancedRequester.prototype.send = function() {
    var that = this;
    var args = Array.prototype.slice.call(arguments);
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

        if (len > 0 && Object.size(this.responseTimes) == len) { //have data for all sockets
            for (index in this.responseTimes) {
                var item = this.responseTimes[index];
                var totalTime = 0, request;
                for (request in item) {
                    var time = item[request].time;
                    totalTime += time;
                }
                average = totalTime / Object.size(item) || 0;

                if (average < minAvgResponseTime) {
                    minAvgResponseTime = average;
                    minIndex = index;
                }
            }

            // explore other servers every once in a while
            if (id % this.MAX_REQUESTS == 0)
                minIndex = Math.floor(Math.random() * len);

        } else if (len != 0) { //there is a new socket to be explored use it
            minIndex = len - 1;
        };

        this.sock.n = (minIndex % len) || 0; //select the socket to be used
        index = this.sock.n; //save the index of selected socket
    }

    var cb = function(err, res) {
        var lastRequests = that.responseTimes[index];
        if (lastRequests[id])
            lastRequests[id].time = (new Date() - lastRequests[id].sent); //save response time
        clearInterval(that.timers[id]); //clear timers for that request
        delete that.timers[id];

        if (!that.callbacks[id]) return; //missing callback
        that.callbacks[id](res);
        delete that.callbacks[id];
    };

    if (!this.responseTimes[index]) this.responseTimes[index] = {}; //create if this is the first request for that index
    this.responseTimes[index][id] = { // create a container object
        time: 0,
        sent: new Date()
    };

    // increment responseTime of that request every 0.5 seconds
    this.timers[id] = setInterval(function(){
        var lastRequests = that.responseTimes[index];
        if (lastRequests[id]) lastRequests[id].time += 500;
    }, 500);

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
