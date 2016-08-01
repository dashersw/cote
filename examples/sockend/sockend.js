var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(process.argv[2] || 5555);

function handler (req, res) {
  if (req.method != 'GET' || req.url != '/') return; //allow sockend http responder to respond these
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
};

var sockend = new require('../../').Sockend(io, {
  name: 'sockend'
});
