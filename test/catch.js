var grep = require('../grep.js');

var log = function() {
  var args = Array.prototype.slice.call(arguments);
  console.log.apply(this, args);
}
var stdout = process.stdout;

// Test 1
var find1 = grep(['-m', '-e', 'people', 'testFile0.txt']);

find1.on('error', function(err) {
	log("DEBUG 4:", "ERROR");
	stdout.write(err);
});

find1.on('data', function(d) {
	log("DEUBG 5", "DATA");
	stdout.write(d);
	log(new Error('Was not expecting data from grep'));
});
// Test 2
var find2 = grep(['-m', '1', '-e', 'people', 'testFile0.txt']);

find2.on('error', function(err) {
	log("DEBUG 6:", "ERROR");
	stdout.write(err);
});

find2.on('data', function(d) {
	log("DEBUG 7:", "DATA");
	stdout.write(d);
});
