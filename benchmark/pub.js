
var cote = require('..')
  , program = require('commander');

program
  .option('-t, --per-tick <n>', 'messages per tick [1000]', parseInt)
  .option('-s, --size <n>', 'message size in bytes [1024]', parseInt)
  .option('-d, --duration <n>', 'duration of test [5000]', parseInt)
  .parse(process.argv)

var publisher = new cote.Publisher({
    name: 'testPub',
    broadcasts: ['test']
});

publisher.on('ready', function() {
	publisher.on('added', function() {
		console.log('pub bound');
		more();
	});
});

var perTick = program.perTick || 1000;
var buf = new Buffer(Array(program.size || 1024).join('a'));
console.log('sending %d per tick', perTick);
console.log('sending %d byte messages', buf.length);

function more() {
  for (var i = 0; i < perTick; ++i) publisher.publish('test', buf);
  setImmediate(more);
}
