import test from 'ava';
import LogSuppress from 'log-suppress';

let { Requester, Responder } = require('../src')({ environment: 'test' });

LogSuppress.init(console);

test('Supports environment', (t) => {
    t.is(Requester.environment, 'test:');
    t.is(Responder.environment, 'test:');
});

test.cb('Supports simple req&res', (t) => {
    t.plan(1);

    let requester = new Requester({ name: 'simple requester' });
    let responder = new Responder({ name: 'simple responder' });

    requester.send({ type: 'test', args: [1, 2, 3] });

    responder.on('test', (req) => {
        t.deepEqual(req.args, [1, 2, 3], 'Arguments should have been [1, 2, 3]');
        t.end();
    });
});

test.cb('Supports keys', (t) => {
    let key = 'key 1';

    let requester = new Requester({ name: 'keyed requester', key });
    let responder = new Responder({ name: 'keyed responder', key });

    requester.send({ type: 'test', args: [1, 2, 4] });

    responder.on('test', (req) => {
        t.deepEqual(req.args, [1, 2, 4], 'Arguments should have been [1, 2, 4]');
        t.end();
    });
});

test.cb('Supports namespaces', (t) => {
    let namespace = 'ns 1';

    let requester = new Requester({ name: 'ns requester', namespace });
    let responder = new Responder({ name: 'ns responder', namespace });

    requester.send({ type: 'test', args: [1, 2, 5] });

    responder.on('test', (req) => {
        t.deepEqual(req.args, [1, 2, 5], 'Arguments should have been [1, 2, 5]');
        t.end();
    });
});

test.cb('Supports keys & namespaces', (t) => {
    let key = 'key 2';
    let namespace = 'ns 2';

    let requester = new Requester({ name: 'kns requester', key, namespace });
    let responder = new Responder({ name: 'kns responder', key, namespace });

    requester.send({ type: 'test', args: [1, 2, 6] });

    responder.on('test', (req) => {
        t.deepEqual(req.args, [1, 2, 6], 'Arguments should have been [1, 2, 6]');
        t.end();
    });
});
