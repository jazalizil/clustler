/**
 * Created by jazalizil on 12/01/2016.
 */
var express = require('express');
var File = require('../models/File');
var router = express.Router();

/* GET Download file */

router.get('/', function(req, res){
  File.find({}, function(err, files){
    if (err) {
      return next(err);
    }
    res.json(files);
  });
});

module.exports = router;