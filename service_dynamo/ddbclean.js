var resourceName = process.env.GENERIC_RESOURCE_NAME;
var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;
var servicePort = process.env.GENERIC_SERVICE_PORT;

var express = require('express');
var bodyParser = require('body-parser');

var accessKey = process.env.GENERIC_AWS_KEY_ID
var secret = process.env.GENERIC_SECRET_AWS_KEY

var ddb = require('./ddb.js').ddb({ accessKeyId: accessKey,
                                    secretAccessKey: secret,
                                    region: 'us-east-1' });

ddb.deleteTable('resource', function(err, details) {
  if (err) { console.log(err) }
  ddb.deleteTable('field', function(err, details) {
    if (err) { console.log(err) }
    console.log('Started deleting tables. Waiting 20 seconds.')
    setTimeout(function() {console.log('Deleting tables completed.') }, 20000);
  });
});
