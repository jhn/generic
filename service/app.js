var express = require('express');

var app = express();

var resourceName = process.env.GENERIC_RESOURCE_NAME;
var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;
var resourceIDType = process.env.GENERIC_RESOURCE_ID_TYPE;
var servicePort = process.env.GENERIC_SERVICE_PORT;

app.use('/config', require('./config'));
app.use('/' + resourceName, require('./resource'));

app.listen(servicePort ? servicePort : 3000, function() {
  console.log('listening on port: ' + (servicePort ? servicePort : 3000));
});