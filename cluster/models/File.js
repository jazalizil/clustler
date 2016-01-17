/**
 * Created by jazalizil on 12/01/2016.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var File = new Schema({
  id : ObjectId,
  name : String,
  date : {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('File', File);