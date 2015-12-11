var _ = require('lodash');

module.exports = function(ddb) {

  var configRouter = require('express').Router();
  var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;

  function toExternal(obj) {
    if (obj.hasOwnProperty('required')) {
      obj.required = obj.required === "true" ? true : false;
    }
    return obj;
  }

  configRouter.post('/field', function(req, res, next) {
    if (req.body.name === resourceIDName) {
      return res.status(400).send('name cannot be the id name');
    }
    if (!req.body.hasOwnProperty('type') || typeof req.body.type !== 'string') {
      return res.status(400).send('config field must have a valid type member.');
    }

    ddb.getItem('field', req.body.name, null, {}, function(err, r) {
      if (err) return res.status(500).json(err);
      if (r) return res.status(400).send('name parameter must be unique.');

      var field = { name: req.body.name, type: req.body.type };
      if (req.body.hasOwnProperty('required')) {
        field.required = req.body.required ? "true" : "false";
      }
      if (req.body.hasOwnProperty('validation')) {
        field.validation = req.body.validation;
      }

      ddb.putItem('field', field, {}, function(err, r) {
        if (err) { return res.status(500).json(err); }
        return res.status(200).json(toExternal(field));
      });
    });
  });

  configRouter.put('/field/:name', function(req, res, next) {
    ddb.getItem('field', req.params.name, null, {}, function(err, r) {
      if (err) return res.status(500).json(err);
      if (!r) { return res.status(404).send('field does not exist.'); }

      for (var key in req.body) {
        if (req.body.hasOwnProperty(key)) {
          if (key === 'required') {
            r[key] = req.body[key] ? "true" : "false";
          }
          if (['type', 'validation', 'name'].indexOf(key) > -1) {
            r[key] = req.body[key];
          }
        }
      }

      ddb.deleteItem('field', req.params.name, null, {}, function(err, dr) {
        if (err) return res.status(500).json(err);
        ddb.putItem('field', r, {}, function(err, pr) {
          if (err) return res.status(500).json(err);
          return res.status(200).json(toExternal(r));
        });
      });
    });
  });

  configRouter.get('/field/', function(req, res, next) {
    ddb.scan('field', {}, function(err, r) {
      if (err) { return res.status(500).json(err); }
      if (r.items) {
        return res.status(200).json(r.items.map(toExternal));
      } else {
        return res.status(200).json(r);
      }
    });
  });

  configRouter.get('/field/:name', function(req, res, next) {
    ddb.getItem('field', req.params.name, null, {}, function(err, field) {
      if (!field) { return res.status(404).send('field does not exist.') }
      if (err) { return res.status(500).json(err); }
      return res.status(200).json(toExternal(field));
    });
  });

  configRouter.delete('/field/:name', function(req, res, next) {
    ddb.getItem('field', req.params.name, null, {}, function(err, field) {
      if (!field) { return res.status(404).send('field does not exist.') }
      if (err) { return res.status(500).json(err); }
      ddb.deleteItem('field', req.params.name, null, {}, function(err, field) {
        if (err) { return res.status(500).json(err); }
        ddb.scan('resource', {}, function(err, resources) {
          for (var i = 0; i < resources.items.length; i++) {
            if (resources.items[i].hasOwnProperty(req.params.name)) {
              delete resources.items[i][req.params.name]
              ddb.putItem('resource', resources.items[i], {}, function(err, r) {
                if (err) { return res.status(500).json(err); }
              });
            }
          }
        });
        return res.status(200).send('field deleted.');
      });
    });
  });

  return {
    router: configRouter
  };
}
