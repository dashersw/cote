var cote = require('.');

// var requester = new cote.Requester({ name: 'requester' });
// var responder = new cote.Responder({ name: 'responder' });
// // console.log('hello', Requester.environment);
// // Requester.setEnvironment('ahmet');
// // console.log('hello2', Requester.environment)

// requester.on('ready', () => {
//     console.log('ready');
//     requester.send({ type: 'test', args: [1, 2, 3] });
// });

// responder.on('test', req => {
//     console.log(req);
// });



// LogSuppress.init(console);

// var key = 'test 1';

// var publisher = new cote.Publisher({ name: 'publisher', key });
// var subscriber = new cote.Subscriber({ name: 'subscriber', key });

// publisher.on('ready', () => {
//     subscriber.on('connect', _ => {
//         publisher.publish('test', { args: [1, 2, 3] });
//     });
// });

// subscriber.on('test', req => {
//     console.log(req);
// });

var cote = require('.')({environment: 'test'});

var key = 'sdf';
var namespace = 'ns';

var publisher = new cote.Publisher({ name: 'publisher', key, namespace });
var subscriber = new cote.Subscriber({ name: 'subscriber', key, namespace });

publisher.on('ready', () => {
    subscriber.on('connect', _ => {
        publisher.publish('test', { args: [1, 2, 5] });
    });
});

subscriber.on('test', req => {
    console.log('ns', req);
    console.log(req.args, [1, 2, 5], 'Arguments should have been [1, 2, 5]');
    console.log(cote.Publisher.environment, 'test:');
});
