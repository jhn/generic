var _ = require('lodash');

// var item1 = { name: 'last_name', cool: 'wowwww', awesome: 'hhhhhhhaaaaaaa' }
// var item2 = { name: 'first_name', cool: 'huh?', awesome: 'pfft..' }
// ddb.putItem('field', item1, {}, function(err, res, cap) {
//   if (err) { console.log(err) }
//   else { console.log('Added item 1 successfully!')}
//   ddb.putItem('field', item2, {}, function(err, res, cap) {
//     if (err) { console.log(err) }
//     else { console.log('Added item 2 successfully!')}
//   });


module.exports = function(ddb) {

  var configRouter = require('express').Router();
  var resourceIDName = process.env.GENERIC_RESOURCE_ID_NAME;

  // var toExternal = function(internal) {
  //   var result = JSON.parse(JSON.stringify(internal));
  //   delete result._id;
  //   delete result.__v;
  //   return result;
  // };

  configRouter.post('/field', function(req, res, next) {
    if (req.body.name === resourceIDName) {
      return res.status(400).send('name cannot be the id name');
    }
    if (!req.body.hasOwnProperty('type') || typeof req.body.type !== 'string') {
      return res.status(400).send('config field must have a valid type member.');
    }

    ddb.scan('field', {}, function(err, r) {
      if (err) return res.status(500).json(err);
      if (r.hasOwnProperty('items')) {
        for (var i = 0; i < r.items.length; i++) {
          if (r.items[i].name == req.body.name) {
            return res.status(400).send('name parameter must be unique.');
          }
        }
      }
      var field = { name: req.body.name, type: req.body.type };
      if (req.body.hasOwnProperty('required')) {
        field.body = req.body.required ? "true" : "false";
      }
      if (req.body.hasOwnProperty('validation')) {
        field.body.validation = req.body.validation;
      }
      console.log(field);

      ddb.putItem('field', field, {}, function(err, r) {
        if (err) { return res.status(500).json(err); }
        if (field.required) {
            // THIS IS FOR UPDATING ALL FIELDS...
            // var defaultValue = (function() {
            //     switch(field.type) {
            //         case 'String': return '"_"'; break;
            //         case 'Number': return 0; break;
            //         case 'Boolean': return false; break;
            //         case 'Array': return []; break;
            //         case 'Object': return {}; break;
            //         case 'Date': return new Date(0); break;
            //     }
            // })();
            // mongoose.connection.db.eval('function() { db.resources.find({}).forEach(function(e) { var temp = e.data; temp["' + f.name + '"] = ' + defaultValue + '; e.data = temp; db.resources.save(e); }) }');
        }
        return res.status(200).json(field);
      });
    });
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
