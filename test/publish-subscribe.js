import test from 'ava';
import LogSuppress from 'log-suppress';

var cote = require('..')();
// LogSuppress.init(console);

test.cb('classic publisher / subscriber', t => {
    var key = 'test 1';

    var publisher = new cote.Publisher({ name: 'publisher', key });
    var subscriber = new cote.Subscriber({ name: 'subscriber', key });

    publisher.on('ready', () => {
        subscriber.on('connect', _ => {
            publisher.publish('test', { args: [1, 2, 3] });
        });
    });

    subscriber.on('test', req => {
        console.log('def', req);

        t.deepEqual(req.args, [1, 2, 3], 'Arguments should have been [1, 2, 3]');
        t.end();
    });
});


test.cb('Environment test', t => {
    var key = 'test 2';

    var cote = require('..')({environment: 'test'});

    var publisher = new cote.Publisher({ name: 'publisher', key });
    var subscriber = new cote.Subscriber({ name: 'subscriber', key });

    publisher.on('ready', () => {
        subscriber.on('connect', _ => {
            publisher.publish('test', { args: [1, 2, 4] });
        });
    });

    subscriber.on('test', req => {
        console.log('env', req);

        t.deepEqual(req.args, [1, 2, 4], 'Arguments should have been [1, 2, 4]');
        t.is(cote.Publisher.environment, 'test:');
        t.end();
    });
});

test.cb('Namespace test', t => {
    var key = 'test 2';
    var namespace = 'ns';

    var cote = require('..')({environment: 'test'});

    var publisher = new cote.Publisher({ name: 'publisher', key, namespace });
    var subscriber = new cote.Subscriber({ name: 'subscriber', key, namespace });

    publisher.on('ready', () => {
        subscriber.on('connect', _ => {
            publisher.publish('test', { args: [1, 2, 5] });
        });
    });

    subscriber.on('test', req => {
        console.log('ns', req);
        t.deepEqual(req.args, [1, 2, 5], 'Arguments should have been [1, 2, 5]');
        t.is(cote.Publisher.environment, 'test:');
        t.end();
    });
});
