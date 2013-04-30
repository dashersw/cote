var Requester = require('../').Requester;

var randomRequest = new Requester({
    name: 'randomReq',
    requests: ['randomRequest']
});

randomRequest.on('ready', function() {
    setInterval(function() {
        var req = {
            type: 'randomRequest',
            val: ~~(Math.random() * 10)
        };

        randomRequest.send(req, function(res) {
            console.log('request', req, 'answer', res);
        });
    }, 5000);
});
