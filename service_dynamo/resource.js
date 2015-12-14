var _ = require('lodash');

module.exports = function(ddb) {
    var resourceRouter = require('express').Router();
    var resourceName = process.env.GENERIC_RESOURCE_NAME;
    var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;
    var resourceIDType = process.env.GENERIC_RESOURCE_ID_TYPE;
    var resourceIDRegex = process.env.GENERIC_RESOURCE_ID_REGEX;
    // var producer = require('./producer');

    var mergeResource = function(original, updated) {
      var result = original;
      for (var key in updated) {
        if (updated.hasOwnProperty(key)) {
          result[key] = updated[key];
        }
      }
      return result;
    };

    resourceRouter.post('/', function(req, res, next) {
      require('./validator')(ddb, function(validator) {
        validResource = validator.validate(req.body);
        if (!validResource) {
          return res.status(400).send('Message body contains an invalid resource.');
        }
        var resource = {};
        for (key in req.body) {
          if (req.body.hasOwnProperty(key)) {
            resource[key] = req.body[key];
          }
        }
        ddb.putItem('resource', resource, {}, function(err, r) {
          if (err) { return res.status(500).json(err); }
          // producer.send({
          //   "resource": resourceName,
          //   "action": "added",
          //   "id": resource[resourceIDName],
          //   "object": resource
          // });
          return res.status(200).json(resource);
        });
      });
    });

    resourceRouter.put('/:id', function(req, res, next) {
      require('./validator')(ddb, function(validator) {
        ddb.getItem('resource', req.params.id, null, {}, function(err, unmodified) {
          if (err) return res.status(500).json(err);
          if (!unmodified) { return res.status(404).send('field does not exist.'); }

          var merged = JSON.parse(JSON.stringify(unmodified));
          for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
              merged[key] = req.body[key];
            }
          }
          if (!validator.validate(merged)) {
            return res.status(400).send('Message body contains an invalid resource.');
          }

          ddb.deleteItem('resource', req.params.id, null, {}, function(err, dr) {
            if (err) return res.status(500).json(err);
            ddb.putItem('resource', merged, {}, function(err, pr) {
              if (err) return res.status(500).json(err);
              // producer.send({
              //   "resource": resourceName,
              //   "action": "modified",
              //   "id": merged[resourceIDName],
              //   "old_object": unmodified,
              //   "new_object": merged
              // });
              return res.status(200).json(merged);
            });
          });
        });
      });
    });

    resourceRouter.get('/', function(req, res, next) {
      ddb.scan('resource', {}, function(err, resources) {
        if (err) { return res.status(500).json(err); }
        if (resources.items) {
          return res.status(200).json(resources.items);
        } else {
          return res.status(200).json(resources);
        }
      });
    });

    resourceRouter.get('/:id', function(req, res, next) {
      ddb.getItem('resource', req.params.id, null, {}, function(err, resource) {
        if (!resource) { return res.status(404).send('field does not exist.') }
        if (err) { return res.status(500).json(err); }
        return res.status(200).json(resource);
      });
    });

    resourceRouter.delete('/:id', function(req, res, next) {
      ddb.getItem('resource', req.params.id, null, {}, function(err, resource) {
        if (!resource) { return res.status(404).send('resource does not exist.') }
        if (err) { return res.status(500).json(err); }
        ddb.deleteItem('resource', req.params.id, null, {}, function(err, r) {
          if (err) { return res.status(500).json(err); }
          // producer.send({
          //   "resource": resourceName,
          //   "action": "removed",
          //   "id": resource[resourceIDName]
          // });
          return res.status(200).send('resource deleted.');
        });
      });
    });

    return {
      router: resourceRouter
    };
};
