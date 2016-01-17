var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');


require('console-stamp')(console, { pattern: 'UTC:dd/mmm/yyyy:HH:MM:ss o' });

var connect = require('./routes/connect');
var upload = require('./routes/upload');
var ping = require('./routes/ping');

var config = require('./config/config');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// Database
mongoose.connect(config.dbHost);

mongoose.connection.on('error', function(err) {
  console.error('Mongoose: Failed to connect to DB ' + config.dbHost + ' on startup ', err);
});
mongoose.connection.on('disconnected', function() {
  console.error('Mongoose: ' + config.dbHost + ' disconnected');
});
mongoose.connection.once('open', function() {
  console.log('Mongoose connected on server ' + config.dbHost);
});

// setup the logger
app.use(logger('combined'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Routes
app.use('/connect', connect);
app.use('/upload', upload);
app.use('/ping', ping);


/// catch 404 and forward to error handler
app.use(function(req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    res.json({
      message: err.message,
      code: err.status
    });
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.send(err.message);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;