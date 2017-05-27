const axon = require('@dashersw/axon');

module.exports = (Base) => class Monitorable extends Base {
    startDiscovery() {
        super.startDiscovery();

        this.discovery.on('added', (obj) => {
            let adv = obj.advertisement;

            if (adv.type != 'monitor' ||
                adv.environment &&
                adv.environment != this.advertisement.environment ||
                adv.key && adv.key != this.advertisement.key)
                return;

            this.onMonitorAdded(obj);
        });
    }

    onMonitorAdded(obj) {
        let adv = obj.advertisement;

        this.monitorStatusPublisher = new axon.PubEmitterSocket();

        let address = obj.address;
        if (this.constructor.useHostNames) address = obj.hostName;

        this.monitorStatusPublisher.connect(adv.port, address);
        let statusInterval = this.discoveryOptions.statusInterval || 5000;

        setInterval(() => this.onMonitorInterval(), statusInterval);
    }

    onMonitorInterval() {
        let nodes = [];

        for (let id in this.discovery.nodes) {
            let node = this.discovery.nodes[id];

            if (node.sock)
                nodes.push(id);
        }

        this.monitorStatusPublisher.emit('status', {
            id: this.discovery.me.id,
            nodes: nodes,
        });
    }
};
