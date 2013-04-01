[1]: http://example.com
[2]: https://github.com/mikeal/request
[3]: http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
[4]: http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback
# Grep

This is a simple wrapper around `grep(1)`. The module use `child_process` to create
`grep` processes and use streams and callbacks to communicate.

## Install
Using npm:
```sh
$ npm install grep1
```
From source:
```sh
$ git clone https://github.com/ladinu/node-grep.git
$ cd node-grep
$ npm link
```

## Examples

Grep file `/tmp/file` for expression *spurs*:
```javascript
var grep = require('grep1');

grep(['spurs', '/tmp/file'], function(err, stdout, stderr) {
  if (err || stderr) {
    console.log(err, stderr);
  } else {
    console.log(stdout);
  }
});
```

Grep file `/tmp/file` for expression *spurs*:
```javascript
var search = grep(['spurs', '/tmp/file']);

search.pipe(process.stdout);

search.on('error', function(err) {
  console.log(err);
});
```

Using [request][2], grep [example.com][1] for expression *examples*
```javascript
var req    = require('request');
var search = grep('examples');

search.pipe(process.stdout);
req('http://example.com').pipe(search);
```

## API

### Class: Grep

This class wrap `grep(1)` using node's `child_process` module. When a callback is given
`child_process.execFile()` is used and returns a `Grep` object which is a destroyed stream.
When no callback, `child_process.spawn()` is used and returns a `Grep` object which is a
stream.


#### Event: 'error'

Process's `stderr` is emitted as `error` events.

#### Event: 'data'

Process's `stdout` is emitted as `data` events.

### grep([args], [options], callback)
 
  * `args` The arguments given to `grep(1)` processes. By default `args` is concatinated
    with an empty array and passed to `grep(1)` process. See `options` to change this
    behaviour.
  
  * `options` *Object* for `Grep` object. Note 

    * `buildArgs` *Function* that build arguments for `grep(1)` processes. By default this is
      set to a function that concatinate given `args` to an empty array.  So when you call 
      `grep("some_phrase")` the actual arguments given to `grep(1)` process is 
      `[ 'some_phrase' ]`.

    * `execOptions` *Object* that give options such as `cwd` to each `grep(1)` process. By
      default this is an empty object. This is the same `options` object that you would use
      when calling `child_process.execFile()` or `child_process.spawn()`. Because a callback
      is given, `child_process.execFile()` is used. See node [documentation][4] for more 
      information.


  * `callback` *Function* that is called when `grep(1)` process terminate
    * `error` *Error*
    * `stdout` *Buffer*
    * `stderr` *Buffer*

  * Returns a `Grep` object

### grep([args], [options])

  * `args` Same as `grep([args], [options], callback)`

  * `options` Same as `grep([args], [options], callback)` except `child_process.spawn()`
    is used. See node [documentation][3] for more infromation

  * Returns a `Grep` object



### grep.configure([options])

This will make `options` global when `options` is not given to `grep([args], [options])`
or `grep([args], [options], callback)`

  * Returns: nothing

For example:
```javascript
var grep = require('grep1');

// Set buildArgs so grep(1) will count line numbers.
// Set current working directory to '/var/log' and perform
// grep operations on file 'some.log'
//
// When you call grep("phrase"), a new grep(1) process will
// be created with arguments ['-n', 'phrase', 'some.log']

var fs      = require('fs');
warningFile = fs.createWriteStream('./warnings.txt');
errorFile   = fs.createWriteStream('./errors.txt');

grep.configure({
    buildArgs:    function(args) { return ['-n', args, 'some.log'] }
  , execOptions:  {cwd: '/var/log'}
});

var warning = grep('[+} Warning');
var errors  = grep('[!] Error');

warning.pipe(warningFile);
errors.pipe(errorFile);


// Grep file '/tmp/foo.txt' for first occurance of 'bar'
// Note: global options set above do not apply because we 
// are giving an an empty options object

var options = {};
var bar     = grep(['-m', '1', 'bar', '/tmp/foo.txt'], options);
bar.pipe(process.stdout);
```

### grep.resetConfig()

Helper method to clear global settings. This basically set `buildArgs` to `null` and
`execOptions` to an empty object.


## License

Copyright (c) 2013 Ladinu Chandrasinghe

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
