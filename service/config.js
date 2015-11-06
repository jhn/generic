var _ = require('lodash');

module.exports = function(mongoose) {

  var configRouter = require('express').Router();
  var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;
  var Field = mongoose.model('Field');
  var Resource = mongoose.model('Resource');

  configRouter.post('/field', function(req, res, next) {
    if (req.body.name === resourceIDName) {
      return res.status(400).send('name cannot be the id name');
    }
    Field.findOne({ 'name': req.body.name }, function (err, person) {
      if (err) res.status(500).json(err);
      if (person) {
        return res.status(400).send('name parameter must be unique.');
      }
      var field = new Field(req.body);
      field.save(function(e, f) {
        if (e) { return res.status(500).json(e); }
        return res.status(200).json(f);
      });
    })
  });

  configRouter.put('/field/:name', function(req, res, next) {
    Field.findOneAndUpdate({ 'name': req.params.name }, { $set: req.body }, { upsert: true, new: true }, function(err, field) {
      if (err) { return res.status(500).json(err); }
      return res.status(200).json(field);
    });
  });

  configRouter.get('/field/', function(req, res, next) {
    Field.find({}, function(err, fields) {
      if (err) { return res.status(500).json(err); }
      return res.status(200).json(fields);
    });
  });

  configRouter.get('/field/:name', function(req, res, next) {
    Field.find({ 'name': req.params.name }, function(err, field) {
      if (err) { return res.status(404).json(err); }
      return res.status(200).json(field);
    });
  });

  configRouter.delete('/field/:name', function(req, res, next) {
    Field.findOneAndRemove({ 'name': req.params.name }, {}, function(err, field) {
      if (!field) { return res.status(404).send('field does not exist.') }
      if (err) { return res.status(500).json(err); }
      return res.status(204).send('field deleted.');
    });
  });

  return {
    router: configRouter
  };
}
