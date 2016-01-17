/**
 * Created by jazalizil on 11/01/2016.
 */
var config = require('../config/config');
var async = require('async');
var request = require('request');
var File = require('../models/File');

var getActiveClusters = function(req, res, next) {
  req.clusters = config.clusters;
  if (req.clusters.length === 0) {
    return next({
      status: 442,
      message: 'No cluster available'
    });
  }
  next();
};

var isFileUploaded = function(req, res, next) {
  var clusters = [];
  File.findById(req.params.fileId, function(err, file){
    if (err || !file) {
      return next(err);
    }
    req.file = file;
    async.each(req.clusters,
      function(cluster, callback){
        var fileId;
        for(var i=0; i < file.clusters.length; i++){
          if (file.clusters[i].clusterId == cluster.id) {
            fileId = file.clusters[i].fileId;
          }
        }
        if (typeof fileId === 'undefined') {
          console.error('file', req.params.fileId, 'not on cluster', cluster.id);
          return callback();
        }
        var url = cluster.url + 'ping/' + fileId;
        console.log('prepare to ping', url);
        request.get(url)
          .on('response', function(response) {
            if (response.statusCode !== 200) {
              console.error('File', req.params.fileId, 'unavailable on cluster', cluster.id);
            } else {
              cluster.fileToDl = fileId;
              clusters.push(cluster);
            }
            callback();
          })
          .on('error', function(){
            console.error('Cluster', cluster.id, 'unavailable');
          })
      }, function(){
        if (clusters.length === 0) {
          return next({
            status: '412',
            message: 'File is not available on current clusters'
          })
        }
        req.clusters = clusters;
        next();
      });
  });

};

module.exports = {
  getActive: getActiveClusters,
  isFileUploaded: isFileUploaded
};
