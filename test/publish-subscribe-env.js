import test from 'ava';
import LogSuppress from 'log-suppress';
import async from 'async';

const { Publisher, Subscriber } = require('../src')({ environment: 'test' });
LogSuppress.init(console);

test('Supports environment', (t) => {
    t.is(Publisher.environment, 'test:');
    t.is(Subscriber.environment, 'test:');
});

test.cb('Supports simple pub&sub', (t) => {
    t.plan(2);

    const publisher = new Publisher({ name: 'publisher' });
    const subscriber = new Subscriber({ name: 'subscriber' });
    const subscriber2 = new Subscriber({ name: 'subscriber2' });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', done),
        (_) => publisher.publish('test', { args: [1, 2, 3] })
    );

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 3], 'Arguments should have been [1, 2, 3]');
        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(null, done)),
        (_) => t.end()
    );
});

test.cb('Supports keys', (t) => {
    let key = 'key 1';

    t.plan(2);

    let publisher = new Publisher({ name: 'keyed publisher', key });
    let subscriber = new Subscriber({ name: 'keyed subscriber', key });
    let subscriber2 = new Subscriber({ name: 'keyed subscriber2', key });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', done),
        (_) => publisher.publish('test', { args: [1, 2, 4] })
    );

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 4], 'Arguments should have been [1, 2, 4]');

        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(null, done)),
        (_) => t.end()
    );
});

test.cb('Supports namespaces', (t) => {
    let namespace = 'ns 1';

    t.plan(2);

    let publisher = new Publisher({ name: 'ns publisher', namespace });
    let subscriber = new Subscriber({ name: 'ns subscriber', namespace });
    let subscriber2 = new Subscriber({ name: 'ns subscriber2', namespace });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', done),
        (_) => publisher.publish('test', { args: [1, 2, 4] })
    );

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 4], 'Arguments should have been [1, 2, 4]');

        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(null, done)),
        (_) => t.end()
    );
});

test.cb('Supports keys & namespaces', (t) => {
    let key = 'key 2';
    let namespace = 'ns 2';

    t.plan(2);

    let publisher = new Publisher({ name: 'kns publisher', key, namespace });
    let subscriber = new Subscriber({ name: 'kns subscriber', key, namespace });
    let subscriber2 = new Subscriber({ name: 'kns subscriber2', key, namespace });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', done),
        (_) => publisher.publish('test', { args: [1, 2, 5] })
    );

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 5], 'Arguments should have been [1, 2, 5]');

        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(null, done)),
        (_) => t.end()
    );
});
