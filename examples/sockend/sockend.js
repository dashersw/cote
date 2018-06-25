let cote;
try {
    cote = require('cote');
} catch (e) {
    cote = require('../../');
}
let app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs');

io.on('connection', (socket) => {
   socket.join('room1');
});

app.listen(process.argv[2] || 5555);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html', function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
};

let sockend = new cote.Sockend(io, { name: 'sockend' });
