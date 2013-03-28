[1]: http://example.com
[2]: https://github.com/mikeal/request
[3]: http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
# Grep

This is a simple wrapper around `grep(1)`. The module use `child_process` to create
`grep` processes and use streams and callbacks to communicate.

## Install
Using npm:
```sh
$ npm install grep
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

### Configuration

Grep has two configuration options:

  * `buildArgs` allows you to set a custom function which provide arguments to
    `grep(1)`. By default this is set to a function that concatinate given arguments to an
    empty array. So when you call `grep("some_pharse")` the actual arguments given to
    `grep(1)` process is `[ 'some_phrase' ]`.

  * `execOptions` allows you to pass options to each `grep(1)` process. By default this is 
     an empty object. This is the same `option` object you would use when calling
     `child_process.spawn()` or `child_process.execFile()`. When you give a callback, this
     module use `child_process.execFile()`. When no callback, `child_process.spawn()` is
     used. See node [documentation][3] for more information.

#### Examples

Configure globally:
```javascript
// Set buildArgs so grep(1) will count line numbers.
// Set current working directory to '/var/log'
//
// When you call grep("phrase"), a new grep(1) process will
// be created with arguments ["-n", "phrase"]

grep({
    buildArgs:    function(args) { return ['-n'].concat(args) }
  , execOptions:  {cwd: '/var/log'}
});
```
Configure for a single case:
```javascript
var options = { execOptions: {cwd: '/tmp'} }
var search  = grep(['-m', '1', '-n', 'foo', 'bar.txt'], options);
```

### grep([args], [options], callback)

### grep([args], [options])

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
