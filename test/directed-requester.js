import test from 'ava';
import r from 'randomstring';
import LogSuppress from '../lib/log-suppress';

LogSuppress.init(console);

const environment = r.generate();
const { Requester, Responder } = require('../')({ environment });

test.cb('Supports directed requests targeted at single responder using callbacks', (t) => {
    const key = r.generate();
    const namespace = r.generate();
    const subset = r.generate();

    const targetResponder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace, subset },
        { log: false });

    const wrongResponder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace },
        { log: false });

    const requester = new Requester(
        { name: `PBR ${t.title}: directed requester`,
          key,
          namespace }, { log: false });

    const args = [1, 2, 6];

    // Send the request twice. It should end up in the same Responder both times
    // Also make sure the wrongResponder is connected
    wrongResponder.sock.on('bind', () => {
        requester.send({ __subset: subset, type: 'test', args }, (res) => {
            t.deepEqual(res, args);
            requester.send({ __subset: subset, type: 'test', args }, (res) => {
                t.deepEqual(res, args);
                t.end();
            });
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
    const subset = r.generate();
    const subset2 = r.generate();

    const responders = [];
    Array.from({ length: nrOfRequesters }).forEach(() => {
        const responder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace, subset },
            { log: false });
        responder.count = 0;
        responder.on('test', async (req) => {
            responder.count++;
            return req.args;
        });
        responders.push(responder);
    });

    // Normal responder without subset
    const wrongResponder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace },
        { log: false });
    wrongResponder.on('test', () => {
        t.fail('Not targeted responder should have never gotten a message');
    });

    // Responder in different subset
    const wrongResponder2 = new Responder({
        name: `PBR ${t.title}: directed responder`, key, namespace, subset: subset2,
        }, { log: false });
    wrongResponder2.on('test', () => {
        t.fail('Not targeted responder should have never gotten a message');
    });

    const requester = new Requester(
        { name: `PBR ${t.title}: directed requester`,
          key,
          namespace }, { log: false });

    const args = [1, 2, 6];
    // Send the request multiple times
    // It should end up in the both requesters somewhat
    // evenly distributed, but never in the wrong one
    for (let index = 0; index < times; index++) {
        await requester.send({ __subset: subset, type: 'test', args });
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
    const subset = r.generate();

    const requester = new Requester({ name: `PBR ${t.title}: directed requester`, key, namespace, subset },
        { log: false });

    try {
        await requester.send({
            __subset: subset,
            __timeout: 1000,
            type: 'test',
            args: [1, 2, 6] });
        t.fail();
    } catch (error) {
        if (error.message.includes('Request timed out')) return t.pass();
        t.fail(error);
    }
});

test('Queuing works with directed requester', async (t) => {
    const key = r.generate();
    const namespace = r.generate();
    const subset = r.generate();
    const subset2 = r.generate();
    const args = [1, 2, 6];
    let requester = new Requester({ name: `PBR ${t.title}: directed requester`, key, namespace, subset },
        { log: false, checkInterval: 500 });

    let responder = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace, subset },
        { log: false, checkInterval: 500 });
    responder.on('test', async (req) => {
        return req.args;
    });

    // Make sure it does not sent to the wrong responder in a different subset
    // when there are no other responders available
    let responder2 = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace, subset: subset2 },
        { log: false, checkInterval: 500 });
    responder2.on('test', async (req) => {
        t.fail();
    });

    try {
        // Send an receive
        const res = await requester.send({
            __subset: subset,
            type: 'test',
            args });
        t.deepEqual(res, args);

        // Destroy responder and wait for heartbeat
        responder.close();
        await wait(501);

        // Next request
        let pending = true;
        const promise = requester.send({
            __subset: subset,
            type: 'test',
            args })
        .then((res) => {
            pending = false;
            return res;
        });
        await wait(500);
        t.true(pending);

        // Recreate responder
        const responder2 = new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace, subset },
            { log: false });
        responder2.on('test', async (req) => {
            return req.args;
        });

        // make sure it received the message
        const res2 = await promise;
        t.false(pending);
        t.deepEqual(res2, args);
    } catch (error) {
        t.fail(error);
    }
});

function wait(ms) {
    return new Promise((res) => {
        setTimeout(() => {
            res();
        }, ms);
    });
}
