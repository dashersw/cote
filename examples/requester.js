var Requester = require('../').Requester;

var randomRequest = new Requester({
    name: 'randomReq',
    // namespace: 'rnd',
    requests: ['randomRequest']
});

function makeRequest() {
    var req = {
        type: 'randomRequest',
        val: ~~(Math.random() * 10)
    };

    randomRequest.send(req, function(res) {
        console.log('request', req, 'answer', res);
    });
}

makeRequest();

setInterval(makeRequest, 5000);
