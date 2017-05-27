const Configurable = require('./configurable');
const Monitorable = require('./monitorable');
const Component = require('./component');
const axon = require('@dashersw/axon');

module.exports = class Requester extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.startDiscovery();

        this.sock = new axon.types[this.type]();
        this.sock.set('retry timeout', 0);

        this.sock.on('message', (req, cb) => {
            if (!(req && req.type)) return;

            this.emit(req.type, req, cb);
        });
    }

    onAdded(obj) {
        let address = Requester.useHostNames ? obj.hostName : obj.address;

        this.sock.connect(obj.advertisement.port, address);
    }

    send(...args) {
        if (args.length == 1 || typeof args[args.length - 1] != 'function') {
            return new Promise((resolve, reject) => {
                if (!this.sock) return reject(new Error('No socket found'));

                this.sock.send(...args, (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });
        }

        if (this.sock) this.sock.send(...args);
        else console.log(`trying to send ${args} but not ready yet.`);
    }

    get type() {
        return 'req';
    }
    get oppo() {
        return 'rep';
    }
};
