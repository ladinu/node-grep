var assert = require('assert');
var stream = require('stream');
var fs = require('fs');
var grep = require('../grep.js');

describe('grep.js', function() {
  describe('grep("pattern")', function(){
    var search = grep('some_pattern');

    it('should be a stream', function() {
      assert.equal(true, search instanceof stream);
    });

    it('should be a duplex stream', function() {
      assert.equal(true, search.writable && search.readable);
    });
  });

  describe('grep("pattern", callback)', function() {
    var search = grep('some_pattern', function(){});

    it('should be a destroyed stream', function() {
      var destroyed = !(search.writable && search.readable);
      assert.equal(true, (search instanceof stream) && destroyed);
    });
  });
});
