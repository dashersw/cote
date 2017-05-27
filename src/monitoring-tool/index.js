'use strict';

module.exports = function(port) {
    let fs = require('fs'),
        _ = require('lodash'),
        cote = require('../');

    let app = require('http').createServer(handler),
        io = require('socket.io').listen(app);

    // Instantiate a monitor, sockend and publisher components
    let monitor = new cote.Monitor({
        name: 'monitor',
    }, { disableScreen: true });

    let sockend = new cote.Sockend(io, {
        name: 'sockend',
        namespace: 'monitoring',
        key: 'monitoring',
    });

    let publisher = new cote.Publisher({
        name: 'status publisher',
        broadcasts: ['statusUpdate'],
        namespace: 'monitoring',
        key: 'monitoring',
    });

    // Graph related variables
    let graph = {
        nodes: [],
        links: [],
    };
    let rawLinks = {};

    // Sockend
    app.listen(port || 5555);

    monitor.on('status', function(status) {
        let node = monitor.discovery.nodes[status.id];
        if (!node) return;

        if (node.processId == monitor.discovery.me.processId) return;

        rawLinks[status.id] = {
            source: status.id,
            target: status.nodes,
        };
    });

    monitor.discovery.on('removed', function(node) {
        delete rawLinks[node.id];
        let removedNode = node.id;

        for (let nodeId in rawLinks) {
            let rawLink = rawLinks[nodeId];

            let removedNodeIndex = rawLink.target.indexOf(removedNode);
            if (removedNodeIndex > -1) {
                rawLink.target.splice(removedNodeIndex, 1);
                if (!rawLink.target.length) delete rawLinks[nodeId];
            }
        }
    });

    setInterval(function() {
        graph.nodes = [];

        let hosts = getHosts(monitor.discovery.nodes);
        graph.nodes = graph.nodes.concat(hosts);

        let processes = getProcesses(monitor.discovery.nodes);
        graph.nodes = graph.nodes.concat(processes);

        let nodes = getNodes(monitor.discovery.nodes);
        graph.nodes = graph.nodes.concat(nodes);

        // Update links
        let indexMap = {};
        graph.nodes.forEach(function(node, index) {
            indexMap[node.id] = index;
        });
        graph.links = getLinks(rawLinks, indexMap);

        // Publish the output
        publisher.publish('statusUpdate', graph);
    }, 5000);

    function handler(req, res) {
        fs.readFile(__dirname + '/frontend/index.html', function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
    }

    function getProcesses(nodes) {
        let processes = _.groupBy(nodes, 'processId');

        return _.map(processes, function(process, processId) {
            return {
                id: processId,
                type: 'process',
                name: process[0].processCommand,
            };
        }).filter(function(process) {
            return process.id != monitor.discovery.me.processId;
        });
    }

    function getHosts(nodes) {
        let nodesByHosts = _.groupBy(nodes, 'hostName');

        _.forEach(nodesByHosts, function(nodesByHost, hostId) {
            let nodesByProcess = _.groupBy(nodesByHost, 'processId');

            _.forEach(nodesByProcess, function(processNodes, processId) {
                if (processId == monitor.discovery.me.processId) return;

                rawLinks[processId] = {
                    source: processId,
                    target: processNodes.map(function(node) {
                        return node.id;
                    }),
                };
            });

            rawLinks[hostId] = {
                source: hostId,
                target: Object.keys(nodesByProcess),
            };
        });

        let hosts = Object.keys(nodesByHosts);
        hosts = _.map(hosts, function(host) {
            return {
                id: host,
                type: 'host',
                name: host,
            };
        });
        return hosts;
    }

    function getNodes(nodes) {
        nodes = _.filter(nodes, function(node) {
            return node.processId != monitor.discovery.me.processId &&
                node.advertisement.name != 'sockendSub' &&
                node.advertisement.name != 'sockendReq';
        });

        const simplifiedNodes = _.map(nodes, function(node) {
            return {
                id: node.id,
                type: 'node',
                name: node.advertisement.name,
            };
        });

        return simplifiedNodes;
    }

    function getLinks(rawLinks, indexMap) {
        let links = _.map(rawLinks, function(rawLink) {
            return rawLink.target.map(function(target) {
                return { // flip source & target for semantics :)
                    source: indexMap[target], // monitor.discovery.nodes[target].advertisement.name + '#' + target,
                    target: indexMap[rawLink.source], // monitor.discovery.nodes[rawLink.source].advertisement.name + '#' + rawLink.source
                };
            });
        });

        return _.flatten(links).filter(function(link) {
            return link.source != undefined && link.target != undefined;
        });
    }
};
