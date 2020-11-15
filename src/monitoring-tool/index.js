module.exports = function(port) {
    const fs = require('fs');
    const _ = require('lodash');
    const cote = require('../');
    const portfinder = require('portfinder');

    const server = require('http').createServer(handler);
    const io = require('socket.io').listen(server);

    // Instantiate a monitor, sockend and publisher components
    const monitor = new cote.Monitor({
        name: 'monitor',
    }, { disableScreen: true });

    new cote.Sockend(io, {
        name: 'sockend',
        namespace: 'monitoring',
        key: 'monitoring',
    });

    const publisher = new cote.Publisher({
        name: 'status publisher',
        broadcasts: ['statusUpdate'],
        namespace: 'monitoring',
        key: 'monitoring',
    });

    // Graph related variables
    const graph = {
        nodes: [],
        links: [],
    };
    const rawLinks = {};

    const onPort = (err, port) => {
        server.listen(port);
        server.on('error', (err) => {
            if (err.code != 'EADDRINUSE') throw err;

            portfinder.getPort({ port }, onPort);
        });
    };

    portfinder.getPort({ port: port || 5555 }, onPort);

    monitor.on('status', function(status) {
        const node = monitor.discovery.nodes[status.id];
        if (!node) return;

        if (node.processId == monitor.discovery.me.processId) return;

        rawLinks[status.id] = {
            source: status.id,
            target: status.nodes,
        };
    });

    monitor.sock.sock.on('bind', () => {
        monitor.discovery.on('removed', function(node) {
            delete rawLinks[node.id];
            const removedNode = node.id;

            for (const nodeId in rawLinks) {
                const rawLink = rawLinks[nodeId];

                const removedNodeIndex = rawLink.target.indexOf(removedNode);
                if (removedNodeIndex > -1) {
                    rawLink.target.splice(removedNodeIndex, 1);
                    if (!rawLink.target.length) delete rawLinks[nodeId];
                }
            }
        });
    });

    setInterval(function() {
        graph.nodes = [];

        const hosts = getHosts(monitor.discovery.nodes);
        graph.nodes = graph.nodes.concat(hosts);

        const processes = getProcesses(monitor.discovery.nodes);
        graph.nodes = graph.nodes.concat(processes);

        const nodes = getNodes(monitor.discovery.nodes);
        graph.nodes = graph.nodes.concat(nodes);

        // Update links
        const indexMap = {};
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
        const processes = _.groupBy(nodes, 'processId');

        return _.map(processes, (process, processId) => (
            {
                id: processId,
                type: 'process',
                name: process[0].processCommand,
            }
        )).filter(function(process) {
            return process.id != monitor.discovery.me.processId;
        });
    }

    function getHosts(nodes) {
        const nodesByHosts = _.groupBy(nodes, 'hostName');

        _.forEach(nodesByHosts, (nodesByHost, hostId) => {
            const nodesByProcess = _.groupBy(nodesByHost, 'processId');

            _.forEach(nodesByProcess, (processNodes, processId) => {
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
        hosts = _.map(hosts, (host) => ({
            id: host,
            type: 'host',
            name: host,
        }));
        return hosts;
    }

    function getNodes(nodes) {
        nodes = _.filter(nodes, (node) =>
            node.processId != monitor.discovery.me.processId &&
            node.advertisement.name != 'sockendSub' &&
            node.advertisement.name != 'sockendReq',
        );

        const simplifiedNodes = _.map(nodes, (node) => ({
            id: node.id,
            type: 'node',
            name: node.advertisement.name,
        }));

        return simplifiedNodes;
    }

    function getLinks(rawLinks, indexMap) {
        const links = _.map(rawLinks,
            (rawLink) => rawLink.target.map(
                (target) => ({ // flip source & target for semantics :)
                    source: indexMap[target], // monitor.discovery.nodes[target].advertisement.name + '#' + target,
                    target: indexMap[rawLink.source], // monitor.discovery.nodes[rawLink.source].advertisement.name +
                    // '#' + rawLink.source
                }),
            ),
        );

        return _.flatten(links).filter((link) => link.source && link.target);
    }

    return { monitor, server };
};
