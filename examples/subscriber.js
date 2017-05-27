let Subscriber = require('../').Subscriber;

let randomSubscriber = new Subscriber({
    name: 'randomSub',
    // namespace:'rnd',
    subscribesTo: ['randomUpdate'],
});

randomSubscriber.on('randomUpdate', function(req) {
    console.log('notified of ', req);
});
