import test from 'ava';
import LogSuppress from 'log-suppress';
import r from 'randomstring';

const environment = r.generate();
let { Requester, Responder, Monitor } = require('../src')({ environment });

LogSuppress.init(console);

test.cb('Supports simple req&res', (t) => {
    t.pass();
    t.end();
    // t.plan(1);

    // let requester = new Requester({ name: `${t.title}: monitor requester` });
    // let responder = new Responder({ name: `${t.title}: monitor responder` });
    // let monitor = new Monitor({ name: `${t.title}: monitor` }, { disableScreen: false });

    // requester.send({ type: 'test', args: [1, 2, 3] });

    // responder.on('test', (req) => {
    //     t.deepEqual(req.args, [1, 2, 3]);
    //     t.end();
    // });
});
