var assert = require('assert');
var stream = require('stream');
var fs = require('fs');
var grep = require('../grep.js');

var fileStream = function() {
  return fs.createReadStream('./testFile.txt');
}

describe('grep([args], {options})', function() {
  it('should be a duplex stream', function() {
    var find = grep("some pattern");

    assert.equal(true, find instanceof stream);
    assert.equal(true, find.writable && find.readable);
  });

  it('should throw an error when incomplete arguments are given', function(done) {
    var options = {cwd: __dirname}

    var find = grep(['-m', 'people', 'testFile.txt'], options);
    find.once('error', function() {
      done();
    });

    find.once('data', function() {
      done(new Error('Was not expecting data from stream'));
    });
  });

  it('should not throw an error when complete arguments are given', function(done) {
    var options = {cwd: __dirname}

    var find = grep(['-m', '1', 'people', 'testFile.txt'], options);

    find.once('error', function(err) {
      done(new Error(err));
    });

    find.once('data', function() {
      done();
    });
  });
});

describe('grep([args], {options}, callback)', function() {
  it('should be a destroyed stream', function() {
    var find = grep("some_pattern", function(){});
    assert.equal(false, find.readable);
    assert.equal(false, find.writable);
    assert.equal(true, find instanceof stream);
  });

  it('should throw an error when incomplete arguments are given', function(done) {
    var options = {cwd: __dirname}
    var callback = function(err, stdout, stderr) {
      if (err) {
        done();
      } else {
        done(new Error(err));
      }
    }
    grep(['-m', 'people', 'testFile.txt'], options, callback);
  });

  it('should not throw errors when complete arguments are given', function(done) {
    var options = {cwd: __dirname}
    var callback = function(err, stdout, stderr) {
      done(err);
    }
    grep(['-m', '1', 'people', 'testFile.txt'], options, callback);
  });
});
