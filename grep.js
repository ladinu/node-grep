var util     = require('util');
var stream   = require('stream');
var spawn    = require('child_process').spawn;
var execFile = require('child_process').execFile;

// Search a stream or a file using grep
function Grep(options) {
  stream.call(this);
  var self      = this;
  this.writable = true;
  this.readable = true;

  var options     = options             || {}
  var callback    = options.callback    || null;
  var args        = options.args        || '';
  var execOptions = options.execOptions || {}
  var buildArgs   = options.buildArgs   || function(a) { return [].concat(a) }

  args = buildArgs(args);

  if (callback) {
    this.destroy();
    execFile('grep', args, execOptions, callback);
  } else {
    var grep = spawn('grep', args, execOptions);
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
    
    // Proxy errors from `grep` to `self`. The `stderr` of `grep`
    // This will be treated as `error` events in `self`
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

// Proxy data written to `self` to `stdin` of grep process
Grep.prototype.write = function() {
  return this.grep.stdin.write.apply(this.grep.stdin, arguments);
}

Grep.prototype.end = function() {
  // Handle common node convention `stream.end("some_data");`
  if (arguments.length) this.write.apply(this, arguments);
  this.grep.stdin.end();
}

Grep.prototype.destroy = function() {
  this.writable = false;
  this.readable = false;
}


var settings = {
    buildArgs  : null
  , execOptions: {}
}

var grep = function(args, options, callback) {

  // Resolve ambigious `callback`
  if (typeof args === 'function') {
    callback = args;
    args = null;
  } else if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  var grepOptions = {}

  if (options) {
    grepOptions.buildArgs   = options.buildArgs;
    grepOptions.execOptions = options.execOptions;
  } else {
    grepOptions.buildArgs = settings.buildArgs;
    grepOptions.execOptions = settings.execOptions;
  }

  grepOptions.args        = args;
  grepOptions.callback    = callback;

  return new Grep(grepOptions);
}

grep.configure = function(options) {
  var options = options || {}

  settings.buildArgs   = options.buildArgs   || null;
  settings.execOptions = options.execOptions || {};

}

grep.resetConfig = function() {
  settings.buildArgs = null;
  settings.execOptions = {}
}

module.exports = grep;
