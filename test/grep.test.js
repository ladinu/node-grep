var assert = require('assert');
var stream = require('stream');
var fs = require('fs');
var grep = require('../grep.js');

describe('grep.js', function() {

  describe('grep("pattern")', function(){
    var search = grep('some_pattern');

    it('should be a duplex stream', function() {
      assert.equal(true, search instanceof stream);
      assert.equal(true, search.writable && search.readable);
    });

    it('should have an empty array as the default arguments', function() {
      assert.deepEqual([], search.defaultArgs);
    });

    it('default argumets should be customizable', function() {
      var expression = "some_pattern";
      var tstArray   = ['-n', '-m', '1', expression + 'TST', '-'];
      grep(function(pattern) {
        return ['-n', '-m', '1', pattern + 'TST', '-'];
      });
      assert.deepEqual(tstArray, grep(expression).defaultArgs);
      grep(function() {
        return [];
      });
      assert.deepEqual([], grep(expression).defaultArgs);
    });
  });

  describe('grep("pattern", callback)', function() {
    var search = grep('some_pattern', function(){});

    it('should be a destroyed stream', function() {
      var destroyed = !(search.writable && search.readable);
      assert.equal(true, (search instanceof stream) && destroyed);
    });

    it('should have an empty array as the default arguments', function() {
      assert.deepEqual([], search.defaultArgs);
    });

    it('default argumets should be customizable', function() {
      grep(function() {
        return ['-n'];
      });
      assert.deepEqual(['-n'], grep("soda", function(){}).defaultArgs);
      grep(function() {
        return [];
      });
      assert.deepEqual([], grep("asd").defaultArgs);
    });
  });
});
