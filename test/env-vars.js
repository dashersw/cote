import test from 'ava';
import LogSuppress from '../lib/log-suppress';
import r from 'randomstring';
import process from 'process';

const environment = r.generate();

LogSuppress.init(console);

process.env.COTE_CHECK_INTERVAL = 5000;

const { Requester } = require('../')({ environment });

test('Incorporates environment variables', (t) => {
  const requester = new Requester({ name: 'requester' });

  t.true(requester.discovery.settings.checkInterval == 5000);
});
