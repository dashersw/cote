const cote = require('cote');

const req = new cote.Requester({ name: 'req' }, { redis: { host: 'redis' } });
