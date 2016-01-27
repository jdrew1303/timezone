var express = require('express');
var app = express();
var logger = require('morgan');
var stylus = require('stylus');
var autoprefixer  = require('autoprefixer-stylus');
var React = require('react');
var moment = require('moment-timezone');
var fs = require('fs');
var request = require('request');
var _ = require('lodash');

var transform = require('./app/utils/transform.js');

// Allow direct requiring of .jsx files
require('node-jsx').install({extension: '.jsx'});

// Should switch this out for proper Handlebars usage
function template (body, people, done) {
  fs.readFile('./app/views/layout.hbs', 'utf8', function (err, layout) {
    if (err) done(err);
    done(null, layout
                .replace('{{{body}}}', body)
                .replace('{{{people}}}', JSON.stringify(getPeople(people))));
  });
}

function getPeople(people) {

  var processedPeople = _.map(people, function(person){
    var zone = person.tz || "Europe/Berlin";
    var name = person.real_name || person.name;
    return {
      "name": name,
      "avatar": person.profile.image_192,
      "city": zone,
      "tz": zone
    }
  });
  return processedPeople;
}

app.use(logger('common'));

// Stylus
app.use(
  stylus.middleware({
    src:     __dirname + '/assets',
    dest:    __dirname + '/public',
    compile: function (str, path, fn) {
      return stylus(str)
        .use(autoprefixer())
        .set('filename', path);
        // .set('compress', true);
    }
  })
);

app.get('/', function(err, res){

  request('https://slack.com/api/users.list?token=xoxp-3858018789-18406319651-19564095191-2ddafa0e03', function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var people = JSON.parse(body).members;

      var App = require('./app/views/app.jsx');

      // Organize into timezones
      var time = moment();
      var timezones = transform(time, getPeople(people));

      var body = React.renderToString(
        React.createElement(App, {
          time: time,
          timezones: timezones
        })
      );

      template(body, people, function(err, html){
        if (err) throw err;
        res.send(html);
      });
    }
  })
});

// Static files
app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 3000);
