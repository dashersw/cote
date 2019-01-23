import test from 'ava';
import r from 'randomstring';
import LogSuppress from '../lib/log-suppress';

LogSuppress.init(console);

const environment = r.generate();
const { DirectedRequester, Responder } = require('../')({ environment });

test.cb('Supports directed requests targeted at single responder using callbacks', (t) => {
    const key = r.generate();
    const namespace = r.generate();
    const subgroup = r.generate();

    const targetResponder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace, subgroup },
        { log: false });

    const wrongResponder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace },
        { log: false });

    const requester = new DirectedRequester(
        { name: `PBR ${t.title}: directed requester`,
          key,
          namespace }, { log: false });

    const args = [1, 2, 6];

    // Send the request twice. It should end up in the same Responder both times
    requester.send({ __subgroup: subgroup, type: 'test', args }, (res) => {
        t.deepEqual(res, args);
        requester.send({ __subgroup: subgroup, type: 'test', args }, (res) => {
            t.deepEqual(res, args);
            t.end();
        });
    });

    targetResponder.on('test', (req, cb) => {
        t.deepEqual(req.args, args);
        cb(req.args);
    });

    wrongResponder.on('test', (req, cb) => {
        t.fail('Not targeted responder should have never gotten a message');
        t.end();
    });
});

test('Supports directed requests targeted at multiple targeted requesters using promises', async (t) => {
    // Times to send requests, times/nrOfRequesters has to result in a just number
    const times = 10;
    const nrOfRequesters = 2;

    const key = r.generate();
    const namespace = r.generate();
    const subgroup = r.generate();
    const subgroup2 = r.generate();

    const responders = [];
    Array.from({ length: nrOfRequesters }).forEach(() => {
        const responder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace, subgroup },
            { log: false });
        responder.count = 0;
        responder.on('test', async (req) => {
            responder.count++;
            return req.args;
        });
        responders.push(responder);
    });

    // Normal responder without subgroup
    const wrongResponder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace },
        { log: false });
    wrongResponder.on('test', () => {
        t.fail('Not targeted responder should have never gotten a message');
    });

    // Responder in different subgroup
    const wrongResponder2 = new Responder({
        name: `PBR ${t.title}: directed responder`, key, namespace, subgroup: subgroup2,
        }, { log: false });
    wrongResponder2.on('test', () => {
        t.fail('Not targeted responder should have never gotten a message');
    });

    const requester = new DirectedRequester(
        { name: `PBR ${t.title}: directed requester`,
          key,
          namespace }, { log: false });

    const args = [1, 2, 6];
    // Send the request multiple times
    // It should end up in the both requesters somewhat
    // evenly distributed, but never in the wrong one
    for (let index = 0; index < times; index++) {
        await requester.send({ __subgroup: subgroup, type: 'test', args });
    }

    const totalRecieved = responders.reduce((accumulator, responder) => {
        // Both should have at least gotten one request
        t.true(responder.count > 0);
        return accumulator += responder.count;
    }, 0);

    t.is(totalRecieved, times);
});

test('Timeout works with directed requester', async (t) => {
    const key = r.generate();
    const namespace = r.generate();
    const subgroup = r.generate();

    const requester = new DirectedRequester({ name: `PBR ${t.title}: directed requester`, key, namespace, subgroup },
        { log: false });

    try {
        await requester.send({
            __subgroup: subgroup,
            __timeout: 1000,
            type: 'test',
            args: [1, 2, 6] });
        t.fail();
    } catch (error) {
        if (error.message.includes('Request timed out')) return t.pass();
        t.fail(error);
    }
});

test('Directed requester require a __subgroup parameter in the message body', async (t) => {
    const key = r.generate();
    const namespace = r.generate();
    const subgroup = r.generate();

    const requester = new DirectedRequester({ name: `PBR ${t.title}: directed requester`, key, namespace },
        { log: false });
    const responder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace, subgroup },
        { log: false });
    responder.on('test', async (req) => {
        return req.args;
    });

    // Promises
    try {
        await requester.send({
            type: 'test',
            args: [1, 2, 6] });
        t.fail();
    } catch (error) {
        t.true(error.message.includes('needs a "__subgroup" property'));
    }

    // Callback
    await new Promise((resolve) => {
        requester.send({
            type: 'test',
            args: [1, 2, 6] }, (err, res) => {
                t.true(err.message.includes('needs a "__subgroup" property'));
                resolve();
            });
    });
});
