var resourceName = process.env.GENERIC_RESOURCE_NAME;
var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;
var resourceIDType = getType(process.env.GENERIC_RESOURCE_ID_TYPE);
var servicePort = process.env.GENERIC_SERVICE_PORT;

function getType(typeString) {
  switch (typeString) {
    case "Number":
      return Number;
      break;
    case "Date":
      return Date;
      break;
    case "Array":
      return Array;
      break;
    case "Boolean":
      return Boolean;
      break;
    case "Object":
      return Object;
      break;
    default:
      return String;
  };
}

var express = require('express');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/service-' + resourceName);

var Schema = mongoose.Schema;

var ResourceSchema = new Schema({
  [resourceIDName]: { type: resourceIDType, required: true, unique: true },
  data: { type: Object, required: true }
});

var Resource = mongoose.model('Resource', ResourceSchema);

var FieldSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  required: Boolean,
  validation: String
});

FieldSchema.add({ subfields: [FieldSchema] });

var Field = mongoose.model('Field', FieldSchema);

var config = require('./config')(mongoose);
var resource = require('./resource')(mongoose);

var app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use('/config', config.router);
app.use('/' + resourceName, resource.router);

app.listen(servicePort ? servicePort : 3000, function() {
  console.log('listening on port: ' + (servicePort ? servicePort : 3000));
});
