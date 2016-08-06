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

function getProcesses(nodes) {
    var processes = _.groupBy(nodes, 'processId');

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
    var nodesByHosts = _.groupBy(nodes, 'hostName');

    _.forEach(nodesByHosts, function(nodesByHost, hostId) {
        var nodesByProcess = _.groupBy(nodesByHost, 'processId');

        _.forEach(nodesByProcess, function(processNodes, processId) {
            rawLinks[processId] = {
                source: processId,
                target: processNodes.map(function(node){
                    return node.id;
                })
            }
        });

        rawLinks[hostId] = {
            source: hostId,
            target: Object.keys(nodesByProcess)
        };
    });

    var hosts = Object.keys(nodesByHosts);
    hosts = _.map(hosts, function(host) {
        return {
            id: host,
            type: 'host',
            name: host
        };
    });
    return hosts;
}

function getNodes(nodes) {
    simplifiedNodes = _.map(nodes, function(node) {
        return {
            id: node.id,
            type: 'node',
            name: node.advertisement.name
        };
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
    graph.nodes = [];

    var hosts = getHosts(monitor.discovery.nodes);
    graph.nodes = graph.nodes.concat(hosts);

    var processes = getProcesses(monitor.discovery.nodes);
    graph.nodes = graph.nodes.concat(processes);

    var nodes = getNodes(monitor.discovery.nodes);
    graph.nodes = graph.nodes.concat(nodes);

    // Update links
    var indexMap = {};
    graph.nodes.forEach(function(node, index) {
        indexMap[node.id] = index;
    });
    graph.links = getLinks(rawLinks, indexMap);

    // Publish the output
    publisher.publish('statusUpdate', graph);
}, 5000);
