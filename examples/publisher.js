let Publisher = require('../').Publisher;

// Instantiate a new Publisher component.
let randomPublisher = new Publisher({
    name: 'randomPub',
    // namespace: 'rnd',
    broadcasts: ['randomUpdate'],
});

function publishUpdate() {
    let val = {
        val: ~~(Math.random() * 1000),
    };

    console.log('emitting', val);

    // publish an event with arbitrary data at any time
    randomPublisher.publish('randomUpdate', val);
    randomPublisher.publish('randomUpdate#room1', { room1: val.val });
}

publishUpdate();

setInterval(publishUpdate, 3000);
