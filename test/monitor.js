import test from 'ava';
import r from 'randomstring';
import async from 'async';
const environment = r.generate();

const { Requester, Responder, Monitor } = require('../')({ environment, statusInterval: 100 });

test.cb('Print to screen', (t) => {
    process.stdout.cork();

    const requester = new Requester({ name: `${t.title}: monitor requester` });
    const responder = new Responder({ name: `${t.title}: monitor responder` });

    const monitor = new Monitor({ name: `${t.title}: monitor` }, { interval: 100 });
    const monitor2 = new Monitor({ name: `${t.title}: monitor2` });

    monitor2.on('status', (s) => console.log(s));
    monitor.on('status', (s) => console.log(s));
    async.each(
        [monitor, monitor2],
        (m, done) => m.once('status', () => done()),
        () => t.end()
    );
});

test.cb('Monitor throws unknown error', (t) => {
    t.plan(1);

    const key = r.generate();

    const originalListeners = process.listeners('uncaughtException');

    process.removeAllListeners('uncaughtException');

    process.on('uncaughtException', function(err) {
        if (err.message != 'unknown error') {
            originalListeners.forEach((l) => l(err));

            throw err;
        }

        t.pass();
        t.end();
    });

    const monitor = new Monitor({ name: `${t.title}: error throwing monitor`, key });
    monitor.sock.sock.on('bind', () => monitor.sock.sock.server.emit('error', new Error('unknown error')));
});
