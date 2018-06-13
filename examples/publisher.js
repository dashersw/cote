let Publisher = require('../').Publisher;

// Instantiate a new Publisher component.
let randomPublisher = new Publisher({
    name: 'randomPub',
    // namespace: 'rnd',
    broadcasts: ['update1', 'update2'],
});

function publishUpdate() {
    let val = {
        val: ~~(Math.random() * 1000),
    };

    console.log('emitting', val);

    // publish an event with arbitrary data at any time
    randomPublisher.publish('update1', val);
    randomPublisher.publish('update1@room1', { room1: val.val });

    randomPublisher.publish('update3', { rand1: 'should not be getting this' });
    randomPublisher.publish('update1@room2', { room2: 'should not be getting this' });
}

publishUpdate();

setInterval(publishUpdate, 3000);
