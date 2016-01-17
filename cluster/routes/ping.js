/**
 * Created by jazalizil on 12/01/2016.
 */
var express = require('express');
var router = express.Router();
var File = require('../models/File');

/* GET ping */

router.get('/:fileId', function(req, res, next){
  File.findById(req.params.fileId, function(err, file){
    if (err || !file) {
      return next(err || {
        status: 404,
        message: 'Not found'
      });
    }
    res.sendStatus(200);
  })
});

module.exports = router;