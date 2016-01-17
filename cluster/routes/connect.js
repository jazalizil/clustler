/**
 * Created by jazalizil on 11/01/2016.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var File = require('../models/File');

var PATH = "uploads/";

/* GET params: fileId */

router.get('/:fileId', function(req, res, next){
  var fileId = req.params.fileId, fileName;
  File.findById(fileId, function(err, file){
    if (err) {
      return next(err);
    }
    fileName = PATH + file.name;
    var readStream = fs.createReadStream(PATH + file.name, {
      encoding: 'binary',
      flags: 'r',
      mode: '0666',
      start: +req.query.blockPosition,
      end: +req.query.blockPosition + +req.query.blockSize - 1
    });
    readStream
      .on('open', function(){
        readStream.pipe(res);
      })
      .on('error', function(err){
        return next(err);
      });
  })
});

module.exports = router;