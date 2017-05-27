module.exports = (Base) => class Monitorable extends Base {
    startDiscovery() {
        super.startDiscovery();

        this.discovery.on('added', this.onMonitorAdded.bind(this));
    }

    onMonitorAdded(obj) {
        let adv = obj.advertisement;

        if (adv.type != 'monitor') return;

        if (adv.key && adv.key != this.advertisement.key) return;

        let statusPublisher = new axon.PubEmitterSocket();

        let address = obj.address;
        if (this.constructor.useHostNames) address = obj.hostName;

        statusPublisher.connect(adv.port, address);
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

        statusPublisher.emit('status', {
            id: this.discovery.me.id,
            nodes: nodes,
        });
    }
};
