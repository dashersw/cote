let Publisher = require('../').Publisher;

// Instantiate a new Publisher component.
let randomPublisher = new Publisher({
    name: 'randomPub',
    // namespace: 'rnd',
    broadcasts: ['*'],
});

function publishUpdate() {
    let val = {
        val: ~~(Math.random() * 1000),
    };

    console.log('emitting', val);

    // publish an event with arbitrary data at any time
    randomPublisher.publish('randomUpdate', val);
    randomPublisher.publish('randomUpdate1', { rand1: val.val });
    randomPublisher.publish('#room1::randomUpdate', { room1: val.val });

    // should not be recieved as socket has not joined room2
    randomPublisher.publish('#room2::randomUpdate', { room2: val.val });
}

publishUpdate();

setInterval(publishUpdate, 3000);
