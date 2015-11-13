var _ = require('lodash');

module.exports = function(mongoose) {
    var resourceRouter = require('express').Router();
    var resourceName = process.env.GENERIC_RESOURCE_NAME;
    var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;
    var resourceIDType = process.env.GENERIC_RESOURCE_ID_TYPE;
    var resourceIDRegex = process.env.GENERIC_RESOURCE_ID_REGEX;
    var Field = mongoose.model('Field');
    var Resource = mongoose.model('Resource');
    var producer = require('./producer');

    var toExternal = function(internal) {
      var external = JSON.parse(JSON.stringify(internal.data));
      external[resourceIDName] = internal[resourceIDName];
      return external;
    };

    var toInternal = function(external) {
      var resourceWithoutId = JSON.parse(JSON.stringify(external));
      delete resourceWithoutId[resourceIDName];
      return {
        [resourceIDName]: external[resourceIDName],
        data: resourceWithoutId
      };
    }

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
      require('./validator')(Field, function(validator) {
        validResource = validator.validate(req.body);
        if (!validResource) {
          return res.status(400).send('Message body contains an invalid resource.');
        }
        var resource = new Resource(toInternal(req.body));
        resource.save(function(err, r) {
          if (err) { return res.status(500).json(err); }
          producer.send({
            "resource": resourceName,
            "action": "added",
            "id": r[resourceIDName],
            "object": toExternal(r)
          });
          return res.status(200).json(toExternal(r));
        });
      });
    });

    resourceRouter.put('/:id', function(req, res, next) {
      require('./validator')(Field, function(validator) {
        Resource.findOne({ [resourceIDName]: req.params.id }, function(err, resource) {
          if (!resource) { return res.status(404).send('Resource not found.'); }
          if (err) { return res.status(500).json(err); }
          var unmodified = JSON.parse(JSON.stringify(resource));
          var merged = mergeResource(toExternal(resource), req.body);
          if (!validator.validate(merged)) {
            return res.status(400).send('Message body contains an invalid resource.');
          }
          resource[resourceIDName] = merged[resourceIDName];
          delete merged[resourceIDName];
          resource.data = merged;
          resource.save(function(err, saved) {
            if (err) { return res.status(500).json(err); }
            producer.send({
              "resource": resourceName,
              "action": "modified",
              "id": saved[resourceIDName],
              "old_object": toExternal(unmodified),
              "new_object": toExternal(saved)
            });
            return res.status(200).json(toExternal(saved));
          });
        });
        /*Resource.findOneAndUpdate({ [resourceIDName]: req.params.id }, { $set: toInternal(req.body) }, { upsert: true, new: true }, function(err, resource) {
          if (err) { return res.status(500).json(err); }
          return res.status(200).json(toExternal(resource));
        });*/
      });
    });

    resourceRouter.get('/', function(req, res, next) {
      Resource.find({}, function(err, resources) {
        if (err) { return res.status(500).json(err); }
        return res.status(200).json(resources.map(toExternal));
      });
    });

    resourceRouter.get('/:id', function(req, res, next) {
      Resource.findOne({ [resourceIDName]: req.params.id }, function(err, resource) {
        if (!resource) { return res.status(404).send('resource does not exist.') }
        if (err) { return res.status(500).json(err); }
        return res.status(200).json(toExternal(resource));
      });
    });

    resourceRouter.delete('/:id', function(req, res, next) {
      Resource.findOneAndRemove({ [resourceIDName]: req.params.id }, {}, function(err, resource) {
        if (!resource) { return res.status(404).send('resource does not exist.') }
        if (err) { return res.status(500).json(err); }
        producer.send({
          "resource": resourceName,
          "action": "removed",
          "id": resource[resourceIDName]
        });
        return res.status(204).send('resource deleted.');
      });
    });

    return {
      router: resourceRouter
    };
};
