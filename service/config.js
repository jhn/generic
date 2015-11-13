var _ = require('lodash');

module.exports = function(mongoose) {

  var configRouter = require('express').Router();
  var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;
  var Field = mongoose.model('Field');
  var Resource = mongoose.model('Resource');

  var toExternal = function(internal) {
    var result = JSON.parse(JSON.stringify(internal));
    delete result._id;
    delete result.__v;
    return result;
  };

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
        if (f.required) {
            var defaultValue = (function() {
                switch(f.type) {
                    case 'String': return '""'; break;
                    case 'Number': return 0; break;
                    case 'Boolean': return false; break;
                    case 'Array': return []; break;
                    case 'Object': return {}; break;
                    case 'Date': return new Date(0); break;
                }
            })();
            mongoose.connection.db.eval('function() { db.resources.find({}).forEach(function(e) { var temp = e.data; temp["' + f.name + '"] = ' + defaultValue + '; e.data = temp; db.resources.save(e); }) }');
        }
        return res.status(200).json(toExternal(f));
      });
    })
  });

  configRouter.put('/field/:name', function(req, res, next) {
    Field.findOneAndUpdate({ 'name': req.params.name }, { $set: req.body }, { upsert: false, new: true }, function(err, field) {
      if (err) { return res.status(500).json(err); }
      if (!field) { return res.status(404).send('field does not exist.'); }
      if (req.params.name !== field.name) {
          mongoose.connection.db.eval('function() { db.resources.find({}).forEach(function(e) { var temp = e.data; temp["' + field.name + '"] = temp["' + req.params.name + '"]; delete temp["' + req.params.name + '"]; e.data = temp; db.resources.save(e); }) }')
      }
      if (field.required) {
          var defaultValue = (function() {
              switch(field.type) {
                  case 'String': return '""'; break;
                  case 'Number': return 0; break;
                  case 'Boolean': return false; break;
                  case 'Array': return []; break;
                  case 'Object': return {}; break;
                  case 'Date': return new Date(0); break;
              }
          })();
          mongoose.connection.db.eval('function() { db.resources.find({}).forEach(function(e) { var temp = e.data; if (!temp.hasOwnProperty("' + field.name + '")) { temp["' + field.name + '"] = ' + defaultValue + '; e.data = temp; db.resources.save(e); } }) }');
      }
      return res.status(200).json(toExternal(field));
    });
  });

  configRouter.get('/field/', function(req, res, next) {
    Field.find({}, function(err, fields) {
      if (err) { return res.status(500).json(err); }
      var result = fields.map(toExternal);
      return res.status(200).json(result);
    });
  });

  configRouter.get('/field/:name', function(req, res, next) {
    Field.findOne({ 'name': req.params.name }, function(err, field) {
      if (!field) { return res.status(404).send('field does not exist.') }
      if (err) { return res.status(500).json(err); }
      return res.status(200).json(toExternal(field));
    });
  });

  configRouter.delete('/field/:name', function(req, res, next) {
    Field.findOneAndRemove({ 'name': req.params.name }, {}, function(err, field) {
      if (!field) { return res.status(404).send('field does not exist.') }
      if (err) { return res.status(500).json(err); }
      mongoose.connection.db.eval('function() { db.resources.find({}).forEach(function(e) { var temp = e.data; delete temp["' + req.params.name + '"]; e.data = temp; db.resources.save(e); }) }');
      return res.status(204).send('field deleted.');
    });
  });

  return {
    router: configRouter
  };
}
