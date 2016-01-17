/**
 * Created by jazalizil on 11/01/2016.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var File = require('../models/File');
var config = require('../config/config');
var upload = multer();

router.post('/', upload.single('file'), function(req, res, next){
  var file = new File();
  file.name = file._id + '_' + req.file.originalname;
  fs.open('uploads/' + file.name, 'w', function(err, fd){
    if (err) {
      console.error(err);
      return next(err);
    }
    fs.write(fd, req.file.buffer, 0, req.file.buffer.length, function(err){
      if (err) {
        console.error(err);
        return next(err);
      }
      fs.close(fd, function(err){
        if (err) {
          console.error(err);
          return next(err);
        }
        file.save(function(err, file){
          if (err) {
            var error = new Error(err);
            console.error(err);
            return next(error);
          }
          res.json({
            id: file._id
          });
        });
      });
    })
  });
});

module.exports = router;