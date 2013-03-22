var assert = require('assert');
var stream = require('stream');
var fs = require('fs');
var grep = require('../grep.js');

var fileStream = function() {
  return fs.createReadStream('./testFile.txt');
}

describe('grep({options})', function() {
  describe('#defaultArgs', function() {
    after(function() {
      grep({defaultArgs: function(p){return [].concat(p)}});
    });

    it('should be an array that contain passed arguments by default', function() {
      assert.deepEqual([''], grep().defaultArgs);
      assert.deepEqual(['tst'], grep('tst').defaultArgs);
    });

    it('should be customizable', function() {
      var args = function(pattern) {
        return ['-n', pattern + "TST"];
      }
      var args2 = function() {
        return []
      }

      grep({defaultArgs: args});
      assert.deepEqual(['-n', 'testTST'], grep('test').defaultArgs);

      grep({defaultArgs: args2});
      assert.deepEqual([], grep("test").defaultArgs);
    });
  });

  after(function() {
    grep({cwd: ''});
  });
  describe('#cwd', function() {
    it('should the empty string by default', function() {
      assert.deepEqual('', grep().cwd);
    });

    it('should be customizable', function() {
      grep({cwd: __dirname});
      assert.deepEqual(__dirname, grep().cwd);
    });
  });
});

describe('grep([args])', function() {
  it('should be a duplex stream', function() {
    var find = grep();

    assert.equal(true, find instanceof stream);
    assert.equal(true, find.writable && find.readable);
  });

  it('should throw an error when incomplete arguments are given', function(done) {
    var find = grep(['-n', 'people', 'testFile.txt']);

    find.once('error', function() {
      done();
    });

    find.once('data', function() {
      done(new Error('Was not expecting data from stream'));
    });
  });

  it('should not throw an error when complete arguments are given', function(done) {
    var find = grep(['-n', 'people', 'testFile.txt']);

    find.once('error', function(err) {
      done(new Error(err));
    });

    find.once('data', function() {
      done();
    });
  });
});

describe('grep([args], callback)', function() {
  it('should be a destroyed stream', function() {
    var find = grep(function(){});
    assert.equal(false, find.readable);
    assert.equal(false, find.writable);
    assert.equal(true, find instanceof stream);
  });

  it('should throw an error when incomplete arguments are given', function(done) {
    grep(['-n', 'people', '/tmp/soda'], function(err, stdout, stderr) {
      if (err) {
        done();
      } else {
        done(new Error(err));
      }
    });
  });

  it('should not throw errors when complete arguments are given', function(done) {
    grep(['-n', 'people', '/tmp/soda'], function(err, stdout, stderr) {
      done(err)
    });
  });
});
