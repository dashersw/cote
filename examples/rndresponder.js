let Responder = require('../').Responder;

// Instantiate a new Responder component.
let randomResponder = new Responder({
    name: 'randomRep',
    namespace: 'rnd',
    respondsTo: ['randomRequest'], // types of requests this responder
    							  // can respond to.
});

// request handlers are like any event handler.
randomResponder.on('randomRequest', function(req, cb) {
    let answer = ~~(Math.random() * 10);
    console.log('request', req.val, 'answering with', answer);
    cb(answer);
});
