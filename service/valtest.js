var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/service-test');

var Schema = mongoose.Schema;

var FieldSchema = new Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  required: Boolean,
  validation: String
});

FieldSchema.add({ subfields: [FieldSchema] });

var Field = mongoose.model('Field', FieldSchema);

var field = new Field({
  name: "first",
  type: "String",
  required: true,
  validation: "^[a-zA-Z]{3,}$"
});

field.save(function(err, f) {
  if (err) { console.log(err); }
  require('./validator')(Field, function(validator) {
    if (validator.validate({ data: { first: "sam" } })) {
      console.log('validator accepts sam');
    } else {
      console.log('validator rejects sam')
    }
    if (validator.validate({ data: { first: "sa" } })) {
      console.log('validator accepts sa');
    } else {
      console.log('validator rejects sa')
    }
    if (validator.validate({ data: { first: "sam", last: "sam" } })) {
      console.log('validator accepts additional field name');
    } else {
      console.log('validator rejects additional field name')
    }
    if (validator.validate({ data: { fist: "sam" } })) {
      console.log('validator accepts with missing field');
    } else {
      console.log('validator rejects with missing field')
    }
    if (validator.validate({ data: { first: "sam8989" } })) {
      console.log('validator accepts sam8989');
    } else {
      console.log('validator rejects sam8989')
    }
    if (validator.validate({ data: { first: 8999 } })) {
      console.log('validator accepts 8999');
    } else {
      console.log('validator rejects 8999')
    }
  });
})
