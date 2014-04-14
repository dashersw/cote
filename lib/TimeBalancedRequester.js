var util = require('util'),
    Requester = require('./Requester'),
    _ = require('lodash'),
    uuid = require('node-uuid');

var TimeBalancedRequester = function(advertisement, discoveryOptions) {
    Requester.call(this, advertisement, discoveryOptions);
    this.responders = {};
    this.timers = {};
    this.requestId = 0;
    this.callbacks = {};
    this.MAX_REQUESTS = 50;
    this.CALCULATION_TIMEOUT = 10000;
    this.SAMPLE_INTERVAL = 100;

    // neglect requests from calculation that took longer then the given timeout
    var that = this;
    setInterval(function() {
        var index, id, now = new Date();
        for (index in that.responders) {
            for (id in that.responders[index]) {
                if (now - that.responders[index][id].sent > that.CALCULATION_TIMEOUT) {
                    if (that.timers[id]) clearInterval(that.timers[id]); //if the response is lost, don't leave garbage
                    delete that.responders[index][id];
                }
            }
        }
    }, this.SAMPLE_INTERVAL);

    // clear all gathered data when a socket disconnects
    this.on('ready', function(sock) {
        sock.on('disconnect', function(sock) {
            if (sock.uuid) {
                var responder = that.responders[sock.uuid],
                    id;
                for (id in responder) { //clear timers and callbacks for the disconnected socket
                    clearInterval(that.timers[id]);
                    delete that.timers[id];
                    that.callbacks[id] && delete that.callbacks[id];
                }
                delete that.responders[sock.uuid];
            }
        });
    });
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

        if (len > 0 && _.size(this.responders) == len) { //have data for all sockets
            for (index in this.responders) {
                var item = this.responders[index];
                var totalTime = 0, request;
                for (request in item) {
                    var time = item[request].time;
                    totalTime += time;
                }
                average = totalTime / _.size(item) || 0;

                if (average < minAvgResponseTime) {
                    minAvgResponseTime = average;
                    minIndex = index;
                }
            }

            minIndex = _.findIndex(socks, {uuid: minIndex});

            // explore other servers every once in a while
            if (id % this.MAX_REQUESTS == 0)
                minIndex = Math.floor(Math.random() * len);

        } else if (len != 0) { //there is a new socket to be explored use it
            minIndex = len - 1;
        };

        var n = this.sock.n = (minIndex % len) || 0; //select the socket to be used
        if (socks[n] && typeof socks[n].uuid == "undefined")
            socks[n].uuid = uuid.v4(); // assign a unique identifier to that socket

        index = (socks[n] && socks[n].uuid) || 0; //save the index of selected socket
    }

    var cb = function(err, res) {
        var lastRequests = that.responders[index];
        if (lastRequests && lastRequests[id])
            lastRequests[id].time = (new Date() - lastRequests[id].sent); //save response time
        clearInterval(that.timers[id]); //clear timers for that request
        delete that.timers[id];

        if (!that.callbacks[id]) return; //missing callback
        that.callbacks[id](res);
        delete that.callbacks[id];
    };

    args.push(cb);
    this.sock && this.sock.send.apply(this.sock, args); //send request to socket

    if (index == 0) return; // this request is queued

    if (!this.responders[index]) this.responders[index] = {}; //create if this is the first request for that index
    this.responders[index][id] = { // create a container object
        time: 0,
        sent: new Date()
    };

    // increment responseTime of that request every 0.1 seconds
    this.timers[id] = setInterval(function() {
        var lastRequests = that.responders[index];
        if (lastRequests[id]) lastRequests[id].time += that.SAMPLE_INTERVAL;
    }, this.SAMPLE_INTERVAL);
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
