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
    // console.log(monitor.discovery.nodes[status.id]);
    var node = monitor.discovery.nodes[status.id];
    if (!node) return;
    rawLinks[status.id] = {
        source: status.id,
        target: status.nodes
    };
});

function getProcesses(nodes) {
    var processes = _.keyBy(nodes, 'processId');
    processes = Object.keys(processes);
    processes = _.map(processes, function(process) {
        return {
            id: process,
            type: 'process'
        }
    });

    return processes;
}

function getHosts(nodes) {
    // add hosts
    var hosts = _.keyBy(nodes, 'hostName');
    hosts = Object.keys(hosts);
    hosts = _.map(hosts, function(host) {
        return {
            hostName: host,
            type: 'host'
        }
    });
    return hosts;
}

function getNodes(nodes) {
    var simplifiedNodes = _.toArray(nodes);
    simplifiedNodes = _.map(simplifiedNodes, function(node) {
        return {
            id: node.processId,
            hostName: node.advertisement.name,
            type: 'node'
        }
    });

    return simplifiedNodes;
}

function getLinks(rawLinks, indexMap) {
    var links = _.map(rawLinks, function(rawLink) {
        return rawLink.target.map(function(target) {
            return { // flip source & target for semantics :)
                source: indexMap[target],//monitor.discovery.nodes[target].advertisement.name + '#' + target,
                target: indexMap[rawLink.source]//monitor.discovery.nodes[rawLink.source].advertisement.name + '#' + rawLink.source
            };
        });
    });

    return _.flatten(links);
}

setInterval(function() {
    var hosts = getHosts(monitor.discovery.nodes);
    graph.nodes = graph.nodes.concat(hosts);

    // Update nodes
    var processes = getProcesses(monitor.discovery.nodes);
    graph.nodes = graph.nodes.concat(processes);

    var nodes = getNodes(monitor.discovery.nodes);
    // graph.nodes = graph.nodes.concat(nodes);

    // Update links
    var indexMap = {};
    graph.nodes.forEach(function(node, index) {
        indexMap[node.id] = index;
    });
    graph.links = getLinks(rawLinks, indexMap);

    // Publish the output
    publisher.publish('statusUpdate', graph);
}, 5000);
