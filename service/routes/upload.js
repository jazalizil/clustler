/**
 * Created by jazalizil on 11/01/2016.
 */
var express = require('express');
var router = express.Router();
var clustersMiddleware = require('../middlewares/clusters');
var request = require('request');
var multer = require('multer');
var async = require('async');
var File = require('../models/File');
var upload = multer();

/* POST File to upload */

router.post('/', clustersMiddleware.getActive, upload.single('file'), function(req, res, next){
  var cluster;
  var file = new File();
  file.name = req.file.originalname;
  if (typeof req.file === 'undefined') {
    return next({
      status: 442,
      message: 'Missing file'
    })
  }
  async.each(req.clusters,
    function(cluster, callback){
      var url = cluster.url + 'upload/';
      var toCluster = request.post(url, function (error, response, body) {
        if (error) {
          console.error("" + error);
          return;
        }
        var clusterIp = response.req.res.request.originalHost;
        if (error || response.statusCode !== 200) {
          console.error('upload failed on cluster ' + clusterIp);
        }
        else {
          console.log('file', file._id, 'uploaded with success on cluster ' + cluster.id);
          var jsonBody = JSON.parse(body);
          file.clusters.push({
            ip: clusterIp,
            fileId: jsonBody.id,
            clusterId: cluster.id
          });
          file.size = req.file.size;
          file.mimeType = req.file.mimetype;
        }
        callback();
      });
      var form = toCluster.form();
      form.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
    },
    function(err){
      file.save();
    });
  res.json({
    _id: file._id,
    name: file.name,
    mimeType: req.file.mimetype,
    size: req.file.size,
    clusters: req.clusters
  });
});

module.exports = router;