const Requester = require('./requester');

module.exports = class DirectedRequester extends Requester {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);
        this.sock.send = this.socketSend.bind(this);
    }

    socketSend(...args) {
        // Enqueue if no socks connected yet
        const requesterSock = this.sock;
        if (!requesterSock.socks || !requesterSock.socks.length) return this.sock.enqueue(args);

        const data = args[0];
        if (!data.responderId) {
            throw new Error('send() needs a "responderId" property when using DirectedRequester');
        }

        // Find Node
        let chosenNodeIndex = Object.values(this.discovery.nodes).findIndex((node, index) => {
            return node.id == data.responderId;
        });
        let sock = requesterSock.socks[chosenNodeIndex];

        // Enqueue if the correct sock did not connect yet/does not exist
        if (!sock) return this.sock.enqueue(args);

        // Save callback
        let hasCallback = 'function' == typeof args[args.length - 1];
        if (!hasCallback) args.push(function() {});
        let fn = args.pop();
        fn.id = requesterSock.id();
        requesterSock.callbacks[fn.id] = fn;
        args.push(fn.id);

        // Remove responderId from message
        delete args[0].responderId;

        // Send over sock
        sock.write(requesterSock.pack(args));
    };
};
