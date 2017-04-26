var Publisher = require('../').Publisher;

// Instantiate a new Publisher component.
var randomPublisher = new Publisher({
    name: 'randomPub',
    // namespace: 'rnd',
    broadcasts: ['randomUpdate']
});

function publishUpdate() {
    var val = {
        val: ~~(Math.random() * 1000)
    };

    console.log('emitting', val);

    // publish an event with arbitrary data at any time
    randomPublisher.publish('randomUpdate', val);
}

publishUpdate();

setInterval(publishUpdate, 3000);
