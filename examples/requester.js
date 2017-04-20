var Requester = require('../').Requester;

var randomRequest = new Requester({
    name: 'randomReq',
    // namespace: 'rnd',
    requests: ['randomRequest', 'promised request']
});

function makeRequest() {
    var req = {
        type: 'randomRequest',
        val: ~~(Math.random() * 10)
    };
    console.log('sending request cb', req);
    randomRequest.send(req, function(res) {
        console.log('request cb', req, 'answer', res);
    });

    var reqPromise = {
        type: 'promised request',
        val: ~~(Math.random() * 10)
    };

    console.log('sending request promise', reqPromise);
    randomRequest.send(reqPromise).then((res) => {
        console.log('request promise', reqPromise, 'answer', res);
    }).catch(e => console.log('rejected', e));
}

makeRequest();

setInterval(makeRequest, 5000);
