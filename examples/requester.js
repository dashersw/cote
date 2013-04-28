var Requester = require('../').Requester;

var randomRequest = new Requester({
    name: 'randomReq',
    requests: ['randomRequest']
});

randomRequest.on('ready', function(sock) {
    setInterval(function() {
        var req = {
            type: 'randomRequest',
            val: ~~(Math.random() * 10)
        };

        sock.send(req, function(res) {
            console.log('request', req, 'answer', res);
        });
    }, 5000);
});
