import test from 'ava';
import LogSuppress from '../lib/log-suppress';
import async from 'async';
import r from 'randomstring';

const environment = r.generate();

process.env.COTE_ENV = environment;
process.env.COTE_USE_HOST_NAMES = true;
process.env.COTE_MULTICAST_ADDRESS = process.env.COTE_MULTICAST_ADDRESS || '239.1.11.111';
process.env.DOCKERCLOUD_IP_ADDRESS = true;

const { Publisher, Subscriber } = require('../');

LogSuppress.init(console);

test('Supports environment', (t) => {
    t.is(Publisher.environment, `${environment}:`);
    t.is(Subscriber.environment, `${environment}:`);
});

test.cb('Supports simple pub&sub with env vars', (t) => {
    t.plan(2);

    const publisher = new Publisher({ name: `${t.title}: publisher` });
    const subscriber = new Subscriber({ name: `${t.title}: subscriber` });
    const subscriber2 = new Subscriber({ name: `${t.title}: subscriber2` });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', () => setTimeout(done, 100)),
        (_) => publisher.publish('test', { args: [1, 2, 3] })
    );

    const tester = function(done, req) {
        t.deepEqual(req.args, [1, 2, 3]);
        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(s, done)),
        (_) => t.end()
    );
});

test.cb('Supports keys with env vars', (t) => {
    const key = r.generate();

    t.plan(2);

    const publisher = new Publisher({ name: `${t.title}: keyed publisher`, key });
    const subscriber = new Subscriber({ name: `${t.title}: keyed subscriber`, key });
    const subscriber2 = new Subscriber({ name: `${t.title}: keyed subscriber2`, key });

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', () => setTimeout(done, 100)),
        (_) => publisher.publish('test', { args: [1, 2, 4] })
    );

    const tester = function(done, req) {
        t.deepEqual(req.args, [1, 2, 4]);

        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(s, done)),
        (_) => t.end()
    );
});

test.cb('Supports namespaces with env vars', (t) => {
    const namespace = r.generate();

    t.plan(2);

    const publisher = new Publisher({ name: `${t.title}: ns publisher`, namespace });
    const subscriber = new Subscriber({ name: `${t.title}: ns subscriber`, namespace });
    const subscriber2 = new Subscriber({ name: `${t.title}: ns subscriber2`, namespace });

    const tester = function(done, req) {
        t.deepEqual(req.args, [1, 2, 5]);

        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', () => setTimeout(done, 100)),
        (_) => publisher.publish('test', { args: [1, 2, 5] })
    );

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(s, done)),
        (_) => t.end()
    );
});

test.cb('Supports keys & namespaces with env vars', (t) => {
    const key = r.generate();
    const namespace = r.generate();

    t.plan(2);

    const publisher = new Publisher({ name: `${t.title}: kns publisher`, key, namespace });
    const subscriber = new Subscriber({ name: `${t.title}: kns subscriber`, key, namespace });
    const subscriber2 = new Subscriber({ name: `${t.title}: kns subscriber2`, key, namespace });

    const tester = function(done, req) {
        t.deepEqual(req.args, [1, 2, 6]);

        done();
    };

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(s, done)),
        (_) => t.end()
    );

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.sock.sock.on('connect', () => setTimeout(done, 100)),
        (_) => publisher.publish('test', { args: [1, 2, 6] })
    );
});
