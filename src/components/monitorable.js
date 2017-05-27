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
        if (this.discovery.me.processId == obj.processId) return;

        let adv = obj.advertisement;

        if (!this.monitorStatusPublisher) {
            this.monitorStatusPublisher = new axon.PubEmitterSocket();
            this.monitorStatusPublisher.sock.set('retry timeout', 0);
            let statusInterval = this.discoveryOptions.statusInterval || 5000;

            this.monitorInterval = setInterval(() => this.onMonitorInterval(), statusInterval);
        }

        let address = obj.address;
        if (this.constructor.useHostNames) address = obj.hostName;

        this.monitorStatusPublisher.connect(adv.port, address);
    }

    onMonitorInterval() {
        if (!this.monitorStatusPublisher.sock.socks.length) return;

        let nodes = (this.sock.socks || this.sock.sock.socks).map((s) => {
            if (s.id) return s.id;

            for (let id in this.discovery.nodes) {
                let node = this.discovery.nodes[id];

                if (node.address == s.remoteAddress && node.advertisement.port == s.remotePort) {
                    s.id = node.id;

                    return s.id;
                }
            }
        });

        this.monitorStatusPublisher.emit('status', {
            id: this.discovery.me.id,
            nodes: nodes,
        });
    }
};
