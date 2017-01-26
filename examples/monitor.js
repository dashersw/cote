var Monitor = require('../').Monitor;

// Instantiate a new Monitor component.
var randomMonitor = new Monitor({
    name: 'monitor'
});

randomMonitor.on('status', function(e) {
    console.log(e);
});
