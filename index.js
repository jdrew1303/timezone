var express = require('express'),
    app     = express(),
    logger  = require('morgan'),
    stylus  = require('stylus');

app.use(logger());

// Stylus
app.use(
  stylus.middleware({
    src:     __dirname + '/assets',
    dest:    __dirname + '/public',
    compile: function (str, path, fn) {
      console.info('Compiling:', str, path)
      return stylus(str)
        .set('filename', path)
        .set('compress', true);
    }
  })
);

// Static files
app.use(express.static(__dirname + '/public'));

// app.get('/', function(req, res){
//   res.send('hello world');
// });

app.listen(3000);