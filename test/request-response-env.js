import test from 'ava';
import LogSuppress from '../lib/log-suppress';
import r from 'randomstring';

const environment = r.generate();
const { Requester, Responder } = require('../')({ environment });

LogSuppress.init(console);

test('Supports environment', (t) => {
    t.is(Requester.environment, `${environment}:`);
    t.is(Responder.environment, `${environment}:`);
});

test.cb('Supports simple req&res', (t) => {
    t.plan(1);

    const requester = new Requester({ name: `${t.title}: simple requester` });
    const responder = new Responder({ name: `${t.title}: simple responder` });

    requester.send({ type: 'test', args: [1, 2, 3] });

    responder.on('test', (req) => {
        t.deepEqual(req.args, [1, 2, 3]);
        t.end();
    });
});

test.cb('Supports keys', (t) => {
    const key = r.generate();

    const requester = new Requester({ name: `${t.title}: keyed requester`, key });
    const responder = new Responder({ name: `${t.title}: keyed responder`, key });

    requester.send({ type: 'test', args: [1, 2, 4] });

    responder.on('test', (req) => {
        t.deepEqual(req.args, [1, 2, 4]);
        t.end();
    });
});

test.cb('Supports namespaces', (t) => {
    const namespace = r.generate();

    const requester = new Requester({ name: `${t.title}: ns requester`, namespace });
    const responder = new Responder({ name: `${t.title}: ns responder`, namespace });

    requester.send({ type: 'test', args: [1, 2, 5] });

    responder.on('test', (req) => {
        t.deepEqual(req.args, [1, 2, 5]);
        t.end();
    });
});

test.cb('Supports keys & namespaces', (t) => {
    const key = r.generate();
    const namespace = r.generate();

    const requester = new Requester({ name: `RRE ${t.title}: kns requester`, key, namespace });
    const responder = new Responder({ name: `RRE ${t.title}: kns responder`, key, namespace });

    requester.send({ type: 'test', args: [1, 2, 6] });

    responder.on('test', (req) => {
        t.deepEqual(req.args, [1, 2, 6]);
        t.end();
    });
});
