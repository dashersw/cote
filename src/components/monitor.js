const portfinder = require('portfinder');
const charm = require('charm')();
const Configurable = require('./configurable');
const Component = require('./component');
const axon = require('@dashersw/axon');

const defaultOptions = {
    monitor: true,
    log: false,
};

module.exports = class Monitor extends Configurable(Component) {
    constructor(advertisement, discoveryOptions = {}, stream) {
        advertisement.type = 'monitor';

        discoveryOptions = { ...defaultOptions, ...discoveryOptions };

        super(advertisement, discoveryOptions);

        this.stream = stream;

        this.sock = new axon.SubEmitterSocket();
        this.sock.sock.on('bind', () => this.startDiscovery());

        this.sock.on('status', (status) => this.emit('status', status));

        const onPort = (err, port) => {
            advertisement.port = +port;

            this.sock.bind(port);
            this.sock.sock.server.on('error', (err) => {
                if (err.code != 'EADDRINUSE') throw err;

                portfinder.getPort({
                    host: this.discoveryOptions.address,
                    port: this.advertisement.port,
                }, onPort);
            });
        };

        portfinder.getPort({
            host: this.discoveryOptions.address,
            port: this.advertisement.port,
        }, onPort);
    }

    startDiscovery() {
        super.startDiscovery();

        if (this.discoveryOptions.disableScreen) return;

        const interval = this.discoveryOptions.interval || 5000;

        charm.pipe(this.stream || process.stdout);
        charm.reset().erase('screen').position(0, 0).
            write('                                                                                    ');

        const draw = () => {
            charm.erase('screen');
            let index = 3;
            charm.position(0, 2);
            charm.foreground('green').
                write('Name').move(16).
                write('id').move(37).
                write('Address').move(11).
                write('Port');

            charm.erase('down');

            this.discovery.eachNode((node) => {
                let port = node.advertisement.port || '----';
                port += '';
                charm.position(0, index).foreground('cyan').
                    write(node.advertisement.name.slice(0, 20)).move(20 - node.advertisement.name.length, 0).
                    foreground('magenta').write(node.id).move(3, 0).
                    foreground('yellow').write(node.address).move(3, 0).
                    foreground('red').write(port);
                index++;
            });

            charm.position(0, 1);

            setTimeout(draw, interval);
        };

        draw();
    }
};
