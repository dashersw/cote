cote
====

cote is an auto-discovery mesh network framework for building fault-tolerant and scalable applications. It hosts components that let you write programs that discover each other over LAN and communicate in various schemes.

Cote is built upon networking and messaging libraries such as <a href="https://github.com/visionmedia/axon">axon</a> and <a href="https://github.com/wankdanker/node-discover">node-discover</a>.

Motivation
----

Tomorrow belongs to distributed software. As CPU performance is heavily dictated by the number of cores and the power of each core is already at its limits, distributed computing will decide how your application performs. Distributed systems also pose great architectural benefits such as fault-tolerance and scalability.

Components of such a distributed system should be able to find other components <a href="http://en.wikipedia.org/wiki/Zero_configuration_networking">zeroconf</a> and communicate over a set of conventions. Sometimes they may work as a cluster, may include a pub/sub mechanism, or a request/response mechanism. Cote brings you the advantages of distributed software. Think of it like homing pigeons.

Installing
----

* via npm<br>
`npm install cote`
* via git<br>
`git clone git://github.com/dashersw/cote.git`

Components
----

### Requester

Requester queues requests until a Responder is available, and once so, it delivers the request. Requests will be dispatched to Responders in a round-robin way.

Example:

```js
var Requester = require('cote').Requester;

var randomRequest = new Requester({
    name: 'randomReq',
    requests: ['randomRequest']
});

randomRequest.on('ready', function() {
    setInterval(function() {
        var req = {
            type: 'randomRequest',
            val: ~~(Math.random() * 10)
        };

        randomRequest.send(req, function(res) {
            console.log('request', req, 'answer', res);
        });
    }, 5000);
});
```

### Responder

Responder is a component for responding to certain requests from a Requester. It's a descendant of EventEmitter2, and requests are regular events, therefore may be wildcarded or namespaced.

Responder may be used to add new modules to existing web servers / applications without ever changing the main server code. Only a Requester will be able to utilize a Responder.

Example:

```js
var Responder = require('cote').Responder;

// Instantiate a new Responder component.
var randomResponder = new Responder({
    name: 'randomRep',
    respondsTo: ['randomRequest'] // types of requests this responder
                                  // can respond to.
});

// request handlers are like any event handler.
randomResponder.on('randomRequest', function(req, cb) {
    var answer = ~~(Math.random() * 10);
    console.log('request', req.val, 'answering with', answer);
    cb(answer);
});
```

### Publisher

Publisher is a component for publishing certain events with arbitrary data. It may be used as a distributed EventEmitter. It may also be used in a scenario where some components need to be notified of updates, such as new tweets, etc. instead of polling for them. Only a subscriber will get notifications from a Publisher.

Example:

```js
var Publisher = require('cote').Publisher;

// Instantiate a new Publisher component.
var randomPublisher = new Publisher({
    name: 'randomPub',
    broadcasts: ['randomUpdate']
});

// Wait for the publisher to find an open port and listen on it.
randomPublisher.on('ready', function(sock) {
    setInterval(function() {
        var val = {
            val: ~~(Math.random() * 1000)
        };

        console.log('emitting', val);

        sock.emit('randomUpdate', val); // emit an event with arbitrary data at any time
    }, 3000);
});
```

### Subscriber

Subscriber subscribes to events emitted from a Publisher.

Example:

```js
var Subscriber = require('cote').Subscriber;

var randomSubscriber = new Subscriber({
    name: 'randomSub',
    subscribesTo: ['randomUpdate']
});

randomSubscriber.on('randomUpdate', function(req) {
    console.log('notified of ', req);
});
```

MIT License
----

Copyright (c) 2013 Armagan Amcalar armagan@amcalar.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
