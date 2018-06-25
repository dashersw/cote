import test from 'ava';
import LogSuppress from '../lib/log-suppress';
import r from 'randomstring';
import io from 'socket.io';
import portfinder from 'portfinder';
import ioClient from 'socket.io-client';

const environment = r.generate();
const { Responder, Sockend, Publisher } = require('../')({ environment });

LogSuppress.init(console);

test('Supports environment', (t) => {
    t.is(Sockend.environment, `${environment}:`);
});

test.cb('Sockend simple req&res', (t) => {
    t.plan(2);

    const responder = new Responder({ name: `${t.title}: simple responder`, respondsTo: ['test', 'test 2'] });

    responder.on('test', (req, cb) => cb(req.args));
    responder.on('test 2', (req, cb) => cb([1, 2, 3]));

    portfinder.getPort({ port: 40000 }, (err, port) => {
        const server = io(port);
        new Sockend(server, { name: 'simple sockend' });

        const client = ioClient.connect(`http://0.0.0.0:${port}`);

        server.on('connection', (sock) => {
            responder.sock.on('connect', () => {
                client.emit('test', { args: [4, 5, 6] }, (res) => {
                    t.deepEqual(res, [4, 5, 6]);
                    client.emit('test 2', (res) => {
                        t.deepEqual(res, [1, 2, 3]);
                        t.end();
                    });
                });
            });
        });
    });
});

test.cb('Sockend simple pub&sub', (t) => {
    t.plan(1);
    const key = r.generate();

    const publisher = new Publisher({ name: `${t.title}: simple publisher`, key, broadcasts: ['published message'] });

    portfinder.getPort({ port: 20000 }, (err, port) => {
        const server = io(port);
        new Sockend(server, { name: 'pub&sub sockend', key });

        const client = ioClient.connect(`http://0.0.0.0:${port}`);

        client.on('published message', (msg) => {
            t.deepEqual(msg, { content: 'simple content' });
            t.end();
        });

        server.on('connection', (sock) => {
            publisher.sock.sock.on('connect', (sdf) => {
                publisher.publish('published message', { content: 'simple content' });
            });
        });
    });
});

test.cb('Sockend pub&sub with __rooms', (t) => {
    t.plan(1);
    const key = r.generate();

    const publisher = new Publisher({ name: `${t.title}: room publisher`, key, broadcasts: ['published message'] });

    portfinder.getPort({ port: 20001 }, (err, port) => {
        const server = io(port);
        new Sockend(server, { name: 'pub&sub sockend', key });

        const client = ioClient.connect(`http://0.0.0.0:${port}`);

        client.on('published message', (msg) => {
            t.deepEqual(msg, { content: 'simple content' });
            t.end();
        });

        server.on('connection', (sock) => {
            sock.join('room1');
            publisher.sock.sock.on('connect', (sdf) => {
                publisher.publish('published message', { content: 'simple content', __rooms: ['room1'] });
            });
        });
    });
});

test.cb('Sockend pub&sub with __room', (t) => {
    t.plan(1);
    const key = r.generate();

    const publisher = new Publisher({ name: `${t.title}: room publisher`, key, broadcasts: ['published message'] });

    portfinder.getPort({ port: 20002 }, (err, port) => {
        const server = io(port);
        new Sockend(server, { name: 'pub&sub sockend', key });

        const client = ioClient.connect(`http://0.0.0.0:${port}`);

        client.on('published message', (msg) => {
            t.deepEqual(msg, { content: 'simple content' });
            t.end();
        });

        server.on('connection', (sock) => {
            sock.join('room1');
            publisher.sock.sock.on('connect', (sdf) => {
                publisher.publish('published message', { content: 'simple content', __room: 'room1' });
            });
        });
    });
});

test.cb(`Sockend ns req&res / pub&sub`, (t) => {
    t.plan(2);

    const namespace = r.generate();
    const key = r.generate();

    portfinder.getPort({ port: 30000 }, (err, port) => {
        const server = io(port);
        new Sockend(server, { name: 'ns sockend', key });
        const responder = new Responder({
            name: `${t.title}: ns responder`, namespace, key,
            respondsTo: ['ns test'],
        });
        const responder2 = new Responder({
            name: `${t.title}: ns responder 2`, namespace, key,
            respondsTo: ['ns test'],
        });
        const publisher = new Publisher({
            name: `${t.title}: ns publisher`, namespace, key,
            broadcasts: ['published message'],
        });

        responder.on('ns test', (req, cb) => cb(req.args));
        responder2.on('ns test', (req, cb) => cb(req.args));

        responder.sock.on('connect', () => {
            const client = ioClient.connect(`http://0.0.0.0:${port}/${namespace}`);
            client.on('published message', (msg) => {
                t.deepEqual(msg, { content: 'ns content' });

                t.end();
            });

            server.of(namespace).on('connection', (sock) => {
                client.emit('ns test', { args: [7, 8, 9] }, (res) => {
                    t.deepEqual(res, [7, 8, 9]);
                    if (publisher.sock.sock.socks.length > 0) {
                        publisher.publish('published message', { content: 'ns content' });
                    } else {
                        publisher.sock.sock.on('connect', () => {
                            publisher.publish('published message', { content: 'ns content' });
                        });
                    }
                });
            });
        });
    });
});

test.cb(`Sockend ns late bound req&res`, (t) => {
    t.plan(1);

    const namespace = r.generate();
    const key = r.generate();

    portfinder.getPort({ port: 50000 }, (err, port) => {
        const server = io(port);
        server.of(`/${namespace}`, (socket) => {
            const responder = new Responder({
                name: `${t.title}: ns responder`, namespace, key,
                respondsTo: ['ns test'],
            });
            responder.on('ns test', (req, cb) => cb(req.args));
            client.emit('ns test', { args: [7, 8, 9] }, (res) => {
                t.deepEqual(res, [7, 8, 9]);
                t.end();
            });
        });

        new Sockend(server, { name: 'ns sockend', key });
        const client = ioClient(`http://0.0.0.0:${port}/${namespace}`);
    });
});
