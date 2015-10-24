module.exports = function(mongoose, Field) {

  var configRouter = require('express').Router();
  var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;

  configRouter.post('/field', function(req, res, next) {
    if (req.body.name === resourceIDName) {
      return res.status(400).send('name cannot be the id name');
    }
    var field = new Field(req.body);
    field.save(function(err, f) {
      if (err) { return res.status(500).json(err); }
      return res.status(200).json(f);
    });
  });

  return {
    router: configRouter
  };
}