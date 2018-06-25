import test from 'ava';
import LogSuppress from '../lib/log-suppress';
import r from 'randomstring';
import async from 'async';

const environment = r.generate();
const { TimeBalancedRequester, Responder } = require('../')({ environment });

LogSuppress.init(console);

test.cb('Supports multiple responders with callback', (t) => {
    const key = r.generate();
    t.plan(30);

    const requester = new TimeBalancedRequester({ name: `${t.title}: keyed requester`, key });
    const responder = new Responder({ name: `${t.title}: keyed responder`, key });
    const responder2 = new Responder({ name: `${t.title}: keyed responder2`, key });
    const responder3 = new Responder({ name: `${t.title}: keyed responder3`, key });

    const responders = [responder, responder2, responder3];

    responders.forEach((r) => r.on('test', (req, cb) => {
        setTimeout(() => cb(req.args), Math.random() * 1000 + 50);
    }));
    async.timesLimit(30, 5, (time, done) => {
        requester.send({ type: 'test', args: [1, 2, time] }, (res) => {
            t.pass();
            done();
        });
    }, (err, results) => t.end());
});

test.cb('Supports multiple responders with callback and disconnection', (t) => {
    const key = r.generate();

    const requester = new TimeBalancedRequester({ name: `${t.title}: keyed requester`, key });
    const responder = new Responder({ name: `${t.title}: keyed responder`, key });
    const responder2 = new Responder({ name: `${t.title}: keyed responder2`, key });
    const responder3 = new Responder({ name: `${t.title}: keyed responder3`, key });

    const responders = [responder, responder2, responder3];

    responders.forEach((r) => r.on('test', (req, cb) => {
        setTimeout(() => cb(req.args), Math.random() * 1000 + 50);
    }));

    async.timesLimit(30, 5, (time, done) => {
        if (time == 7) responder2.close();
        if (time == 29) {
            return t.end();
        }
        requester.send({ type: 'test', args: [1, 2, time] }, (res) => done());
    }, (err, results) => { });
});
