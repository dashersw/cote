cote — A Node.js library for building zero-configuration microservices
====

[![Known Vulnerabilities](https://snyk.io/test/npm/cote/badge.svg)](https://snyk.io/test/npm/cote)
[![npm version](https://badge.fury.io/js/cote.svg)](https://badge.fury.io/js/cote)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/dashersw/cote/master/LICENSE)

**cote lets you write zero-configuration microservices without the help of
nginx, haproxy, redis, rabbitmq or _anything_ else. It is batteries — and
chargers! — included.**

Join us on
[![cote Slack](http://slack.cotejs.org/badge.svg)](http://slack.cotejs.org)
for anything related to cote.

## Features
- **Zero dependency:** Microservices with only JavaScript and Node.js
- **Zero-configuration:** no IP addresses, no ports, no routing to configure
- **Decentralized:** No fixed parts, no "manager" nodes, no single point of
                     failure
- **Auto-discovery:** Services discover each other without a central bookkeeper
- **Fault-tolerant:** Don't lose any requests when a service is down
- **Scalable:** Horizontally scale to any number of machines
- **Performant:** Process thousands of messages per second
- **Humanized API:** Extremely simple to get started with a reasonable API!

Develop your first microservices in under two minutes:
----
in `time-service.js`...
```js
const cote = require('cote');
const timeService = new cote.Responder({name: 'Time Service'});

timeService.on('time', (req, cb) => {
    cb(new Date());
});
```

in `client.js`...
```js
const cote = require('cote');
const client = new cote.Requester({name: 'Client'});

client.send({type: 'time'}, (time) => {
    console.log(time);
});
```

That's all! Wasn't that simple? Now you can scale linearly on tens of machines.
No configuration, no third party components, no nginx, no kafka, no consul and
**only** Node.js. cote is batteries — and chargers — included!

Microservices case study
----

Make sure to check out
[the e-commerce case study](https://github.com/dashersw/cote-workshop) that
implements a complete e-commerce application with microservices using
[cote](https://github.com/dashersw/cote).

Cote plays very well with Docker, taking advantage of its network overlay
features. The case study implements a scalable microservices application
via Docker and can scale to multiple machines.

Motivation
----

Tomorrow belongs to ~~distributed software~~ microservices.
As CPU performance is heavily dictated by the number of cores and the power of
each core is already at its limits, distributed computing will decide how your
application performs. ~~Distributed systems~~ Microservices also pose great
architectural benefits such as fault-tolerance and scalability.

Components of such ~~a distributed system~~ microservices should be able to
find other components
<a href="http://en.wikipedia.org/wiki/Zero_configuration_networking">
zeroconf</a> and communicate over a set of conventions. Sometimes they may work
as a cluster, may include a pub/sub mechanism, or a request/response mechanism.

Cote brings you all the advantages of ~~distributed software~~ microservices.
Think of it like homing pigeons.

Installing
----

Install cote via NPM:

```bash
npm install cote
```

Components
----

cote hosts a number of components that together let you implement microservice
communication. Below, you will find several examples on how to make use of each
component.

By default, every component can discover and interact with every other
component. This may not be desirable under certain conditions whereas security
and network performance is of importance, so one can segregate or partition
component clusters with `key`s and `environment`s provided in configuration
objects.

Also, all components support `namespace`s. Given as a property of the
configuration object to the constructor, components adhere and act on namespaces
if provided, and ignore other messages. Namespaces are also handy in that they
let you wire a namespaced socket.io connection to the front-end. In other words,
the `namespace`s here also serve as socket.io namespaces.

### Requester

Requester queues requests until a Responder is available, and once so, it
delivers the request. Requests will be dispatched to Responders in a
round-robin way.

Example:
```js
const cote = require('cote');

const randomRequester = new cote.Requester({
    name: 'Random Requester',
    // namespace: 'rnd',
    // key: 'a certain key',
    // environment: 'test',
    requests: ['randomRequest']
});

setInterval(() => {
    const req = {
        type: 'randomRequest',
        val: Math.floor(Math.random() * 10)
    };

    randomRequester.send(req, (res) => {
        console.log('request', req, 'answer', res);
    });
}, 5000);
```

Requesters also support `Promise`s, which gives you great flexibility when
working with promise-based libraries or when you want to chain multiple
`Requester`s and `Responder`s.

Example:
```js
const cote = require('cote');
const randomRequester = new cote.Requester({name: 'Random Requester'});

const makeRequest = (req) => randomRequester.send(req);

const req = {
    type: 'randomRequest',
    val: Math.floor(Math.random() * 10)
};

makeRequest(req)
    .then(console.log)
    .catch(console.log)
    .then(process.exit);
```

### Responder

Responder is a component for responding to certain requests from a `Requester`.
It's a descendant of `EventEmitter2`, and requests are regular events, therefore
may be wildcarded or namespaced.

`Responder` may be used to add new modules to existing web servers /
applications without ever changing the main server code. Only a `Requester`
will be able to utilize a `Responder`.

You can use a `Responder` with a `Sockend` component to open a flexible API
channel for the front-end. This greatly reduces time-to-market by providing a
direct API for your front-end applications.

Example:
```js
const cote = require('cote');

// Instantiate a new Responder component.
const randomResponder = new cote.Responder({
    name: 'Random Responder',
    // namespace: 'rnd',
    // key: 'a certain key',
    // environment: 'test',
    respondsTo: ['randomRequest'] // types of requests this responder
                                  // can respond to.
});

// request handlers are like any event handler.
randomResponder.on('randomRequest', (req, cb) => {
    const answer = Math.floor(Math.random() * 10);
    console.log('request', req.val, 'answering with', answer);
    cb(answer);
});
```

`Responder`s also support `Promise`s, , which gives you great flexibility when
working with promise-based libraries or when you want to chain multiple
`Requester`s and `Responder`s.

Example:
```js
const cote = require('cote');
const UserModel = require('UserModel'); // a promise-based model API such as
                                        // mongoose.

const userResponder = new cote.Responder({name: 'User Responder'});

userResponder.on('find', (req) => UserModel.findOne(req.query));

// this would probably be in another file
const userRequester = new cote.Requester({name: 'User Requester'});

userRequester
    .send({type: 'find', query: {username: 'foo'}})
    .then(user => console.log(user))
    .then(process.exit);
```

### Publisher

`Publisher` is a component for publishing certain events with arbitrary data.
It may be used as a distributed `EventEmitter`. It may also be used in a
scenario where some components need to be notified of updates, such as new
tweets, etc. instead of polling for them. Only a `Subscriber` will get
notifications from a `Publisher`.

The messages `Publisher`s publish are volatile in that if there are no
`Subscriber`s listening, they are lost.

`Publisher`s may be used in conjunction with a `Sockend` component, in which
case the front-end clients will be notified of the events published. This is a
very cool real-time communication mechanism for your apps with no proprietary
technology like Meteor.

Example:
```js
const cote = require('cote');

// Instantiate a new Publisher component.
const randomPublisher = new cote.Publisher({
    name: 'Random Publisher',
    // namespace: 'rnd',
    // key: 'a certain key',
    // environment: 'test',
    broadcasts: ['randomUpdate']
});

// Wait for the publisher to find an open port and listen on it.
setInterval(function() {
    const val = {
        val: Math.floor(Math.random() * 1000)
    };

    console.log('emitting', val);

    // publish an event with arbitrary data at any time
    randomPublisher.publish('randomUpdate', val);
}, 3000);
```

### Subscriber

`Subscriber` subscribes to events emitted from a `Publisher`.

Example:
```js
const cote = require('cote');

const randomSubscriber = new cote.Subscriber({
    name: 'Random Subscriber',
    // namespace: 'rnd',
    // key: 'a certain key',
    // environment: 'test',
    subscribesTo: ['randomUpdate']
});

randomSubscriber.on('randomUpdate', (req) => {
    console.log('notified of ', req);
});
```

### Sockend

`Sockend` is the glue for carrying all the possibilities of cote to the next
level with WebSockets over socket.io. `Sockend` makes `Responder`s and
`Publisher`s available to the front-end and adhere to socket.io namespaces.
It's the magic and the lost link for microservices. Without any configuration,
you can expose APIs directly to the front-end.

Example:
`index.html`
```html
<script src="/socket.io/socket.io.js"></script>
<script>
var socket = io.connect();
var socketNamespaced = io.connect('/rnd');

setInterval(function() {
    var req = {
        val: Math.floor(Math.random() * 10)
    };

    var req2 = {
        val: Math.floor(Math.random() * 10)
    };

    var req3 = {
        val: Math.floor(Math.random() * 10)
    };

    var req4 = {
        val: Math.floor(Math.random() * 10)
    }

    socket.emit('randomRequest', req, function(data) {
        console.log('normal', req.val, data);
    });

    socketNamespaced.emit('randomRequest', req2, function(data) {
        console.log('ns', req2.val, data);
    });

    socket.emit('promised request', req3, function(err, data) {
        console.log('normal promised', req3.val, err, data);
    });

    socketNamespaced.emit('promised request', req4, function(err, data) {
        console.log('ns promised', req4.val, err, data);
    });
}, 3000);
</script>
```
`sockend.js`
```js
const cote = require('cote'),
    app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs');

app.listen(process.argv[2] || 5555);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
};

const sockend = new cote.Sockend(io, {
    name: 'Sockend',
    // key: 'a certain key',
    // environment: 'test'
});
```

Now, fire up a few `Responder`s and `Publisher`s (from the `examples` folder)
on default or 'rnd' namespace and watch them glow with magic on
`http://localhost:5555`.

### Monitor

Monitor is the "top" of cote. It lists all the daemons it discovers regardless
of namespace or key. Run `examples/monitor.js` and see all your active cote
daemons.

### Monitoring Tool

Cote also has an infant of a monitoring tool that displays the cote ecosystem
running in your environment in a nice graph. Run `examples/monitoring-tool.js`
and navigate to `http://localhost:5555` in your browser to see your cote network
graph in action.

MIT License
----

Copyright (c) 2013 Armagan Amcalar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
