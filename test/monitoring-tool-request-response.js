const test = require('ava')
const LogSuppress = require('../lib/log-suppress')
const r = require('randomstring')
const request = require('request')
const fs = require('fs')
const sinon = require('sinon')
const childProcess = require('child_process')

const environment = r.generate()
const { Requester, Responder, MonitoringTool } = require('../')({
  environment,
  useHostNames: true,
  statusInterval: 300,
})

LogSuppress.init(console)

test.cb('Discover req&res', t => {
  t.plan(4)

  const key = r.generate()

  const requester = new Requester({
    name: `${t.title}: monitor requester`,
    key,
  })
  const responder = new Responder({
    name: `${t.title}: monitor responder`,
    key,
  })

  const monitoringTool = new MonitoringTool()
  const monitoringTool2 = new MonitoringTool()

  let counter = 0

  monitoringTool.monitor.on('status', status => {
    counter++

    t.is(status.id, requester.discovery.me.id)
    t.is(status.nodes[0], responder.discovery.me.id)

    if (counter == 1) return

    monitoringTool.monitor.close()
    monitoringTool2.monitor.close()

    const original = requester.onMonitorInterval.bind(requester)
    requester.onMonitorInterval = () => {
      original()
      t.end()
    }
  })
})

test.serial.cb('Render index.html', t => {
  const monitoringTool = new MonitoringTool()

  monitoringTool.server.on('listening', s => {
    const { address, port } = monitoringTool.server.address()
    setTimeout(() => {
      request.get(`http://${address}:${port}`, (err, response, body) => {
        t.is(
          body,
          fs.readFileSync('./src/monitoring-tool/frontend/index.html', 'utf8')
        )
        t.end()
      })
    }, 1000)
  })
})

test.serial.cb('Cannot render index.html', t => {
  const monitoringTool = new MonitoringTool()

  monitoringTool.server.on('listening', s => {
    const { address, port } = monitoringTool.server.address()

    const stub = sinon
      .stub(fs, 'readFile')
      .callsFake((filename, cb) => cb('error!'))

    request.get(`http://${address}:${port}`, (err, response, body) => {
      t.is(response.statusCode, 500)
      t.is(body, 'Error loading index.html')

      stub.restore()
      t.end()
    })
  })
})

test.serial.cb('Receive status from another process', t => {
  const monitoringTool = new MonitoringTool()

  monitoringTool.monitor.on('status', () => p1.kill() && p2.kill() && t.end())

  const p1 = childProcess.fork('./examples/requester.js', {
    env: { COTE_ENV: environment },
    silent: true,
  })
  const p2 = childProcess.fork('./examples/responder.js', {
    env: { COTE_ENV: environment },
    silent: true,
  })
})

test.serial.cb('Server throws unknown error', t => {
  t.plan(1)

  const originalListeners = process.listeners('uncaughtException')

  process.removeAllListeners('uncaughtException')

  process.on('uncaughtException', function (err) {
    if (err.message != 'unknown error') {
      originalListeners.forEach(l => l(err))

      throw err
    }

    t.pass()
    t.end()
  })

  const monitoringTool = new MonitoringTool()
  monitoringTool.server.on('listening', () =>
    monitoringTool.server.emit('error', new Error('unknown error'))
  )
})

test.serial.cb('Server throws EADDRINUSE error', t => {
  t.plan(1)

  const monitoringTool = new MonitoringTool()

  monitoringTool.server.once('listening', () => {
    monitoringTool.server.close(() => {
      monitoringTool.server.emit('error', { code: 'EADDRINUSE' })
      monitoringTool.server.once('listening', () => {
        t.pass()
        t.end()
      })
    })
  })
})

test.serial.cb('Monitoring tool ignores status updates from unknown ids', t => {
  const monitoringTool = new MonitoringTool()

  monitoringTool.monitor.sock.sock.on('bind', () =>
    monitoringTool.monitor.emit('status', { id: 0 })
  )

  t.pass()
  t.end()
})
