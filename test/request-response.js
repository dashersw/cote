import test from 'ava';
import LogSuppress from 'log-suppress';

var cote = require('../dist')();

LogSuppress.init(console);

test.cb('classic request / responder', t => {
    var key = 'test 1';

    var requester = new cote.Requester({ name: 'requester', key });
    var responder = new cote.Responder({ name: 'responder', key });

    requester.on('ready', () => {
        requester.send({ type: 'test', args: [1, 2, 3] });
    });

    responder.on('test', req => {
        t.deepEqual(req.args, [1, 2, 3], 'Arguments should have been [1, 2, 3]');
        t.end();
    });
});

test.cb('Environment test', t => {
    var key = 'test 2';

    var cote = require('..')({environment: 'test'});

    var requester = new cote.Requester({ name: 'requester', key });
    var responder = new cote.Responder({ name: 'responder', key });

    requester.on('ready', () => {
        requester.send({ type: 'test', args: [1, 2, 3] });
    });

    responder.on('test', req => {
        t.deepEqual(req.args, [1, 2, 3], 'Arguments should have been [1, 2, 3]');
        t.is(cote.Requester.environment, 'test:');
        t.end();
    });
});
