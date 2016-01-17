/**
 * Created by jazalizil on 11/01/2016.
 */
var express = require('express');
var clustersMiddleware = require('../middlewares/clusters');
var File = require('../models/File');
var async = require('async');
var router = express.Router();

/* GET Download file */

router.get('/:fileId', clustersMiddleware.getActive, clustersMiddleware.isFileUploaded, function(req, res, next){
  var blockSize;
  var file = req.file;
  var response = [];
  blockSize = Math.floor(file.size / req.clusters.length);
  var count = 0;
  async.each(req.clusters,
    function(cluster, cb){
      var blockPosition = blockSize * count;
      if (count === req.clusters.length - 1 && +blockPosition + +blockSize !== file.size) {
        blockSize = file.size - blockPosition;
      }
      response.push({
        url: cluster.url + 'connect/' + cluster.fileToDl,
        clusterId: cluster.id,
        blockPosition : blockPosition,
        blockSize: blockSize
      });
      count++;
      cb();
    },
    function(err){
      if (err || response.length === 0) {
        return next({
          status: '412',
          message: 'File is not available on current clusters'
        });
      }
      res.json({
        mimeType: file.mimeType,
        size: file.size,
        name: file.name,
        datas: response
      });
    });
});

module.exports = router;