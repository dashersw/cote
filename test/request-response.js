import test from 'ava';
import LogSuppress from '../lib/log-suppress';
import r from 'randomstring';
import sinon from 'sinon';
import portfinder from 'portfinder';

// eslint-disable-next-line
const colors = require('colors');

const { Requester, Responder } = require('../')();

LogSuppress.init(console);

test('Has no environment', (t) => {
    t.is(Requester.environment, '');
    t.is(Responder.environment, '');
});

test.cb(`Ignore messages that don't include type`, (t) => {
    t.plan(1);

    const key = r.generate();

    const requester = new Requester({ name: `${t.title}: ignore requester`, key });
    const responder = new Responder({ name: `${t.title}: ignore responder`, key });

    requester.send('This should be ignored');

    responder.sock.on('message', (req) => {
        t.falsy(req.type);
        t.end();
    });
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

    const requester = new Requester({ name: `RR ${t.title}: kns requester`, key, namespace });
    const responder = new Responder({ name: `RR ${t.title}: kns responder`, key, namespace });

    requester.send({ type: 'test', args: [1, 2, 6] });

    responder.on('test', (req) => {
        t.deepEqual(req.args, [1, 2, 6]);
        t.end();
    });
});

test.cb('Responder throws unknown error', (t) => {
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

    const responder = new Responder({ name: `${t.title}: error throwing responder`, key });
    responder.sock.on('bind', () => responder.sock.server.emit('error', new Error('unknown error')));
});

test.cb('Does not try to reconnect twice to the same responder', (t) => {
    const key = r.generate();

    Requester.setUseHostNames(true);
    const requester = new Requester({ name: `${t.title}: keyed requester`, key });
    const responder = new Responder({ name: `${t.title}: keyed responder`, key });

    responder.sock.on('connect', () => {
        const stub = sinon.stub(responder.discovery, 'hello');

        setTimeout(() => {
            stub.restore();

            requester.on('cote:added', (obj) => {
                const address = Requester.useHostNames ? obj.hostName : obj.address;

                const alreadyConnected = requester.sock.socks.some((s) =>
                    (Requester.useHostNames ? s._host == obj.hostName : s.remoteAddress == address) &&
                    s.remotePort == obj.advertisement.port);

                t.true(alreadyConnected);
                t.end();
            });
        }, 8000);
    });
});

test.cb('Responder reruns portfinder on EADDRINUSE error', (t) => {
    const key = r.generate();

    const responder = new Responder({ name: `${t.title}: keyed publisher`, key });

    const listener = function() {
        responder.sock.removeListener('bind', listener);
        sinon.spy(portfinder, 'getPort');

        t.false(portfinder.getPort.calledOnce);
        responder.sock.server.emit('error', { code: 'EADDRINUSE' });
        t.true(portfinder.getPort.calledOnce);

        portfinder.getPort.restore();
        t.pass();
        t.end();
    };
    responder.sock.on('bind', listener);
});

test.cb('Responder should log missing event listener', (t) => {
    t.plan(1);

    const key = r.generate();

    const requester = new Requester({ name: `${t.title}: missing listener requester`, key });
    const responder = new Responder({ name: `${t.title}: missing listener responder`, key },
        { log: false, logUnknownEvents: true });

    const startDiscovery = responder.startDiscovery;
    responder.startDiscovery = function() {
        startDiscovery.call(responder);

        responder.discovery.log = function(...args) {
            t.deepEqual([[this.advertisement.name, '>', 'No listeners found for event: missing'.yellow]], args);
            t.end();
        };
    };

    requester.send({ type: 'missing', message: 'This should be ignored' });
});


test.cb('Responder supports listening for wildcard events', (t) => {
    t.plan(3);

    const key = r.generate();

    const responder = new Responder({ name: `${t.title}: wildcard responder`, key });

    responder.on('*', async (request) => {
        // Ignore internal events
        if (!request.type) {
            return;
        }
        t.deepEqual(request.type, 'question');
        t.deepEqual(request.value, [1, 2, 3]);
        return [4, 5, 6];
    });

    // Wait a second, then create a requester and send a request

    setTimeout(async function() {
        const requester = new Requester({ name: `${t.title}: wildcard requester`, key });

        const response = await requester.send({ type: 'question', value: [1, 2, 3] });
        t.deepEqual(response, [4, 5, 6]);
        t.end();
    }, 500);
});
