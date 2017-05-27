import test from 'ava';
import LogSuppress from 'log-suppress';
import async from 'async';
import r from 'randomstring';

const environment = r.generate();
const { Publisher, Subscriber } = require('../src')({ environment });

// LogSuppress.init(console);

test('Supports environment', (t) => {
    t.is(Publisher.environment, `${environment}:`);
    t.is(Subscriber.environment, `${environment}:`);
});

test.cb('Supports simple pub&sub with env', (t) => {
    t.plan(2);

    const publisher = new Publisher({ name: `${t.title}: publisher` });
    const subscriber = new Subscriber({ name: `${t.title}: subscriber` });
    const subscriber2 = new Subscriber({ name: `${t.title}: subscriber2` });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', done),
        (_) => publisher.publish('test', { args: [1, 2, 3] })
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
        }
    );
});

test.cb('Supports keys with env', (t) => {
    let key = r.generate();

    t.plan(2);

    let publisher = new Publisher({ name: `${t.title}: keyed publisher`, key });
    let subscriber = new Subscriber({ name: `${t.title}: keyed subscriber`, key });
    let subscriber2 = new Subscriber({ name: `${t.title}: keyed subscriber2`, key });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', done),
        (_) => publisher.publish('test', { args: [1, 2, 4] })
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
        }
    );
});

test.cb('Supports namespaces with env', (t) => {
    let namespace = r.generate();

    t.plan(2);

    let publisher = new Publisher({ name: `${t.title}: ns publisher`, namespace });
    let subscriber = new Subscriber({ name: `${t.title}: ns subscriber`, namespace });
    let subscriber2 = new Subscriber({ name: `${t.title}: ns subscriber2`, namespace });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', done),
        (_) => publisher.publish('test', { args: [1, 2, 4] })
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
        }
    );
});

test.cb('Supports keys & namespaces with env', (t) => {
    let key = r.generate();
    let namespace = r.generate();

    t.plan(2);

    let publisher = new Publisher({ name: `${t.title}: kns publisher`, key, namespace });
    let subscriber = new Subscriber({ name: `${t.title}: kns subscriber`, key, namespace });
    let subscriber2 = new Subscriber({ name: `${t.title}: kns subscriber2`, key, namespace });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', done),
        (_) => publisher.publish('test', { args: [1, 2, 5] })
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
        }
    );
});
