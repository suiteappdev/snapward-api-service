var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Load required packages
var timestamps = require('mongoose-timestamp');
var metadata = require('./plugins/metadata');

var entity = "request";

var _Schema = new Schema({
 	   data : { type : Object},
	  _user : {type : Schema.Types.ObjectId , ref : 'User'},
 });

_Schema.pre('save', function (next) {
	_self = this;
});

//add plugins
_Schema.plugin(metadata);
_Schema.plugin(timestamps);

module.exports = mongoose.model(entity, _Schema); 
