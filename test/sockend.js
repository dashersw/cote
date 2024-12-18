const test = require('ava')
const LogSuppress = require('../lib/log-suppress')
const r = require('randomstring')
const io = require('socket.io')
const portfinder = require('portfinder')
const ioClient = require('socket.io-client')

const environment = r.generate()
const { Responder, Sockend, Publisher } = require('../')({ environment })

LogSuppress.init(console)

test('Supports environment', t => {
  t.is(Sockend.environment, `${environment}:`)
})

test.cb('Sockend simple req&res', t => {
  t.plan(2)

  const responder = new Responder({
    name: `${t.title}: simple responder`,
    respondsTo: ['test', 'test 2'],
  })

  responder.on('test', (req, cb) => cb(req.args))
  responder.on('test 2', (req, cb) => cb([1, 2, 3]))

  portfinder.getPort({ host: '127.0.0.1', port: 6000 }, (err, port) => {
    const server = io(port)
    new Sockend(server, { name: 'simple sockend' })

    const client = ioClient.connect(`http://0.0.0.0:${port}`)

    server.on('connection', sock => {
      responder.sock.on('connect', () => {
        client.emit('test', { args: [4, 5, 6] }, res => {
          t.deepEqual(res, [4, 5, 6])
          client.emit('test 2', res => {
            t.deepEqual(res, [1, 2, 3])
            t.end()
          })
        })
      })
    })
  })
})

test.cb(`Sockend wrong respondsTo configuration`, t => {
  t.plan(2)
  const key = r.generate()

  const responder1 = new Responder({
    name: `${t.title}: responder1`,
    respondsTo: ['test1'],
    key,
  })
  const responder2 = new Responder({
    name: `${t.title}: responder2`,
    respondsTo: 'test2',
    key,
  })

  let metResponders = 0

  responder1.on('test', (req, cb) => cb(req.args))
  responder2.on('test', (req, cb) => cb(req.args))

  portfinder.getPort({ host: '127.0.0.1', port: 28000 }, (err, port) => {
    const server = io(port)
    const sockend = new Sockend(server, {
      name: 'sockend for wrong respondsTo configuration',
      key,
    })

    sockend.discovery.on('added', obj => {
      if (obj.advertisement.axon_type != 'rep') return
      if (obj.advertisement.key != sockend.advertisement.key) return

      metResponders++

      if (obj.advertisement.respondsTo === 'test2') {
        t.pass()
      }

      if (obj.advertisement.respondsTo[0] == 'test1') {
        t.pass()
      }

      if (metResponders == 2) t.end()
    })
  })
})

test.cb('Sockend simple pub&sub', t => {
  t.plan(1)
  const key = r.generate()

  const publisher = new Publisher({
    name: `${t.title}: simple publisher`,
    key,
    broadcasts: ['published message'],
  })

  portfinder.getPort({ host: '127.0.0.1', port: 5000 }, (err, port) => {
    const server = io(port)
    new Sockend(server, { name: 'pub&sub sockend', key })

    const client = ioClient.connect(`http://0.0.0.0:${port}`)

    client.on('published message', msg => {
      t.deepEqual(msg, { content: 'simple content' })
      t.end()
    })

    server.on('connection', sock => {
      publisher.sock.sock.on('connect', sdf => {
        publisher.publish('published message', { content: 'simple content' })
      })
    })
  })
})

test.cb('Sockend pub&sub with __rooms', t => {
  t.plan(1)
  const key = r.generate()

  const publisher = new Publisher({
    name: `${t.title}: room publisher`,
    key,
    broadcasts: ['published message'],
  })

  portfinder.getPort({ host: '127.0.0.1', port: 1000 }, (err, port) => {
    const server = io(port)
    new Sockend(server, { name: 'pub&sub sockend', key })

    const client = ioClient.connect(`http://0.0.0.0:${port}`)

    client.on('published message', msg => {
      t.deepEqual(msg, { content: 'simple content' })
      t.end()
    })

    server.on('connection', sock => {
      sock.join('room1')
      publisher.sock.sock.on('connect', sdf => {
        publisher.publish('published message', {
          content: 'simple content',
          __rooms: ['room1'],
        })
      })
    })
  })
})

