// Dependencies
var app = require('http').createServer(handler),
    _ = require('lodash'),
    io = require('socket.io').listen(app),
    fs = require('fs');

// Cote Library
var cote = require('../');

// Instantiate a monitor, sockend and publisher components
var monitor = new cote.Monitor({
    name: 'monitor'
}, {disableScreen: true});

var sockend = new cote.Sockend(io, {
    name: 'sockend'
});

var publisher = new cote.Publisher({
    name: 'randomPub',
    broadcasts: ['statusUpdate']
});

// Graph related variables
var graph = {
    nodes: [],
    links: []
};

var rawLinks = {};

// Sockend
app.listen(process.argv[2] || 5555);

function handler (req, res) {
    fs.readFile(__dirname + '/frontend/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
};

monitor.on('status', function(status) {
    var node = monitor.discovery.nodes[status.id];
    if (!node) return;
    rawLinks[status.id] = {
        source: status.id,
        target: status.nodes
    };
});

setInterval(function() {
    graph.nodes = _.map(monitor.discovery.nodes, function(node) {
        return {
            id: node.id,
            processId: node.processId,
            hostName: node.hostName,
            name: node.advertisement.name
        }
    });
    var indexMap = {};
    graph.nodes.forEach(function(node, index) {
        indexMap[node.id] = index;
    });
    var links = _.map(rawLinks, function(rawLink) {
        return rawLink.target.map(function(target) {
            return { // flip source & target for semantics :)
                source: indexMap[target],//monitor.discovery.nodes[target].advertisement.name + '#' + target,
                target: indexMap[rawLink.source]//monitor.discovery.nodes[rawLink.source].advertisement.name + '#' + rawLink.source
            };
        });
    });
    graph.links = _.flatten(links);

    publisher.publish('statusUpdate', graph);
}, 5000);
