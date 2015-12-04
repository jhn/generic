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

ddb.createTable('resource', { hash: [resourceIDName, 'S'] },
          {read: 10, write: 10}, function(err, details) {
            if (err) { console.log(err) }
            ddb.createTable('field', { hash: ['name', 'S'] },
                            {read: 10, write: 10}, function(err, details) {
                              if (err) { console.log(err) }
                              console.log('Tables created. Waiting 20 seconds.')
                              setTimeout(function() {
                                var config = require('./config')(ddb);
                                var resource = require('./resource')(ddb);

                                var app = express();

                                app.use(bodyParser.urlencoded());
                                app.use(bodyParser.json());

                                app.use('/' + resourceName + '/config', config.router);
                                app.use('/' + resourceName, resource.router);

                                app.listen(servicePort ? servicePort : 3000, function() {
                                  console.log('listening on port: ' + (servicePort ? servicePort : 3000));
                                });
                              }, 20000);
                            });
        });
