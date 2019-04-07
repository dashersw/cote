const axon = require('@dashersw/axon');

module.exports = (Base) => class Monitorable extends Base {
    startDiscovery() {
        super.startDiscovery();

        this.discovery.on('added', (obj) => {
            const adv = obj.advertisement;

            if (adv.type != 'monitor' || !this.advertisement.key.startsWith(adv.key)) {
                return;
            }

            this.onMonitorAdded(obj);
        });
    }

    onMonitorAdded(obj) {
        if (!this.monitorStatusPublisher) {
            this.monitorStatusPublisher = new axon.PubEmitterSocket();
            this.monitorStatusPublisher.sock.set('retry timeout', 0);
            const statusInterval = this.discoveryOptions.statusInterval || 5000;

            this.monitorInterval = setInterval(() => this.onMonitorInterval(), statusInterval);
        }

        let address = obj.address;
        if (this.constructor.useHostNames) address = obj.hostName;

        this.monitorStatusPublisher.connect(obj.advertisement.port, address);
    }

    onMonitorInterval() {
        if (!this.monitorStatusPublisher.sock.socks.length) return;

        const nodes = (this.sock.socks || this.sock.sock.socks).map((s) => {
            if (s.id) return s.id;

            for (const id in this.discovery.nodes) {
                const node = this.discovery.nodes[id];

                if ((this.constructor.useHostNames ? s._host == node.hostName : s.remoteAddress == node.address) &&
                    s.remotePort == node.advertisement.port) {
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
