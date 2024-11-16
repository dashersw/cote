const test = require('ava')
const LogSuppress = require('../lib/log-suppress')
const r = require('randomstring')

const environment = r.generate()

process.env.COTE_ENV = environment
process.env.COTE_USE_HOST_NAMES = true
process.env.COTE_MULTICAST_ADDRESS =
  process.env.COTE_MULTICAST_ADDRESS || '239.1.11.111'
process.env.DOCKERCLOUD_IP_ADDRESS = true
process.env.COTE_LOG_UNKNOWN_EVENTS = true

const { Requester, Responder } = require('../')

LogSuppress.init(console)

test('Supports environment', t => {
  t.is(Requester.environment, `${environment}:`)
  t.is(Responder.environment, `${environment}:`)
})

test.cb('Supports simple req&res', t => {
  t.plan(1)

  const requester = new Requester({ name: `${t.title}: simple requester` })
  const responder = new Responder({ name: `${t.title}: simple responder` })

  requester.send({ type: 'test', args: [1, 2, 3] })

  responder.on('test', req => {
    t.deepEqual(req.args, [1, 2, 3])
    t.end()
  })
})

test.cb('Supports keys', t => {
  const key = r.generate()

  const requester = new Requester({ name: `${t.title}: keyed requester`, key })
  const responder = new Responder({ name: `${t.title}: keyed responder`, key })

  requester.send({ type: 'test', args: [1, 2, 4] })

  responder.on('test', req => {
    t.deepEqual(req.args, [1, 2, 4])
    t.end()
  })
})

test.cb('Supports namespaces', t => {
  const namespace = r.generate()

  const requester = new Requester({
    name: `${t.title}: ns requester`,
    namespace,
  })
  const responder = new Responder({
    name: `${t.title}: ns responder`,
    namespace,
  })

  requester.send({ type: 'test', args: [1, 2, 5] })

  responder.on('test', req => {
    t.deepEqual(req.args, [1, 2, 5])
    t.end()
  })
})

test.cb('Supports keys & namespaces', t => {
  const key = r.generate()
  const namespace = r.generate()

  const requester = new Requester({
    name: `RREV ${t.title}: kns requester`,
    key,
    namespace,
  })
  const responder = new Responder({
    name: `RREV ${t.title}: kns responder`,
    key,
    namespace,
  })

  requester.send({ type: 'test', args: [1, 2, 6] })

  responder.on('test', req => {
    t.deepEqual(req.args, [1, 2, 6])
    t.end()
  })
})

test.cb(
  'Responder should log missing event listener with environment variable config',
  t => {
    t.plan(1)
    t.timeout(10000)

    const key = r.generate()

    const requester = new Requester(
      { name: `${t.title}: missing listener requester`, key },
      { log: false }
    )
    const responder = new Responder(
      { name: `${t.title}: missing listener responder`, key },
      { log: false }
    )

    const startDiscovery = responder.startDiscovery
    responder.startDiscovery = function () {
      startDiscovery.call(responder)

      responder.discovery.log = function (...args) {
        t.deepEqual(
          [
            [
              this.advertisement.name,
              '>',
              'No listeners found for event: missing'.yellow,
            ],
          ],
          args
        )
        t.end()
      }
    }

    requester.send({ type: 'missing', message: 'This should be ignored' })
  }
)
