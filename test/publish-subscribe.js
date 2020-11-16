const test = require('ava');
const LogSuppress = require('../lib/log-suppress');
const async = require('async');
const r = require('randomstring');
const sinon = require('sinon');
const portfinder = require('portfinder');

// eslint-disable-next-line
const colors = require('colors');

const { Publisher, Subscriber } = require('../')();

LogSuppress.init(console);

test('Has no environment', (t) => {
    t.is(Publisher.environment, '');
    t.is(Subscriber.environment, '');
});

test.cb('Supports simple pub&sub', (t) => {
    t.plan(2);

    const publisher = new Publisher({ name: `${t.title}: publisher` });
    const subscriber = new Subscriber({ name: `${t.title}: subscriber` });
    const subscriber2 = new Subscriber({ name: `${t.title}: subscriber2` });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', () => setTimeout(done, 100)),
        (_) => publisher.publish('test', { args: [1, 2, 3] }),
    );

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 3]);
        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(null, done)),
        (_) => {
            [publisher, subscriber, subscriber2].forEach((c) => c.close());

            t.end();
        },
    );
});

test.cb('Supports keys', (t) => {
    const key = r.generate();

    t.plan(2);

    const publisher = new Publisher({ name: `${t.title}: keyed publisher`, key });
    const subscriber = new Subscriber({ name: `${t.title}: keyed subscriber`, key });
    const subscriber2 = new Subscriber({ name: `${t.title}: keyed subscriber2`, key });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', () => setTimeout(done, 100)),
        (_) => publisher.publish('test', { args: [1, 2, 4] }),
    );

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 4]);
        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(null, done)),
        (_) => {
            [publisher, subscriber, subscriber2].forEach((c) => c.close());

            t.end();
        },
    );
});

test.cb('Supports namespaces', (t) => {
    const namespace = r.generate();

    t.plan(2);

    const publisher = new Publisher({ name: `${t.title}: ns publisher`, namespace });
    const subscriber = new Subscriber({ name: `${t.title}: ns subscriber`, namespace });
    const subscriber2 = new Subscriber({ name: `${t.title}: ns subscriber2`, namespace });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', () => setTimeout(done, 100)),
        (_) => process.nextTick(() => publisher.publish('test', { args: [1, 2, 5] })),
    );

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 5]);

        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(null, done)),
        (_) => {
            [publisher, subscriber, subscriber2].forEach((c) => c.close());

            t.end();
        },
    );
});

test.cb('Supports keys & namespaces', (t) => {
    const key = r.generate();
    const namespace = r.generate();

    t.plan(2);

    const publisher = new Publisher({ name: `${t.title}: kns publisher`, key, namespace });
    const subscriber = new Subscriber({ name: `${t.title}: kns subscriber`, key, namespace });
    const subscriber2 = new Subscriber({ name: `${t.title}: kns subscriber2`, key, namespace });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', () => setTimeout(done, 100)),
        (_) => publisher.publish('test', { args: [1, 2, 6] }),
    );

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 6]);

        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(null, done)),
        (_) => {
            // [publisher, subscriber, subscriber2].forEach((c) => c.close());

            t.end();
        },
    );
});

test.cb('Publisher throws unknown error', (t) => {
    t.plan(1);

    const key = r.generate();

    const originalListeners = process.listeners('uncaughtException');

    process.removeAllListeners('uncaughtException');

    process.on('uncaughtException', function(err) {
        if (err.message != 'unknown error') {
            originalListeners.forEach((l) => l(err));

            throw err;
        }

        t.pass();
        t.end();
    });

    const publisher = new Publisher({ name: `${t.title}: error throwing publisher`, key });
    publisher.sock.sock.on('bind', () => publisher.sock.sock.server.emit('error', new Error('unknown error')));
});

test.cb('Does not try to reconnect twice to the same publisher', (t) => {
    const key = r.generate();

    const subscriber = new Subscriber({ name: `${t.title}: keyed subscriber`, key });
    const publisher = new Publisher({ name: `${t.title}: keyed publisher`, key });

    publisher.sock.sock.on('connect', () => {
        const stub = sinon.stub(publisher.discovery, 'hello');

        setTimeout(() => {
            stub.restore();

            subscriber.on('cote:added', (obj) => {
                const address = Subscriber.useHostNames ? obj.hostName : obj.address;

                const alreadyConnected = subscriber.sock.sock.socks.some((s) =>
                    (Subscriber.useHostNames ? s._host == obj.hostName : s.remoteAddress == address) &&
                    s.remotePort == obj.advertisement.port);

                t.true(alreadyConnected);
                t.end();
            });
        }, 8000);
    });
});

test.cb('Publisher reruns portfinder on EADDRINUSE error', (t) => {
    const key = r.generate();

    const publisher = new Publisher({ name: `${t.title}: keyed publisher`, key });

    const listener = function() {
        publisher.sock.sock.removeListener('bind', listener);
        sinon.spy(portfinder, 'getPort');

        t.false(portfinder.getPort.calledOnce);
        publisher.sock.sock.server.emit('error', { code: 'EADDRINUSE' });
        t.true(portfinder.getPort.calledOnce);

        portfinder.getPort.restore();
        t.pass();
        t.end();
    };
    publisher.sock.sock.on('bind', listener);
});

test.cb('Subscriber should log missing event listener', (t) => {
    t.plan(2);

    const key = r.generate();

    const publisher = new Publisher({ name: `${t.title}: missing listener publisher`, key });
    const subscriber = new Subscriber(
        { name: `${t.title}: missing listener subscriber`, key },
        { log: false, logUnknownEvents: true },
    );
    const subscriber2 = new Subscriber(
        { name: `${t.title}: missing listener subscriber2`, key },
        { log: false, logUnknownEvents: true },
    );

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', () => setTimeout(done, 100)),
        (_) => publisher.publish('missing', { args: [1, 2, 3] }),
    );

    async.each(
        [subscriber, subscriber2],
        (s, done) => {
            s.discovery.log = function(...args) {
                t.deepEqual([[this.advertisement.name, '>', 'No listeners found for event: missing'.yellow]], args);
                done();
            };
        },
        (_) => {
            [publisher, subscriber, subscriber2].forEach((c) => c.close());

            t.end();
        },
    );
});
