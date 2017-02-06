import util from 'util';
import Requester from './Requester';
import _ from 'lodash';
import uuid from 'node-uuid';

class TimeBalancedRequester extends Requester {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        advertisement.key = TimeBalancedRequester.environment + (advertisement.key || '');

        this.responders = {};
        this.timers = {};
        this.requestId = 0;
        this.callbacks = {};
        this.MAX_REQUESTS = 50;
        this.CALCULATION_TIMEOUT = 10000;
        this.SAMPLE_INTERVAL = 100;

        // neglect requests from calculation that took longer then the given timeout
        const that = this;
        setInterval(() => {
            let index;
            let id;
            const now = new Date();
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
        this.on('ready', sock => {
            sock.on('disconnect', sock => {
                if (sock.uuid) {
                    const responder = that.responders[sock.uuid];
                    let id;
                    for (id in responder) { //clear timers and callbacks for the disconnected socket
                        clearInterval(that.timers[id]);
                        delete that.timers[id];
                        that.callbacks[id] && delete that.callbacks[id];
                    }
                    delete that.responders[sock.uuid];
                }
            });
        });
    }

    send() {
        const that = this;
        const args = Array.prototype.slice.call(arguments);
        const id = this.requestId++;

        const hasCallback = 'function' == typeof args[args.length - 1];
        if (hasCallback)
            this.callbacks[id] = args.pop();

        let index = 0;
        if (this.sock && this.sock.socks) {
            const socks = this.sock.socks;
            const len = socks.length;
            let minAvgResponseTime = Number.MAX_VALUE;
            let minIndex = 0;
            let average = 0;

            if (len > 0 && _.size(this.responders) == len) { //have data for all sockets
                for (index in this.responders) {
                    const item = this.responders[index];
                    let totalTime = 0;
                    let request;
                    for (request in item) {
                        const time = item[request].time || 0;
                        totalTime += time;
                    }
                    average = totalTime / _.size(item) || 0;

                    if (average < minAvgResponseTime) {
                        minAvgResponseTime = average;
                        minIndex = index;
                    }
                    this.responders[index].average = average;
                }

                minIndex = _.findIndex(socks, {uuid: minIndex});

                // explore other servers every once in a while
                if (id % this.MAX_REQUESTS == 0)
                    minIndex = Math.floor(Math.random() * len);

            } else if (len != 0) { //there is a new socket to be explored use it
                minIndex = len - 1;
            }

            const n = this.sock.n = (minIndex % len) || 0; //select the socket to be used
            if (socks[n] && typeof socks[n].uuid == "undefined")
                socks[n].uuid = uuid.v4(); // assign a unique identifier to that socket

            index = (socks[n] && socks[n].uuid) || 0; //save the index of selected socket
        }

        const cb = (err, res) => {
            const lastRequests = that.responders[index];
            if (lastRequests && lastRequests[id])
                lastRequests[id].time = (new Date() - lastRequests[id].sent); //save response time
            clearInterval(that.timers[id]); //clear timers for that request
            delete that.timers[id];

            if (!that.callbacks[id]) return; //missing callback
            const stats = {averageTime: (lastRequests && lastRequests.average) || 0};
            that.callbacks[id](err, res, stats);
            delete that.callbacks[id];
        };

        args.push(cb);
        this.sock && this.sock.send(...args); //send request to socket

        if (index == 0) return; // this request is queued

        if (!this.responders[index]) this.responders[index] = {}; //create if this is the first request for that index
        this.responders[index][id] = { // create a container object
            time: 0,
            sent: new Date()
        };

        // increment responseTime of that request every 0.1 seconds
        this.timers[id] = setInterval(() => {
            const lastRequests = that.responders[index];
            if (lastRequests[id]) lastRequests[id].time += that.SAMPLE_INTERVAL;
        }, this.SAMPLE_INTERVAL);
    }

    close() {
        if (this.discovery) {
            this.discovery.stop();

            this.discovery.broadcast &&
                this.discovery.broadcast.socket &&
                this.discovery.broadcast.socket.close();
        }
    }

    static setEnvironment(environment) {
        TimeBalancedRequester.environment = `${environment}:`;
    }
}


TimeBalancedRequester.environment = '';


export default TimeBalancedRequester;
