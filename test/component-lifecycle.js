const test = require('ava');
const LogSuppress = require('../lib/log-suppress');
const r = require('randomstring');

const environment = r.generate();
const { Requester, Responder } = require('../')({ environment });

LogSuppress.init(console);

const setup = (t) => {
    const key = r.generate();

    const requester = new Requester({ name: `${t.title}: ${key} requester`, key });
    const responder = new Responder({ name: `${t.title}: ${key} responder`, key });

    let i = 1;
    responder.on('ping', (req, cb) => {
        i++;
        setTimeout(() => {
            cb(null, 'pong');
        }, 500 * i);
    });

    requester.send({ type: 'ping' });
    setInterval(() => {
        requester.send({ type: 'ping' });
    }, 500);

    return { requester, responder };
};

test('Instantiate a requester', (t) => {
    const key = r.generate();
    const requester = new Requester({ name: `${t.title}: requester`, key });

    t.is(requester.type, 'req');
});

test.cb('Discover and close a requester', (t) => {
    t.plan(1);

    const key = r.generate();
    const requester = new Requester({ name: `${t.title}: ${key} requester`, key });
    const responder = new Responder({ name: `${t.title}: ${key} responder`, key });

    responder.on('cote:added', () => requester.close());
    responder.on('cote:removed', (obj) => {
        t.is(obj.advertisement.name, `${t.title}: ${key} requester`);

        responder.close();
        t.end();
    });
});

test.cb(`Component should call close callback if no sock`, (t) => {
    const key = r.generate();
    const requester = new Requester({ name: `${t.title}: ${key} requester`, key });

    setTimeout(() => {
        requester.sock = null;
        requester.close(() => {
            t.is(requester.sock, null);
            t.end();
        });
    }, 750);
});

test.cb(`Requester should close socket immediately if no callback`, (t) => {
    const { requester } = setup(t);

    setTimeout(() => {
        requester.close();
        t.is(requester.messageIds.length, 2);
        t.end();
    }, 750);
});

test.cb(`Requester should wait for all messages to complete before close callback`, (t) => {
    const { requester } = setup(t);

    setTimeout(() => {
        requester.close(() => {
            t.is(requester.messageIds.length, 0);
            t.end();
        });
        t.is(requester.messageIds.length, 2);
    }, 750);
});

test.cb(`Responder should close socket immediately if no callback`, (t) => {
    const { responder } = setup(t);

    setTimeout(() => {
        responder.close();
        t.is(responder.messageIds.length, 2);
        t.end();
    }, 750);
});

test.cb(`Responder should wait for all messages to complete before close callback`, (t) => {
    const { responder } = setup(t);

    setTimeout(() => {
        responder.close(() => {
            t.is(responder.messageIds.length, 0);
            t.end();
        });
        t.is(responder.messageIds.length, 2);
    }, 750);
});
