var util   = require('util');
var stream = require('stream');
var spawn  = require('child_process').spawn;
var exec   = require('child_process').exec;

// Search a stream or a file using grep
function Grep(options) {
  stream.call(this);
  var self      = this;
  this.writable = true;
  this.readable = true;

  var options  = options          || {};
  var callback = options.callback || null;
  var pattern  = options.pattern  || '';
  
  // If `callback` is given buffer the stdout of grep and call `callback`
  // if no `callback`, then behave like a stream by emiting data events 
  // when there are data in stdout.
  //
  // CAUTION: `exec` will execute whatever in `pattern`. For example, this
  //    `grep("some_pattern;rm -rf /", function(err, stdout, stderr) {
  //        ...
  //     });` will delete your root directory. So becareful when using this.
  //
  if (callback) {
    this.destroy();
    exec('grep ' + pattern, callback);
  } else {
    // When no `callback` is given, options to grep must be given
    // in an array. If pattern is a string, then use the following
    // default options: `['-x', '-n', pattern, '-']` (pattern has to
    // match entire line and print the line number)
    var args = [];
    if (pattern instanceof Array) {
      args = pattern;
    } else if (typeof pattern === 'string') {
      args = ['-n', '-m', pattern, '-'];
    }
    console.log("DEBUG 1", args);
    var grep = spawn('grep', args);
    self.grep = grep;
    
    grep.stdout.on('data', function() {
      var args = Array.prototype.slice.call(arguments);
      self.emit.apply(self, ['data'].concat(args));
    });

    grep.stdout.on('end', function() {
      var args = Array.prototype.slice.call(arguments);
      if (args.length) self.emit.apply(self, ['data'].concat(args));
      self.emit('end');
      self.destroy();
    });
    
    // Proxy errors from `grep` to `self`. The `stderr` of `grep` will
    // be treated as errors in `self`.
    grep.stderr.on('data', function(d) {
      var args = Array.prototype.slice.call(arguments);
      self.emit.apply(self, ['error'].concat(args));
    });
    grep.on('error', function() {
      var args = Array.prototype.slice.call(arguments);
      self.emit.apply(self, ['error'].concat(args));
    });
  }
}

util.inherits(Grep, stream);

// Write the data that `self` recieve to `grep.stdin`
Grep.prototype.write = function(data) {
  if (this.writable) {
    var args = Array.prototype.slice.call(arguments);
    return this.grep.stdin.write.apply(this.grep.stdin, args);
  } else {
    return false;
  }
}

Grep.prototype.end = function() {
  var args = Array.prototype.slice.call(arguments);
  if (args.length) this.write.apply(this, args);
  this.grep.stdin.end();
}

Grep.prototype.destroy = function() {
  this.writable = false;
  this.readable = false;
}


module.exports = function(pattern, callback) {
  var options = {};

  if (typeof(pattern) === 'undefined') {
    throw new Error('A pattern or arguments to grep must be given');
  } else {
    options.pattern = pattern;
    options.callback = callback;
    return new Grep(options);
  }
}
