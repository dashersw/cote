import test from 'ava';

const Discovery = require('../src/components/discovery');

test('setDefaults', (t) => {
    const options = {
        log: true,
    };
    Discovery.setDefaults(options);
    t.deepEqual(options, Discovery.defaults,
        'Options should match Discovery.defaults');
});

test('setDefaults overrides defaults', (t) => {
    const options = {
        log: false,
    };
    Discovery.setDefaults(options);
    t.is(false, Discovery.defaults.log);
});
