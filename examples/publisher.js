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
    randomPublisher.publish('update1', { val: val.val + ' without room' });
    randomPublisher.publish('update1', { val: val.val + ' on room1 and room3', __rooms: ['room1', 'room3'] });
    randomPublisher.publish('update1', { val: val.val + ' on room1 only', __room: 'room1' });

    randomPublisher.publish('update3', { val: 'should not be getting this' });
    randomPublisher.publish('update1', { val: 'should not be getting this', __rooms: ['room2'] });
}

publishUpdate();

setInterval(publishUpdate, 3000);
