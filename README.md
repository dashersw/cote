![cote](https://user-images.githubusercontent.com/698308/32996603-1517088a-cd85-11e7-85c5-8ef9b3ae2e49.png)

cote — A Node.js library for building zero-configuration microservices
====

[![npm version](https://badge.fury.io/js/cote.svg)](https://badge.fury.io/js/cote)
[![Build Status](https://travis-ci.org/dashersw/cote.svg?branch=master)](https://travis-ci.org/dashersw/cote)
[![Coverage Status](https://coveralls.io/repos/github/dashersw/cote/badge.svg)](https://coveralls.io/github/dashersw/cote)
[![dependencies Status](https://david-dm.org/dashersw/cote/status.svg)](https://david-dm.org/dashersw/cote)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/dashersw/cote/master/LICENSE)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdashersw%2Fcote.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdashersw%2Fcote?ref=badge_shield)

**cote lets you write zero-configuration microservices in Node.js without nginx,
haproxy, redis, rabbitmq or _anything else_. It is batteries — and chargers! —
included.**

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
const timeService = new cote.Responder({ name: 'Time Service' });

timeService.on('time', (req, cb) => {
    cb(new Date());
});
```

in `client.js`...
```js
const cote = require('cote');
const client = new cote.Requester({ name: 'Client' });

client.send({ type: 'time' }, (time) => {
    console.log(time);
});
```

You can run these files anyway you like — on a single machine or scaled out to
hundreds of machines in different datacenters — and they will *just work*. No
configuration, no third party components, no nginx, no kafka, no consul and
**only** Node.js. cote is batteries — and chargers — included!

Microservices case study
----
Make sure to check out
[the e-commerce case study](https://github.com/dashersw/cote-workshop) that
implements a complete e-commerce application with microservices using
[cote](https://github.com/dashersw/cote). It features;

+ a back-office with real-time updates for managing the catalogue of products
and displaying sales with a RESTful API (express.js)
+ a storefront for end-users with real-time updates to products where they
can buy the products with WebSockets (socket.io)
+ a user microservice for user CRUD
+ a product microservice for product CRUD
+ a purchase microservice that enables users to buy products
+ a payment microservice that deals with money transactions that occur as
a result of purchases
+ Docker compose configuration for running the system locally

cote plays very well with Docker, taking advantage of its network overlay
features. The case study implements a scalable microservices application
via Docker and can scale to multiple machines.

## Table of Contents
1. [Motivation](#motivation)
1. [Getting started](#getting-started)
    1. [Introduction to cote](#introduction-to-cote)
    1. [Installation](#installation)
    1. [Using cote for the first time](#using-cote-for-the-first-time)
    1. [Implementing a request-response mechanism](#implementing-a-request-response-mechanism)
        1. [Creating a requester](#creating-a-requester)
        1. [Creating a responder](#creating-a-responder)
    1. [Tracking changes in the system with a publish-subscribe mechanism](#tracking-changes-in-the-system-with-a-publish-subscribe-mechanism)
        1. [Creating the arbitration service](#creating-the-arbitration-service)
        1. [Creating a publisher](#creating-a-publisher)
        1. [Creating a subscriber](#creating-a-subscriber)
1. [Components Reference](#components-reference)
    1. [Requester](#requester)
    1. [Responder](#responder)
    1. [Publisher](#publisher)
    1. [Subscriber](#subscriber)
    1. [Sockend](#sockend)
    1. [Monitor](#monitor)
    1. [Monitoring Tool](#monitoring-tool)
1. [Advanced Usage](#advanced-usage)
    1. [Environments](#environments)
    1. [Keys](#keys)
    1. [Namespaces](#namespaces)
    1. [Multicast address](#multicast-address)
    1. [Broadcast address](#broadcast-address)
    1. [Controlling cote with environment variables](#controlling-cote-with-environment-variables)
1. [Deploying with Docker Cloud](#deploying-with-docker-cloud)
1. [Using centralized discovery tools](#using-centralized-discovery-tools)
1. [FAQ](#faq)
1. [Contribution](#contribution)
1. [License](#mit-license)

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

cote brings you all the advantages of ~~distributed software~~ microservices.
Think of it like homing pigeons.

Getting Started
----

### Introduction to cote

cote allows you to implement hassle-free microservices by utilizing
auto-discovery and other techniques. Typically, in a microservices system, the
application is broken into smaller chunks that communicate with each other.
cote helps you build such a system by providing you several key components
which you can use for service communication.

In a way, cote is the glue that's most necessary between different
microservices. It replaces queue protocols and service registry software by
clever use of IP broadcast/IP multicast systems. It's like your computer
discovering there's an Apple TV nearby. This means, cote needs an
environment that allows the use of IP broadcast or multicast, in order to
scale beyond a single machine. Most bare-metal systems are designed this way,
however, cloud infrastructure like AWS needs special care, either an overlay
network like Weave, or better yet, just, Docker — which is fortunately the way
run all of our software today anyway. That's why Docker is especially important
for cote, as it enables cote to work its magic.

cote also replaces HTTP communication. Microservices architecture is meant for
hundreds of internal services communicating with each other. That being the
case, a protocol like HTTP is cumbersome and heavy for communication that
doesn't need 90% of HTTP's features. Therefore, cote uses a very light protocol
over plain old TCP sockets for communication, making it fast, effective and
most importantly, cheap.

### Installation

cote is a Node.js library for building microservices applications. It's
available as an [npm package](https://npmjs.org/package/cote).

Install cote locally via npm:

```bash
npm install cote
```

### Using cote for the first time

Whether you want to integrate cote with an existing web application — e.g.
based on express.js as exemplified
[here](https://github.com/dashersw/cote-workshop/blob/master/admin/server.js)
— or you want to rewrite a portion of your monolith, or you want to rewrite a
few microservices with cote, all you need to do is to instantiate a few of
cote's components (e.g. [Responder](#responder), [Requester](#requester),
[Publisher](#publisher), [Subscriber](#subscriber)) depending on
your needs, and they will start communicating automatically. While one component
per process might be enough for simple applications or for tiny microservices, a
complex application would require close communication and collaboration of
multiple microservices. Hence, you may instantiate multiple components in a
single process / service / application.

### Implementing a request-response mechanism

The most common scenario for applications is the request-response cycle.
Typically, one microservice would request a task to be carried out or make
a query to another microservice, and get a response in return. Let's implement
such a solution with cote.

First, require cote;

```js
const cote = require('cote');
```

#### Creating a requester

Then, instantiate any component you want. Let's start with a `Requester` that
shall ask for, say, currency conversions. `Requester` and all other components
are classes on the main `cote` object, so we instantiate them with the `new`
keyword.

```js
const requester = new cote.Requester({ name: 'currency conversion requester' });
```

All cote components require an object as the first argument, which should at
least have a `name` property to identify the component. The name is used mainly
as an identifier in monitoring components, and it's helpful when you read the
logs later on as each component, by default, logs the name of the other
components they discover.

`Requester`s send requests to the ecosystem, and are expected to be used
alongside `Responder`s to fulfill those requests. If there are no `Responder`s
around, a `Requester` will just queue the request until one is available. If
there are multiple `Responder`s, a `Requester` will use them in a round-robin
fashion, load-balancing among them.

Let's create and send a `convert` request, to ask for conversion from USD into
EUR.

```js
const request = { type: 'convert', from: 'usd', to: 'eur', amount: 100 };

requester.send(request, (err, res) => {
  console.log(res);
});
```

You can save this file as `client.js` and run it via `node client.js`.

<details>
<summary>
    Click to see the complete <code>client.js</code> file.
</summary>
<p>

```js
const cote = require('cote');

const requester = new cote.Requester({ name: 'currency conversion requester'});

const request = { type: 'convert', from: 'usd', to: 'eur', amount: 100 };

requester.send(request, (err, res) => {
  console.log(res);
});
```

</p>
</details>

Now this request will do nothing, and there won't be any logs in the console,
because there are no components to fulfill this request and produce a response.

Keep this process running, and let's create a `Responder` to respond to currency conversion requests.

#### Creating a responder

We first instantiate a `Responder` with the `new` keyword.

```js
const responder = new cote.Responder({ name: 'currency conversion responder' });
```

As detailed in [Responder](#responder), each `Responder` is also an instance of
`EventEmitter2`. Responding to a certain request, let's say `convert`, is the
same as listening to the `convert` event, and handling it with a function that
takes two parameters: a request and a callback. The request parameter holds
information about a single request, and it's basically the same `request` object
the requester above sent. The second parameter, the callback, expects to be
called with the actual response.

Here's how a simple implementation might look like.

```js
const rates = { usd_eur: 0.91, eur_usd: 1.10 };

responder.on('convert', (req, cb) => {
    cb(null, req.amount * rates[`${req.from}_${req.to}`]);
});
```

Now you can save this file as `conversion-service.js` and run it via
`node conversion-service.js` on a separate terminal.

<details>
<summary>
    Click to see the complete <code>conversion-service.js</code> file.
</summary>
<p>

```js
const cote = require('cote');

const responder = new cote.Responder({ name: 'currency conversion responder' });

const rates = { usd_eur: 0.91, eur_usd: 1.10 };

responder.on('convert', (req, cb) => {
    cb(null, req.amount * rates[`${req.from}_${req.to}`]);
});
```

</p>
</details>

As you run the service, you will immediately see the first request in
`client.js` being fulfilled and logged to the console. Now you can take this
idea and build your services on it.

Notice how we didn't have to configure IP addresses, ports, hostnames, or
anything else.

> Note: By default, every `Requester` will connect to every `Responder` it
discovers, regardless of the request type. This means, every `Responder` should
respond to the exact same set of requests, because `Requester`s will
load-balance requests between all connected `Responder`s regardless of
their capabilities, i.e, whether or not they can handle a given request.

If you have multiple `Responder`s with varying response handlers, you will
experience lost requests. In cote, this separation between responsibilities is
called segmentation, or partitioning. If you wish to segment your requests in
groups, you can use `key`s. Check out [keys](#keys) for a detailed guide on how
and when to use segmentation.

### Tracking changes in the system with a publish-subscribe mechanism

One of the benefits of a microservices approach is its ease of use as a tool for
tasks that previously required serious infrastructural investments. Such a task
is managing updates and tracking changes in a system. Previously, this required
at least a queue infrastructure with fanout, and scaling and managing this
technological dependency would be a hurdle on its own.

Fortunately, cote solves this problem in a very intuitive and almost magical
way.

Say, we need an arbitration service in our application which decides currency
rates, and whenever there's a change within the system, it should notify all the
instances of conversion services, so that they facilitate the new values.

Of course, the arbitration service would be API driven, and would receive the
new rates over another request so that for example an admin can enter the values
through a back office application. The arbitration service should take this
update and basically forward it to every conversion service. In order to achieve
this, the arbitration service should have two components: one `Responder` for
the API updates and one `Publisher` for notifying the conversion services. In
addition to this, the conversion services should be updated to include a
`Subscriber`. Let's see this in action.


#### Creating the arbitration service

A simple implementation of such a service would look like the following. First,
we require cote and instantiate a responder for the API. Since we now have two
responders, `arbitration API` and `currency conversion responder`, we need to
introduce service segmentation by using `key` property. If we had no keys in
our examples, some requests from our `client.js` would end up in
`currency conversion responder` and we would get a correct response, but some
other requests would end up in `arbitration API`, and since arbitration
responder isn't listening to `'convert'` events, the request would remain
 unanswered.

`arbitration-service.js`

```js
const cote = require('cote');

const responder = new cote.Responder({ name: 'arbitration API', key: 'arbitration' });
```

Let's say we keep the rates in a local variable. This could just as well be a
database call, but for the sake of simplicity let's keep this local.

```js
const rates = {};
```

Now the responder shall respond to an `rate updated` request, allowing admins to
update it from a back office application. The backoffice integration isn't
important at this moment, but [here is an example how back offices could
interact with cote responders in the backend](https://github.com/dashersw/cote-workshop/tree/master/admin).
Basically, this service should have a responder to take in the new rates for a
currency exchange.

```js
responder.on('update rate', (req, cb) => {
    rates[req.currencies] = req.rate; // { currencies: 'usd_eur', rate: 0.91 }

    cb(null, `changed ${req.currencies} rate to ${req.rate}`);
});
```

#### Creating a publisher

We now have the rates, but the rest of the system, namely, the conversion
services aren't aware of this change yet. In order to update them of the
changes, we should create a `Publisher`.

```js
const publisher = new cote.Publisher({ name: 'arbitration publisher' });
```

Now whenever there's a new rate, we should utilize this `Publisher`. The
`update rate` handler thus becomes:

```js
responder.on('update rate', (req, cb) => {
    rates[req.currencies] = req.rate;

    cb(null, `changed ${req.currencies} rate to ${req.rate}`);

    publisher.publish('rate updated', req);
});
```

<details>
<summary>
    Click to see the complete <code>arbitration-service.js</code> file.
</summary>
<p>

```js
const cote = require('cote');

const responder = new cote.Responder({ name: 'arbitration API', key:'arbitration' });
const publisher = new cote.Publisher({ name: 'arbitration publisher' });

const rates = {};

responder.on('update rate', (req, cb) => {
    rates[req.currencies] = req.rate;

    cb(null, `changed ${req.currencies} rate to ${req.rate}`);

    publisher.publish('rate updated', req);
});

```

</p>
</details>

Since currently there are no subscribers in this system, nobody will be notified
of these changes. In order to facilitate this update mechanism, we need to go
back to our `conversion-service.js` and add a `Subscriber` to it.

#### Creating a subscriber

A `Subscriber` is a regular cote component, so we instantiate it with the
following:

```js
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber' });
```

Put this line in `conversion-service.js`.

`Subscriber` also extends `EventEmitter2`, and although these services might run
in machines that are continents apart, any published updates will end up in a
`Subscriber` as an event for us to consume.

Here's how we might update `conversion-service.js` to listen to updates from the
arbitration service.

```js
subscriber.on('rate updated', (update) => {
    rates[update.currencies] = update.rate;
});
```

Let's not forget to change the use of requester and responder in our conversion service and in our client to use segmentation key.

conversion-service.js
```js
const responder = new cote.Responder({ name: 'currency conversion responder', key: 'conversion' });
```

client.js
```js
const requester = new cote.Requester({ name: 'currency conversion requester', key: 'conversion' });
```

That's it! From now on, this conversion service will synchronize with the
arbitration service and receive its updates. The new conversion requests after
an update will be done over the new rate.

<details>
<summary>
    Click to see the complete <code>conversion-service.js</code> file.
</summary>
<p>

```js
const cote = require('cote');

const responder = new cote.Responder({ name: 'currency conversion responder', key: 'conversion' });
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber' });

const rates = { usd_eur: 0.91, eur_usd: 1.10 };

subscriber.on('rate updated', (update) => {
    rates[update.currencies] = update.rate;
});

responder.on('convert', (req, cb) => {
    const convertedRate = req.amount * rates[`${req.from}_${req.to}`];

    cb(null, `${req.amount} ${req.from} => ${convertedRate} ${req.to}`);
});
```

</p>
</details>

<details>
<summary>
    Click to see the complete <code>client.js</code> file.
</summary>
<p>

```js
const cote = require('cote');

const requester = new cote.Requester({ name: 'currency conversion requester', key:'conversion' });

const request = { type: 'convert', from: 'usd', to: 'eur', amount: 100 };

requester.send(request, (err, res) => {
    console.log(res);
});
```

</p>
</details>

Components Reference
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
    requests: ['randomRequest'],
});

setInterval(() => {
    const req = {
        type: 'randomRequest',
        val: Math.floor(Math.random() * 10),
    };

    randomRequester.send(req, (res) => {
        console.log('request', req, 'answer', res);
    });
}, 5000);
```

Requesters also support `Promise`s, which gives you great flexibility when
working with promise-based libraries or when you want to chain multiple
`Requester`s and `Responder`s.

Example with promises:

```js
const cote = require('cote');
const randomRequester = new cote.Requester({ name: 'Random Requester' });

const makeRequest = (req) => randomRequester.send(req);

const req = {
    type: 'randomRequest',
    val: Math.floor(Math.random() * 10),
};

makeRequest(req)
    .then(console.log)
    .catch(console.log)
    .then(process.exit);
```

Example with `async / await`:

```js
const cote = require('cote');
const randomRequester = new cote.Requester({ name: 'Random Requester' });

async function makeRequest () {
    const req = {
        type: 'randomRequest',
        val: Math.floor(Math.random() * 10),
    };

    const response = await randomRequester.send(req);
    console.log(response);

    process.exit();
}

makeRequest();
```

#### Timeout

A timeout could be configured for all Requesters as an environment variable
`COTE_REQUEST_TIMEOUT`, or in advertisement options for specific Requester,
or in a property called `__timeout` in first argument of `requester.send`
method. Latter setting overrides former. Timeout is specified in milliseconds.

**As environment variable for all requesters:**

```sh
COTE_REQUEST_TIMEOUT=1000 node service.js
```

**In advertisement settings:**

```js
new cote.Requester({ name: `Requester with timeout`, timeout: 1000 });
```

**In send data:**
```js
requester.send({ type: 'find', __timeout: 2000 });
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
    respondsTo: ['randomRequest'], // types of requests this responder
                                  // can respond to.
});

// request handlers are like any event handler.
randomResponder.on('randomRequest', (req, cb) => {
    const answer = Math.floor(Math.random() * 10);
    console.log('request', req.val, 'answering with', answer);

    cb(null, answer);
});
```

`Responder`s also support `Promise`s, , which gives you great flexibility when
working with promise-based libraries or when you want to chain multiple
`Requester`s and `Responder`s.

Example with promises:

`responder.js`
```js
const cote = require('cote');
const UserModel = require('UserModel'); // a promise-based model API such as
                                        // mongoose.

const userResponder = new cote.Responder({ name: 'User Responder' });

userResponder.on('find', (req) => UserModel.findOne(req.query));
```

`requester.js`
```js
const cote = require('cote');
const userRequester = new cote.Requester({ name: 'User Requester' });

userRequester
    .send({ type: 'find', query: { username: 'foo' } })
    .then((user) => console.log(user))
    .then(process.exit);
```

Example with `async / await`

`responder.js`
```js
const cote = require('cote');
const UserModel = require('UserModel'); // a promise-based model API such as
                                        // mongoose.

const userResponder = new cote.Responder({ name: 'User Responder' });

userResponder.on('find', (req) => UserModel.findOne(req.query));
```

`requester.js`
```js
const cote = require('cote');
const userRequester = new cote.Requester({ name: 'User Requester' });

async function makeRequest() {
    const user = await userRequester.send({ type: 'find', query: { username: 'foo' });
    console.log(user);

    process.exit();
}

makeRequest();

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
    broadcasts: ['randomUpdate'],
});

// Wait for the publisher to find an open port and listen on it.
setInterval(function() {
    const val = {
        val: Math.floor(Math.random() * 1000),
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
    subscribesTo: ['randomUpdate'],
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
let socket = io.connect();
let socketNamespaced = io.connect('/rnd');

socket.on('randomUpdate', function(data) {
    console.log(data);
});

setInterval(function() {
    let req = {
        val: Math.floor(Math.random() * 10),
    };

    let req2 = {
        val: Math.floor(Math.random() * 10),
    };

    let req3 = {
        val: Math.floor(Math.random() * 10),
    };

    let req4 = {
        val: Math.floor(Math.random() * 10),
    };

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

io.on('connection', (socket) => {
    socket.join('room1');
});

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
    // key: 'a certain key'
});
```

To connect responder and sockend, you need to add `respondsTo:` parameter to your options.
```js
const randomResponder = new Responder({
    name: 'randomRep',
    respondsTo: ['randomRequest', 'promised request'], // types of requests this responder
    							  // can respond to.
});
```
To connect publisher and sockend, you need to add `broadcasts:` parameter to your options

```js
let randomPublisher = new Publisher({
    name: 'randomPub',
    broadcasts: ['update1', 'update2'],
});
```

If your socket is connected to a namespace, you need to add the same namespace to the components that you want to expose.
Even though socket.io are prefixed with `/`, with sockend you need to omit `/`.

socket.io-client
```js
io.connect('/rnd'); // namespace in socket.io is declared as '/rnd'
```
sockend component
```js
const randomResponder = new Responder({
    name: 'randomRep',
    namespace: 'rnd', // with sockend, we we omit the '/' and use just 'rnd'
    respondsTo: ['randomRequest', 'promised request'], // types of requests this responder
    							  // can respond to.
});
```

You can check complete code for  `Responder`s and `Publisher`s in the `examples` folder. Fire them up
on default or 'rnd' namespace and watch them glow with magic on
`http://localhost:5555`.
If you want to see more complete example of microservices with sockend integration, check out [the e-commerce case study](https://github.com/dashersw/cote-workshop)

##### Socket.io Rooms
`Sockend` supports socket.io rooms. All you need to do is add a `__rooms` or `__room` attribute to
the published message.

```js
const randomPublisher = new cote.Publisher({
    name: 'Random Publisher',
    // namespace: 'rnd',
    // key: 'a certain key',
    broadcasts: ['randomUpdate'],
});

randomPublisher.publish('randomUpdate', { val: 500, __rooms: ['room1', 'room2'] });
randomPublisher.publish('randomUpdate', { val: 500, __room: 'room1' });
```

### Monitor

Monitor is the "top" of cote. It lists all the daemons it discovers regardless
of namespace or key. Run `examples/monitor.js` and see all your active cote
daemons.

### Monitoring Tool

cote also has an infant of a monitoring tool that displays the cote ecosystem
running in your environment in a nice graph. Run `examples/monitoring-tool.js`
and navigate to `http://localhost:5555` in your browser to see your cote network
graph in action.

## Advanced usage

While cote is extremely simple to get started, the requirements for a system
running in production may demand further tweaking and advanced settings. Here
are some of the advanced features of cote, which can be adjusted on several
levels — as environment variables, as direct settings for the cote module when
requiring it, or as direct settings for each component.

Until now, we only saw instantiating cote components with a single argument. In
fact, all cote components have two constructor parameters. The first is used as
the _advertisement_ configuration which controls the data being advertised for
auto-discovery. The second parameter is the _discovery_ configuration and it
controls the network-layer configuration and environments for components.

We'll see more details in the following section.

### Environments

cote works over IP broadcast or multicast. This means, for example, in an office
network where there are several developers running a project based on cote in
their local machines, there _might_ be chaos. Components on a developer's
machine will discover other components on another developer's machine. This
probably is not a desired effect, and fortunately cote offers a way to combat
this.

By passing in an `environment` property to the configuration object of a
component, one can control the scope of auto-discovery for that particular
component. Components that are not in the same environment will ignore each
other. This effectively creates network partitions.

`environment`s can be set as an environment variable `COTE_ENV`.

Running a service with

```sh
COTE_ENV=developer-1 node service.js
```

sets all the components within that service to use `developer-1` as an
`environment`. This makes sure that however many modules `service.js` makes use
of, they all will share the same `environment`, so this is the safest way to
specify `environment`s.

The other way to specify an `environment` is using the configuration argument
to cote, given when requiring cote in the first place. Since Node.js modules are
read and executed once from the disk, you need to make sure to pass in the configuration at least once, during the first require call. The subsequent
requires to cote will return the same module, which already has your
configuration. If you have a bootstrap in your application that runs as the
first thing in the application, it might be a good idea to put this config
there.

#### Example

```js
const cote = require('cote')({ environment: 'developer-2' });
```

Now the components in these services won't discover and communicate with each
other.

Another place this comes handy is multiple environments running on a single
machine. Say you have a machine for your QA needs, where you host several
environments for different tests, e.g. `integration` and `qa`. Again, components
from different environments would mix up. Using a parametric `environment`, in
this case, solves this problem.

### Keys

cote has another mechanism to create partitions called `key`s.
Since every component discovers and tries to communicate with every other
component on the horizon (this is called a "mesh network"), if different
services request and respond to different types of messages, you will
experience lost messages. In other words, if service A responds to messages X
and Y, and service B responds to messages Z and T, you will lose half of the
messages, because messages Z and T will also end up at service A, but it won't
know how to handle them. The same is true for service B: messages X and Y
will end up at it, but service B won't know how to respond to them.

Keys are useful in this scenario: requesters and responders around service A
and messages X and Y should use one particular key, and requesters and
responders around service B and messages Z and T should use another key. In
this case, no messages will be lost, and the services will be segregated.

In our experience, the best way to segregate services is to follow the
principles of domain-driven design. In this regard, for example, each domain
could have its own `key`. If you need more granular services, you should use
multiple keys inside the same domain. The principle is to ensure distinct keys
for a distinct set of messages. In other words, keys should represent a
distinct set of requests.

Please refer to [Creating the arbitration service]
(https://github.com/dashersw/cote#creating-the-arbitration-service) for an
example of keys in action.

`key`s are given as parameters to the configuration objects.

When deciding whether to create a connection to another service, cote components
make use of `key`s and `environment`s together. Therefore, two components with
exact same `environment`s with different `key`s wouldn't be able to communicate.

Think of it as `${environment}_${key}`.

#### Example

```js
const cote = require('cote');

const purchaseRequester = new cote.Requester({
    name: 'Purchase Requester',
    key: 'purchase',
});

const inventoryRequester = new cote.Requester({
    name: 'Inventory Requester',
    key: 'inventory',
});
```

Unlike `environment`s, `key`s can't be used as an environment variable or part
of cote's configuration, but rather, should be provided as part of the first
argument to a component.

### Namespaces

cote includes a [Sockend](#sockend) component that provides a direct channel to
the frontend. This is extremely powerful and with power, comes great
responsibility. Exposing all the `Responder`s and `Publisher`s in the backend
to your frontend application probably isn't a good idea. Therefore cote offers
`namespace`s, which map conveniently to `socket.io` namespaces.

To help increase the security of backend services, components with
different `namespace`s won't recognize each other and try to communicate. This
effectively segregates the front-facing components. In order to _allow_ a
component to talk to the frontend, you should use a `namespace` which shields
that service from the rest of the system. By incorporating multiple components
in a single service, you can basically create proxies and let your front-facing
components interact with the rest of the system in a secure way.

#### Example

`front-facing-service.js`

```js
const cote = require('cote');

const responder = new cote.Responder({
    name: 'Conversion Sockend Responder',
    namespace: 'conversion',
});

const conversionRequester = new cote.Requester({
    name: 'Conversion Requester',
    key: 'conversion backend',
});

responder.on('convert', (req, cb) => {
    conversionRequester.send(req.type, req, cb); // proxy the request
});
```

`backend-service.js`

```js
const cote = require('cote');

const responder = new cote.Responder({
    name: 'Conversion Responder',
    key: 'conversion backend',
});

const rates = { usd_eur: 0.91, eur_usd: 1.10 };

responder.on('convert', (req, cb) => {
    cb(null, req.amount * rates[`${req.from}_${req.to}`]);
});
```

Just like `key`s, `namespace`s can also only be utilized as part of the first
argument to a component.

### Multicast address

cote works either with IP multicast or IP broadcast, defaulting to broadcast. If
you wish to use multicast instead, you can pass in a `multicast` property with
the configuration object to cote. This will make sure that the discovery will
happen only with the given configuration.

In fact, this is the best way to segregate services, not in the application
layer but at the network layer. This will create the minimal number of gossip
messages and the biggest gains in terms of performance. Therefore, using
different multicast addresses is better than using different environments or
keys.

Much like `environment`s, multicast addresses can be specified either as an
environment variable or as part of the main configuration object to the cote
require's. They can also be given as part of the _second_ configuration object.

#### Example

As an environment variable:
```sh
COTE_MULTICAST_ADDRESS=239.1.11.111 node service.js
```

As part of cote's module configuration:

```js
const cote = require('cote')({ multicast: '239.1.11.111' });
```

As part of each component's discovery configuration:

```js
const cote = require('cote');

const req = new cote.Requester({ name: 'req' }, { multicast: '239.1.11.111' });
```

### Broadcast address
While multicast is good for segmentation, certain scenarios may require the
configuration be done over IP broadcast. In that case, broadcast address
configuration helps. Much like multicast configuration, cote supports 3
different ways of supplying broadcast configuration.

Multicast configuration has precedence over broadcast. Therefore, when both
configurations are applied, broadcast configuration will be ignored and
multicast configuration will take over.

Also, cote uses broadcast by default. Hence, if no configuration is provided,
the broadcast address will be set to `255.255.255.255`. If you want to use
broadcast, but have a different broadcast IP, you should configure it as shown
below.

#### Example

As an environment variable:
```sh
COTE_BROADCAST_ADDRESS=255.255.255.255 node service.js
```

As part of cote's module configuration:

```js
const cote = require('cote')({ broadcast: '255.255.255.255' });
```

As part of each component's discovery configuration:

```js
const cote = require('cote');

const req = new cote.Requester({ name: 'req' }, { broadcast: '255.255.255.255' });
```

### Controlling cote with environment variables

Here's a list of environment variables cote supports:

| Variable name               | Description |
| --------------------------: | :---------- |
| `COTE_ENV`                  | See [Environments](#environments).
| `COTE_MULTICAST_ADDRESS`    | See [Multicast address](#multicast-address).
| `COTE_BROADCAST_ADDRESS`    | See [Broadcast address](#broadcast-address).
| `COTE_USE_HOST_NAMES`       | In certain, extremely rare conditions, auto-discovery might fail due to components reporting wrong IP addresses. If you find out that is the case, you can command cote to use the reported host names instead.
| `COTE_DISCOVERY_REDIS`      | See [Using centralized discovery tools](#using-centralized-discovery-tools).
| `COTE_DISCOVERY_REDIS_URL`  | See [Using centralized discovery tools](#using-centralized-discovery-tools).
| `COTE_DISCOVERY_REDIS_HOST` | See [Using centralized discovery tools](#using-centralized-discovery-tools).
| `DISCOVERY_HOSTNAME`        | See [Using centralized discovery tools](#using-centralized-discovery-tools).
| `COTE_REQUEST_TIMEOUT`      | See [Requester Timeout](#timeout).
| `COTE_LOG`                  | Boolean. Whether to display hello and status logs for other discovered services. Has precedence over `COTE_STATUS_LOGS_ENABLED` and `COTE_HELLO_LOGS_ENABLED`.
| `COTE_HELLO_LOGS_ENABLED`   | Boolean. Whether to display hello logs from other discovered services.
| `COTE_STATUS_LOGS_ENABLED`  | Boolean. Whether to display status logs from other discovered services. Has precedence over `COTE_HELLO_LOGS_ENABLED`.
| `COTE_LOG_UNKNOWN_EVENTS`   | Boolean. Whether to log a message when a responder or subscriber receives an event that it has no listeners for. Defaults to true.
| `COTE_CHECK_INTERVAL`       | Integer. The interval for checking if a discovered service has sent a heartbeat since the last check.
| `COTE_HELLO_INTERVAL`       | Integer. The interval for sending a heartbeat hello signal. Should be less than `COTE_CHECK_INTERVAL`.
| `COTE_NODE_TIMEOUT`         | Integer. The timeout duration that determines if a service is unreachable and thus removed. Should be greater than `COTE_CHECK_INTERVAL`.
| `COTE_IGNORE_PROCESS`       | Boolean. Whether the services defined in this process should ignore other services from this process. This might be useful in a high-availability setup where one wants to enforce collaboration of services over the network, instead of local services within each process.

## Deploying with Docker Cloud (deprecated)

cote plays extremely well with Docker Cloud. Even if your cloud provider doesn't
support IP broadcast or multicast, you can still have the same functionality
with Docker Cloud's Weave overlay networks.

Just deploy your cote applications just like any other Node.js application and
even when your containers run in different machines on different continents, as
long as they share an overlay network — which Docker Cloud assigns by default
anyway — everything will work as expected.

Make sure to check out
[the e-commerce case study](https://github.com/dashersw/cote-workshop) that
implements a complete e-commerce application with microservices using
[cote](https://github.com/dashersw/cote). It features example Dockerfiles and
docker-compose configurations in addition to Docker Cloud configurations.

It also has a Docker Swarm configuration to get you started on using cote with
Docker Swarm, in any cloud environment.

## Using centralized discovery tools

cote is built to be zero-configuration, and relies on IP broadcast/multicast
to work. cloud providers don't support this functionality (and they won't)
out of the box. In these cases, one can use the Weave network overlay
integration. However, this may not be suitable for everyone, due to
varying reasons.

### Welcome redis

In these cases, in order to let cote work, we developed a plugin mechanism to
accommodate different solutions that can serve as the automated service
discovery tool. Currently, redis is supported out of the box, and cote
makes use of the [node_redis](https://github.com/NodeRedis/node_redis)
library, in case you want to use redis as the central discovery tool. If you
need to use anything other than redis, please open
[a new issue](https://github.com/dashersw/cote/issues/new) and we may be
able to help.

You should also set `DISCOVERY_HOSTNAME` to the **IP address**
of the container/instance since it defaults to machine's hostname which in
most cloud/docker setups is not routable.

### Configuring redis

cote aims to be as zero-conf as possible. Therefore, the discovery backend
should be invisible to the developer. Since IP broadcast/multicast
functionality is environment-specific, it makes sense to configure a
centralized solution via environment variables as well. This way, the
container deployment configurations such as Docker Swarm stack definitions
can make use of the additional redis backend functionality, while developers
can still use IP broadcast/multicast locally, with the same source code.

That's why cote uses environment variables that start with
`COTE_DISCOVERY_REDIS`. cote transforms any environment variable that
starts with `COTE_DISCOVERY_REDIS` to proper configuration for the
[node_redis](https://github.com/NodeRedis/node_redis) library. For example,
`COTE_DISCOVERY_REDIS_URL=redis` becomes `{ url: 'redis' }` and
`COTE_DISCOVERY_REDIS_HOST=redis COTE_DISCOVERY_REDIS_PORT=6379` becomes
`{ host: 'redis', port: '6379' }`.

| Variable name               | Description |
| --------------------------: | :---------- |
| `COTE_DISCOVERY_REDIS`        | If you are running redis on localhost, setting this variable to true will use the locally available redis at port 6379. If you need any other redis URL or host, you don't need to use this variable.
| `COTE_DISCOVERY_REDIS_URL`    | Sets the redis connection URL. Has to start with either `redis://` or `//`. Enables the redis plugin.
| `COTE_DISCOVERY_REDIS_HOST`   | Sets the redis connection host name. Enables the redis plugin.
| `COTE_DISCOVERY_REDIS_PORT`   | Sets the redis connection port. Enables the redis plugin.
| `DISCOVERY_HOSTNAME`          | This defaults to your machine's `hostname`. If this is not routable you need to set this to the routable IP address of this instance.

cote also supports other connection options supported by
[node_redis](https://github.com/NodeRedis/node_redis) in the same manner.

#### Example

As an environment variable:
```sh
COTE_DISCOVERY_REDIS_HOST=redis DISCOVERY_HOSTNAME=127.0.0.1 node service.js
```

As part of cote's module configuration:

```js
const cote = require('cote')({ redis: { host: 'redis' } });
```

As part of each component's discovery configuration:

```js
const cote = require('cote');

const req = new cote.Requester({ name: 'req' }, { redis: { host: 'redis' } });
```

# FAQ

## Is cote production-ready?

cote is battle-tested, solid and has been running in production across thousands
of services since its inception in 2013. cote follows
[Semantic Versioning](http://semver.org) and although it's production-ready, we
haven't released a version 1.0.0 yet. Although cote added many features in time,
there hasn't been a single breaking API change since the beginning, so we didn't
need to update the major version.

## Usage with PM2

Make sure you don't run any of your services in cluster mode. It messes up the
service discovery since it tries to load balance the UDP ports used internally
for this purpose.

To use Cote properly within PM2 cluster mode, server instances should only be instantiated once.
To do so, utilize `process.env.pm_id`, which will return a value between 0 and the total number of instances(N).  For example, if 10 instances of your app are running in cluster mode `pm2 start app.js -i 10`, `process.env.pm_id` will return a value of (0-9) inclusively.

```js
// In thise case, we choose only the third app instance (2 because it is zero based) to instantiate a "SERVER"
// any number from 0 through 9 can be used, instead of 2
if (process.env.pm_id == 2) {
   const cote = require('cote');
   const timeService = new cote.Responder({
      name: 'Time Service'
   });
   timeService.on('time', (req, cb) => {
     cb(new Date());
   });
}
```

## Running with cloud providers (AWS, DigitalOcean, etc)

Most cloud providers block IP broadcast and multicast, therefore you can't run
cote in a multi-host environment without special software for an overlay
network. For this purpose, Docker is the best tool. Deploy your application in
Docker containers and you can take advantage of its overlay networks. Users of
Docker Swarm can make use of the [Weave Net plugin](https://www.weave.works/docs/net/latest/plugin-v2/).
Weave also has [an addon](https://www.weave.works/docs/net/latest/kube-addon/) for
enabling multicast/broadcast for Kubernetes.

If you find the solutions with Docker Swarm and Kubernetes to be hard to get
started with, you can use redis as a centralized discovery tool. Check out
[Using centralized discovery tools](#using-centralized-discovery-tools) to
see how you can set up redis to work with cote.

# Contribution

cote is under constant development, and has several important issues still open.
We would therefore heavily appreciate if you headed to the
[project](https://github.com/dashersw/cote/projects/1) to see where we are in
the development, picked an issue of your taste and gave us a hand.

If you would like to see a feature implemented or want to contribute a new
feature, you are welcome to open an issue to discuss it and we will be more than
happy to help.

If you choose to make a contribution, please fork this repository, work on a
feature and submit a pull request. cote is the next level of microservices —
be part of the revolution.

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

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdashersw%2Fcote.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdashersw%2Fcote?ref=badge_large)
