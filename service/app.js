var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

require('console-stamp')(console, { pattern: 'UTC:dd/mmm/yyyy:HH:MM:ss o' });

var upload = require('./routes/upload');
var download = require('./routes/download');
var list = require('./routes/list');
var config = require('./config/config');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.set('port', process.env.PORT || 3000);

// Server
server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

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

// Setup logger
app.use(logger('common'));
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

app.use('/upload', upload);
app.use('/download', download);
app.use('/list', list);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        code: err.status
      });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        code: err.status
    });
});

// Sockets
io.on('connection', function (socket) {
  var ip = socket.request.connection.remoteAddress.split('::').slice(-1).join('').split(':').slice(-1).join('');
  socket.emit('hello');
  socket.on('ehlo', function (data) {
    console.log("[SOCKET] hello received from socket", socket.id, "on address", ip + ":" + data.port + " with clusterID " + data.id);
    var url = 'http://' + ip + ':' + data.port + '/';
    config.clusters.push({
      url: url,
      socketId: socket.id,
      id: data.id
    });
  });
  socket.on('disconnect', function(){
    var i = config.clusters.length;
    while(i--) {
      if (config.clusters[i].socketId === socket.id) {
        config.clusters.splice(i, 1);
      }
    }
    console.log('[SOCKET]', socket.id, 'disconnected');
  })
});

module.exports = app;