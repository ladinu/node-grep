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
  var args = Array.prototype.slice.call(arguments);
  return this.grep.stdin.write.apply(this.grep.stdin, args);
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


var settings = {
    buildArgs  : null
  , execOptions: {}
}

var grep = function(args, options, callback) {

  // Resolve ambigious `callback`
  if (typeof args === 'function') {
    callback = args;
  } else if (typeof options === 'function') {
    callback = options;
  }

  // Only return a `Grep` object when `args` is either a string or an array
  if ( (typeof(args) === 'string') || (args instanceof Array)) {

    var grepOptions         = {};
    var options             = options             || {}
    grepOptions.args        = args                || '';
    grepOptions.buildArgs   = options.buildArgs   || settings.buildArgs;
    grepOptions.execOptions = options.execOptions || settings.execOptions;
    grepOptions.callback    = callback;
    return new Grep(grepOptions);

  // Return nothing if only called only with a settings object. For example:
  //   ```
  //    grep({
  //      buildArgs: function(a){return ['-n', a, '-']}
  //      })
  //   ```
  // When `buildArgs` isnt specfied, the function `buildArgs` above will be used.
  } else if (arguments.length === 1) {
    settings.buildargs   = args.buildargs;
    settings.execOptions = args.execOptions;
  }
}

module.exports = grep;
