let Publisher = require('../').Publisher;

// Instantiate a new Publisher component.
let randomPublisher = new Publisher({
    name: 'randomPub',
    namespace: 'rnd',
    broadcasts: ['randomUpdate'],
});

// Wait for the publisher to find an open port and listen on it.
randomPublisher.on('ready', function() {
    setInterval(function() {
        let val = {
            val: ~~(Math.random() * 1000),
        };

        console.log('emitting', val);

        // publish an event with arbitrary data at any time
        randomPublisher.publish('randomUpdate', val);
    }, 3000);
});
