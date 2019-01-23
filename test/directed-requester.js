import test from 'ava';
import r from 'randomstring';
import LogSuppress from '../lib/log-suppress';

LogSuppress.init(console);

const environment = r.generate();
const { DirectedRequester, Responder } = require('../')({ environment });

test.cb('Supports directed requests using callbacks', (t) => {
    const key = r.generate();
    const namespace = r.generate();

    const requester = new DirectedRequester(
        { name: `PBR ${t.title}: directed requester`, key, namespace });
    const responders = [];

    Array.from({ length: 10 }).forEach(() => {
        responders.push(new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace }));
    });

    let randomResponder = responders[Math.floor(Math.random() * responders.length)];

    randomResponder.sock.on('bind', () => {
        const args = [1, 2, 6];
        requester.send({ responderId: randomResponder.discovery.me.id, type: 'test', args }, (res) => {
            t.deepEqual(res, args);
            t.end();
        });

        randomResponder.on('test', (req, cb) => {
            t.deepEqual(req.args, args);
            cb(req.args);
        });
    });
});

test.cb('Supports directed requests using promises', (t) => {
    const key = r.generate();
    const namespace = r.generate();

    const requester = new DirectedRequester({ name: `PBR ${t.title}: directed requester`, key, namespace });
    const responders = [];

    Array.from({ length: 10 }).forEach(() => {
        responders.push(new Responder({ name: `PBR ${t.title}: directed responder`, key, namespace }));
    });

    let randomResponder = responders[Math.floor(Math.random() * responders.length)];

    randomResponder.sock.on('bind', async () => {
        const args = [1, 2, 6];

        randomResponder.on('test', async (req) => {
            t.deepEqual(req.args, args);
            return req.args;
        });

        try {
          const res = await requester.send({
              responderId: randomResponder.discovery.me.id,
              type: 'test',
              args });
          t.deepEqual(args, res);
          t.end();
        } catch (error) {
            t.fail(error);
            t.end();
        }
    });
});

test('Timeout works with directed requester', async (t) => {
    const key = r.generate();
    const namespace = r.generate();
    const randomId = r.generate();

    const requester = new DirectedRequester({ name: `PBR ${t.title}: directed requester`, key, namespace });

    try {
        await requester.send({
            __timeout: 2000,
            responderId: randomId,
            type: 'test',
            args: [1, 2, 6] });
        t.fail();
    } catch (error) {
        if (error.message.includes('Request timed out')) return t.pass();
        t.fail(error);
    }
});