test.cb('Sockend pub&sub with __room', t => {
  t.plan(1)
  const key = r.generate()

  const publisher = new Publisher({
    name: `${t.title}: room publisher`,
    key,
    broadcasts: ['published message'],
  })

  portfinder.getPort({ host: '127.0.0.1', port: 2000 }, (err, port) => {
    const server = io(port)
    new Sockend(server, { name: 'pub&sub sockend', key })

    const client = ioClient.connect(`http://0.0.0.0:${port}`)

    client.on('published message', msg => {
      t.deepEqual(msg, { content: 'simple content' })
      t.end()
    })

    server.on('connection', sock => {
      sock.join('room1')
      publisher.sock.sock.on('connect', sdf => {
        publisher.publish('published message', {
          content: 'simple content',
          __room: 'room1',
        })
      })
    })
  })
})

test.cb(`Sockend ns req&res / pub&sub`, t => {
  t.plan(2)

  const namespace = r.generate()
  const key = r.generate()

  portfinder.getPort({ host: '127.0.0.1', port: 3000 }, (err, port) => {
    const server = io(port)
    new Sockend(server, { name: 'ns sockend', key })
    const responder = new Responder({
      name: `${t.title}: ns responder`,
      namespace,
      key,
      respondsTo: ['ns test'],
    })
    const responder2 = new Responder({
      name: `${t.title}: ns responder 2`,
      namespace,
      key,
      respondsTo: ['ns test'],
    })
    const publisher = new Publisher({
      name: `${t.title}: ns publisher`,
      namespace,
      key,
      broadcasts: ['published message'],
    })

    // this publisher is used to test the prevention of creating duplicate namespace objects
    // in sockend for the same namespace
    new Publisher({
      name: `${t.title}: ns publisher`,
      namespace,
      key,
      broadcasts: ['published message'],
    })

    responder.on('ns test', (req, cb) => cb(req.args))
    responder2.on('ns test', (req, cb) => cb(req.args))

    responder.sock.on('connect', () => {
      const client = ioClient.connect(`http://0.0.0.0:${port}/${namespace}`)
      client.on('published message', msg => {
        t.deepEqual(msg, { content: 'ns content' })

        t.end()
      })

      server.of(namespace).on('connection', sock => {
        client.emit('ns test', { args: [7, 8, 9] }, res => {
          t.deepEqual(res, [7, 8, 9])
          if (publisher.sock.sock.socks.length > 0) {
            publisher.publish('published message', { content: 'ns content' })
          } else {
            publisher.sock.sock.on('connect', () => {
              publisher.publish('published message', { content: 'ns content' })
            })
          }
        })
      })
    })
  })
})

test.cb(`Sockend ns late bound req&res`, t => {
  t.plan(1)

  const namespace = r.generate()
  const key = r.generate()

  portfinder.getPort({ host: '127.0.0.1', port: 4000 }, (err, port) => {
    const server = io(port)
    server.of(`/${namespace}`, socket => {
      const responder = new Responder({
        name: `${t.title}: ns responder`,
        namespace,
        key,
        respondsTo: ['ns test'],
      })
      responder.on('ns test', (req, cb) => cb(req.args))
      client.emit('ns test', { args: [7, 8, 9] }, res => {
        t.deepEqual(res, [7, 8, 9])
        t.end()
      })
    })

    new Sockend(server, { name: 'ns sockend', key })
    const client = ioClient(`http://0.0.0.0:${port}/${namespace}`)
  })
})

test.cb('Sockend applies requesterTransformators', t => {
  t.plan(1)

  const key = r.generate()

  const responder = new Responder({
    name: `${t.title}: responder`,
    respondsTo: ['test'],
    key,
  })

  responder.on('test', (req, cb) => {
    // Respond with the transformed data to validate transformation
    cb(req.transformed)
  })

  portfinder.getPort({ host: '127.0.0.1', port: 6000 }, (err, port) => {
    const server = io(port)
    const sockend = new Sockend(server, { name: 'transformator sockend', key })

    // Add a transformation function
    sockend.requesterTransformators.push((data, socket) => {
      data.transformed = `Transformed: ${data.original}`
    })

    const client = ioClient.connect(`http://0.0.0.0:${port}`)

    server.on('connection', () => {
      responder.sock.on('connect', () => {
        client.emit('test', { original: 'Hello World' }, res => {
          t.is(res, 'Transformed: Hello World')
          t.end()
        })
      })
    })
  })
})
