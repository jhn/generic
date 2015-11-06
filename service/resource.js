var _ = require('lodash');

module.exports = function(mongoose) {
    var resourceRouter = require('express').Router();
    var resourceName = process.env.GENERIC_RESOURCE_NAME;
    var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;
    var resourceIDType = process.env.GENERIC_RESOURCE_ID_TYPE;
    var resourceIDRegex = process.env.GENERIC_RESOURCE_ID_REGEX;
    var Field = mongoose.model('Field');
    var Resource = mongoose.model('Resource');

    resourceRouter.post('/', function(req, res, next) {
      require('./validator')(Field, function(validator) {
        validResource = validator.validate(req.body);
        if (!validResource) {
          return res.status(400).send('Message body contains an invalid resource.');
        }
        var resource = new Resource(req.body);
        resource.save(function(err, r) {
          if (err) { return res.status(500).json(err); }
          return res.status(200).json(r);
        });
      });
    });

    resourceRouter.get('/', function(req, res, next) {
      Resource.find({}, function(err, resources) {
        if (err) { return res.status(500).json(err); }
        return res.status(200).json(resources);
      });
    });

    resourceRouter.delete('/:id', function(req, res, next) {
      Resource.findOneAndRemove({ [resourceIDName]: req.params.id }, {}, function(err, resource) {
        if (resource === null) { return res.status(404).send('resource does not exist.') }
        if (err) { return res.status(500).json(err); }
        return res.status(204).send('resource deleted.');
      });
    });

    return {
      router: resourceRouter
    };
};
