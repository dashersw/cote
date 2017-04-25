import test from 'ava';
import LogSuppress from 'log-suppress';
import async from 'async';

var cote = require('../dist')();
// LogSuppress.init(console);

test.cb('classic publisher / subscriber', t => {
    var key = 'test 1';

    t.plan(2);

    var publisher = new cote.Publisher({ name: 'publisher', key });
    var subscriber = new cote.Subscriber({ name: 'subscriber', key });
    var subscriber2 = new cote.Subscriber({ name: 'subscriber2', key });

    publisher.on('ready', () => {
        async.each(
            [subscriber, subscriber2],
            (s, done) => s.on('connect', done),
            _ => publisher.publish('test', { args: [1, 2, 3] })
        );
    });

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 3], 'Arguments should have been [1, 2, 3]');
        done();
    }

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test', tester.bind(null, done)),
        _ => t.end()
    );
});


test.cb('Environment test', t => {
    var key = 'test 2';

    t.plan(4);

    var cote = require('..')({ environment: 'test' });

    var publisher = new cote.Publisher({ name: 'publisher', key });
    var subscriber = new cote.Subscriber({ name: 'subscriber', key });
    var subscriber2 = new cote.Subscriber({ name: 'subscriber2', key });

    publisher.on('ready', () => {
        async.each(
            [subscriber, subscriber2],
            (s, done) => s.on('connect', done),
            _ => publisher.publish('test env', { args: [1, 2, 4] })
        );
    });

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 4], 'Arguments should have been [1, 2, 4]');
        t.is(cote.Publisher.environment, 'test:');

        done();
    }

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test env', tester.bind(null, done)),
        _ => t.end()
    );
});

test.cb('Namespace test', t => {
    var key = 'test 2';
    var namespace = 'ns';

    t.plan(4);

    var cote = require('..')({ environment: 'test' });

    var publisher = new cote.Publisher({ name: 'publisher', key, namespace });
    var subscriber = new cote.Subscriber({ name: 'subscriber', key, namespace });
    var subscriber2 = new cote.Subscriber({ name: 'subscriber2', key, namespace });

    publisher.on('ready', () => {
        async.each(
            [subscriber, subscriber2],
            (s, done) => s.on('connect', done),
            _ => publisher.publish('test env ns', { args: [1, 2, 5] })
        );
    });

    const tester = (done, req) => {
        t.deepEqual(req.args, [1, 2, 5], 'Arguments should have been [1, 2, 5]');
        t.is(cote.Publisher.environment, 'test:');

        done();
    }

    async.each(
        [subscriber, subscriber2],
        (s, done) => s.on('test env ns', tester.bind(null, done)),
        _ => t.end()
    );
});
