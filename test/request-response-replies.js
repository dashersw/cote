import test from 'ava';
import LogSuppress from 'log-suppress';
import r from 'randomstring';

const environment = r.generate();
let { Requester, Responder } = require('../src')({ environment });

LogSuppress.init(console);

test.cb('Supports req&res callback', (t) => {
    t.plan(1);
    let key = r.generate();

    let requester = new Requester({ name: `${t.title}: cb requester`, key });
    let responder = new Responder({ name: `${t.title}: cb responder`, key });

    requester.send({ type: 'test', args: [1, 2, 3] }, (err, res) => {
        if (err) t.fail(err, `shouldn't produce error`);

        t.deepEqual(res, [1, 2, 3]);

        t.end();
    });

    responder.on('test', (req, cb) => cb(null, req.args));
});

test('Supports req&res promises success', (t) => {
    let key = r.generate();

    let requester = new Requester({ name: `${t.title}: promise requester`, key });
    let responder = new Responder({ name: `${t.title}: promise responder`, key });

    responder.on('test', (req) => Promise.resolve(req.args));

    return requester.send({ type: 'test', args: [1, 2, 4] })
        .then((res) => t.deepEqual(res, [1, 2, 4]));
});

test('Supports req&res promises fail', (t) => {
    let key = r.generate();

    let requester = new Requester({ name: `${t.title}: promise requester`, key });
    let responder = new Responder({ name: `${t.title}: promise responder`, key });

    responder.on('test', (req) => Promise.reject(req.args));

    return requester.send({ type: 'test', args: [1, 2, 5] })
        .catch((err) => t.deepEqual(err, [1, 2, 5]));
});
