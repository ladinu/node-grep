var assert = require('assert');
var stream = require('stream');
var fs     = require('fs');
var path   = require('path');
var crypto = require('crypto');
var grep   = require('../grep.js');

var getPath  = function(file) {
  return path.join(__dirname, file);
}

var readFile = function(file) {
  return fs.createReadStream(getPath(file));
}

var setSettings = function() {
  grep({ execOptions: { cwd: __dirname } });
}

var compareStreams = function(stream1, stream2, done) {
  var stream1Hash = crypto.createHash('sha1');
  var stream2Hash = crypto.createHash('sha1');

  var updateHash = function(callback) {
    var lock = 0;
    stream1.on('data', function(data) {
      stream1Hash.update(data)
    });

    stream2.on('data', function(data) {
      stream2Hash.update(data);
    });

    stream1.once('end', function() {
      ++lock;
      if (lock === 2) callback();
    });

    stream2.once('end', function() {
      ++lock;
      if (lock === 2) callback();
    });
  }

  updateHash(function() {
    var equal = (stream1Hash.digest('hex') === stream2Hash.digest('hex'));
    if (equal) done(); else done(new Error("Streams differ"));
  });
}


before(setSettings);
describe('#grep([args], {options})', function() {
  it('should be a duplex stream', function() {
    var find = grep("some pattern");

    assert.equal(true, find instanceof stream);
    assert.equal(true, find.writable && find.readable);
  });
  it('should throw an error when incomplete arguments are given', function(done) {
    var find = grep(['-m', 'people', 'testFile0.txt']);

    find.once('error', function() {
      done();
    });

    find.once('data', function() {
      done(new Error('Was not expecting data from grep'));
    });
  });

  it('should not throw an error when complete arguments are given', function(done) {
    var find = grep(['-m', '1', 'people', 'testFile0.txt']);

    find.once('error', function(err) {
      done(new Error(err));
    });

    find.once('data', function() {
      done();
    });
  });

  it('should match regular grep output', function(done) {
    var options = {
        buildArgs: function(a) {return ['-n'].concat(a)}
      , execOptions: {cwd: __dirname}
    }
    var file = readFile("testFile0.txt");
    var find = grep("is", options);

    compareStreams(readFile("testFile1.txt"), find, done)
    file.pipe(find);
  });
});


before(setSettings);
describe('#grep([args], {options}, callback)', function() {
  it('should be a destroyed stream', function() {
    var find = grep("some_pattern", function(){});

    assert.equal(false, find.readable);
    assert.equal(false, find.writable);
    assert.equal(true, find instanceof stream);
  });

  it('should throw an error when incomplete arguments are given', function(done) {
    var callback = function(err, stdout, stderr) {
      if (err) done(); else done(new Error(err));
    }
    grep(['-m', 'people', 'testFile0.txt'], callback);
  });

  it('should not throw errors when complete arguments are given', function(done) {
    var callback = function(err, stdout, stderr) {
      done(err);
    }
    grep(['-m', '1', 'people', 'testFile1.txt'], callback);
  });

  it('should match regular grep output', function(done) {
    var options = {
        buildArgs: function(a) {return ['-n', a, 'testFile0.txt']}
      , execOptions: {cwd: __dirname}
    }
    grep('is', options, function(err, stdout, stderr) {
      var hash1    = crypto.createHash('sha1');
      var hash2    = crypto.createHash('sha1');
      var fileData = fs.readFileSync(getPath('testFile1.txt'));

      hash1.update(stdout);
      hash1 = hash1.digest('hex');

      hash2.update(fileData);
      hash2 = hash2.digest('hex');

      if (hash1 === hash2) done(); else done(new Error('grep output does not match'));
    });
  });
});
