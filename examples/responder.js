let Responder = require('../src').Responder;

// Instantiate a new Responder component.
let randomResponder = new Responder({
    name: 'randomRep',
    // namespace: 'rnd',
    respondsTo: ['randomRequest', 'promised request'], // types of requests this responder
    							  // can respond to.
});

// request handlers are like any event handler.
randomResponder.on('randomRequest', function(req, cb) {
    let answer = ~~(Math.random() * 10);
    console.log('request', req.val, 'answering with', answer);
    cb(answer);
});

// request handlers are like any event handler.
randomResponder.on('promised request', function(req) {
    let answer = ~~(Math.random() * 10);

    return new Promise((resolve, reject) => {
        console.log('promise request', req.val, 'answering with', answer);
        resolve(answer);
        // reject(answer);
    });
});
