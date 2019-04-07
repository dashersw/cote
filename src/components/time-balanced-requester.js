const Requester = require('./requester');
const _ = require('lodash');
const uuid = require('uuid');

module.exports = class TimeBalancedRequester extends Requester {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.responders = {};
        this.timers = {};
        this.requestId = 0;
        this.callbacks = {};
        this.MAX_REQUESTS = 10;
        this.CALCULATION_TIMEOUT = 10000;
        this.SAMPLE_INTERVAL = 100;

        // neglect requests from calculation this took longer then the given timeout
        setInterval(() => {
            const now = new Date();

            for (const index in this.responders) {
                for (const id in this.responders[index]) {
                    if (now - this.responders[index][id].sent > this.CALCULATION_TIMEOUT) {
                        if (this.timers[id]) {
                            clearInterval(this.timers[id]);
                        } // if the response is lost, don't leave garbage

                        delete this.responders[index][id];
                    }
                }
            }
        }, this.SAMPLE_INTERVAL);

        // clear all gathered data when a socket disconnects
        this.sock.on('socket close', (sock) => {
            if (sock.uuid) {
                const responder = this.responders[sock.uuid];

                for (const id in responder) { // clear timers and callbacks for the disconnected socket
                    clearInterval(this.timers[id]);
                    delete this.timers[id];

                    if (typeof this.callbacks[id] == 'function') {
                        this.callbacks[id](new Error('lost connection'));
                    } else {
                        this.callbacks[id] && this.callbacks[id].reject(new Error('lost connection'));
                    }
                    delete this.callbacks[id];
                }
                delete this.responders[sock.uuid];
            }
        });
    }

    send(...args) {
        const id = this.requestId++;

        const hasCallback = 'function' == typeof args[args.length - 1];
        if (hasCallback) {
            this.callbacks[id] = args.pop();
        } else {
            let resolve;
            let reject;
            this.callbacks[id] = new Promise((_resolve, _reject) => {
                resolve = _resolve;
                reject = _reject;
            });

            this.callbacks[id].resolve = resolve;
            this.callbacks[id].reject = reject;
        }

        let originalPromise;

        let index = 0;
        const socks = this.sock.socks;
        const len = socks.length;
        let minAvgResponseTime = Number.MAX_VALUE;
        let minIndex = 0;
        let average = 0;

        if (len > 0 && _.size(this.responders) == len) { // have data for all sockets
            for (index in this.responders) {
                const item = this.responders[index];
                let totalTime = 0;

                for (const request in item) {
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

            minIndex = _.findIndex(socks, { uuid: minIndex });

            // explore other servers every once in a while
            if (id % this.MAX_REQUESTS == 0) {
                minIndex = Math.floor(Math.random() * len);
            }
        } else if (len != 0) { // there is a new socket to be explored use it
            minIndex = _.findIndex(socks, (s) => !s.uuid);
        }

        let n = this.sock.n = (minIndex % len) || 0; // select the socket to be used
        if (!this.sock.socks[n]) n = this.sock.n = 0;
        if (socks[n] && typeof socks[n].uuid == 'undefined') {
            socks[n].uuid = uuid.v4();
        } // assign a unique identifier to this socket

        index = (socks[n] && socks[n].uuid) || 0; // save the index of selected socket

        const cb = (...args) => {
            const lastRequests = this.responders[index];
            if (lastRequests && lastRequests[id]) {
                lastRequests[id].time = (new Date() - lastRequests[id].sent);
            } // save response time
            clearInterval(this.timers[id]); // clear timers for this request
            delete this.timers[id];

            const stats = { averageTime: (lastRequests && lastRequests.average) || 0 };

            if (hasCallback) {
                this.callbacks[id](...args, stats);
            } else {
                if (originalPromise.state == 'rejected') this.callbacks[id].reject(args[0]);
                else this.callbacks[id].resolve(args[0]);
            }
            delete this.callbacks[id];
        };

        if (index != 0) {
            if (!this.responders[index]) this.responders[index] = {}; // create if it's the first request for this index
            this.responders[index][id] = { // create a container object
                time: 0,
                sent: new Date(),
            };

            // increment responseTime of this request every 0.1 seconds
            this.timers[id] = setInterval(() => {
                const lastRequests = this.responders[index];
                if (!lastRequests) return clearInterval(this.timers[id]);

                if (lastRequests[id]) lastRequests[id].time += this.SAMPLE_INTERVAL;
            }, this.SAMPLE_INTERVAL);
        }

        if (hasCallback) return super.send(...args, cb);
        else {
            originalPromise = super.send(...args);
            originalPromise.then((res) => {
                originalPromise.state = 'resolved';
                cb(res);
            }).catch((err) => {
                originalPromise.state = 'rejected';
                cb(err);
            });
            return this.callbacks[id];
        }
    };
};
