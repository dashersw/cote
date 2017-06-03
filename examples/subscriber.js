const Subscriber = require('../').Subscriber;

const randomSubscriber = new Subscriber({
    name: 'randomSub',
    // namespace:'rnd',
    subscribesTo: ['randomUpdate'],
});

randomSubscriber.on('randomUpdate', function(req) {
    console.log('notified of ', req);
});
