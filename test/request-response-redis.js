import test from 'ava';
import LogSuppress from '../lib/log-suppress';
import r from 'randomstring';
import sinon from 'sinon';

process.env.COTE_DISCOVERY_REDIS_HOST = 'localhost';

const { Requester, Responder } = require('../')();

LogSuppress.init(console);

test.cb(`Crash trying to use redis`, (t) => {
    t.plan(1);

    const key = r.generate();

    const requester = new Requester({ name: `${t.title}: ignore requester`, key });
    const responder = new Responder({ name: `${t.title}: ignore responder`, key });

        const originalListeners = process.listeners('uncaughtException');

    process.removeAllListeners('uncaughtException');

    process.on('uncaughtException', function(err) {
        if (err.message != 'Redis connection to localhost:6379 failed - connect ECONNREFUSED 127.0.0.1:6379') {
            originalListeners.forEach((l) => l(err));

            throw err;
        }

        t.pass();
        t.end();
    });
});
