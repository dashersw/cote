import {EventEmitter2 as EventEmitter} from 'eventemitter2';
import util from 'util';
import Discovery from './Discovery';
import axon from '@dashersw/axon';
import portfinder from 'portfinder';
import _ from 'lodash';
const charm = require('charm')();

class Monitor extends EventEmitter {

    constructor(advertisement, discoveryOptions={}) {
	super();
        _.defaults(discoveryOptions, {
            monitor: true,
            log: false
        });

        advertisement.type = 'monitor';
        advertisement.key = Monitor.environment + (advertisement.key || '');

        const that = this;
        const d = this.discovery = Discovery(advertisement, discoveryOptions);
        const host = discoveryOptions && discoveryOptions.address || '0.0.0.0';
        const interval = discoveryOptions.interval || 5000;

        portfinder.getPort({host, port: advertisement.port}, onPort);

        function onPort(err, port) {
            if (err) process.exit(err);

            advertisement.port = +port;

            const sub = new axon.SubEmitterSocket(port);
            sub.bind(port);

            sub.sock.on('error', err => {
                if (err.code != 'EADDRINUSE') throw err;

                portfinder.getPort({host, port: advertisement.port}, onPort);
            });

            sub.sock.on('bind', () => {
                sub.on('status', status => {
                    that.emit('status', status);
                });
            });
        }

        if (discoveryOptions.disableScreen) return;

        charm.pipe(process.stdout);
        charm.reset().erase('screen').position(0, 0).
            write('                                                                                    ');

        (function draw() {
            charm.erase('screen');
            let index = 3;
            charm.position(0, 2);
            charm.foreground('green').
                write('Name').move(16).
                write('id').move(37).
                write('Address').move(11).
                write('Port');

            charm.erase('down');

            d.eachNode(node => {
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
        })();
    }

    static setEnvironment(environment) {
        Monitor.environment = `${environment}:`;
    }
}


Monitor.environment = '';


export default Monitor;
