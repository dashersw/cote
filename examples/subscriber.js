var Subscriber = require('../').Subscriber;

var randomSubscriber = new Subscriber({
    name: 'randomSub',
    subscribesTo: ['randomUpdate']
});

randomSubscriber.on('randomUpdate', function(req) {
    console.log('notified of ', req);
});
