const test = require('ava')
const LogSuppress = require('../lib/log-suppress')
const r = require('randomstring')

process.env.COTE_DISCOVERY_REDIS_HOST = 'localhost'

const { Requester, Responder } = require('../')()

LogSuppress.init(console)

test.cb(`Crash trying to use redis`, t => {
  t.plan(1)

  const key = r.generate()

  new Requester({ name: `${t.title}: ignore requester`, key })
  new Responder({ name: `${t.title}: ignore responder`, key })

  const originalListeners = process.listeners('uncaughtException')

  process.removeAllListeners('uncaughtException')

  const emptyListener = () => {}

  const listener = function (err) {
    if (err.message != 'connect ECONNREFUSED 127.0.0.1:6379') {
      originalListeners.forEach(l => l(err))

      throw err
    }

    t.pass()
    t.end()

    process.removeListener('uncaughtException', listener)
    process.on('uncaughtException', emptyListener)
  }

  process.on('uncaughtException', listener)
})
