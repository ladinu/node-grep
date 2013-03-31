var grep = require('./grep');

var find = grep("soda");
var func = find.buildArgs;

var log = function() {
  var args = Array.prototype.slice.call(arguments);
  console.log.apply(this, args);
}
var stdout = process.stdout;

log("DEBUG 1:", func([]));

var t = grep([]);

t.on('error', function(err) {
  log("DEBUG 2:", 'ERROR');
  stdout.write(err);
});

t.on('data', function(d) {
  log("DEBUG 3:", "DATA");
  stdout.write(d);
});
