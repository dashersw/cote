var Publisher = require('../').Publisher;

// Instantiate a new Publisher component.
var randomPublisher = new Publisher({
    name: 'randomPub',
    broadcasts: ['randomUpdate']
});

// Wait for the publisher to find an open port and listen on it.
randomPublisher.on('ready', function(sock) {
    setInterval(function() {
        var val = {
            val: ~~(Math.random() * 1000)
        };

        console.log('emitting', val);

        sock.emit('randomUpdate', val); // emit an event with arbitrary data at any time
    }, 3000);
});
