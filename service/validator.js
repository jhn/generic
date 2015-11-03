var funcName = function(fun) {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  ret = ret.toLowerCase();
  return ret;
}

module.exports = function(Field, callback) {
  Field.find({}, function(err, fields) {
    callback({
      validate: function(input) {
        console.log("INPUT:")
        console.log(input);
        for (var i = 0; i < fields.length; i++) {
          var fieldName = fields[i].name;
          var fieldType = funcName(fields[i].type);
          var required = fields[i].required;
          var regexString = fields[i].validation;
          // Check that a required field is present
          if (required && !input.hasOwnProperty(fieldName)) {
            console.log('Rejected for missing required field.');
            return false;
          }
          // Check that type matches
          if (input.hasOwnProperty(fieldName) && fieldType !== typeof input[fieldName]) {
            console.log('Rejected for invalid type match.');
            return false;
          }
          // Validate regex
          if (input.hasOwnProperty(fieldName) && regexString && !input[fieldName].match(new RegExp(regexString))) {
            console.log('Rejected for regex mismatch.');
            return false;
          }
        }
        // Check that no additional fields are present in the input
        for (var key in input) {
          if (input.hasOwnProperty(key)) {
            var passed = false;
            for (var i = 0; i < fields.length; i++) {
              if (fields[i].name === key) {
                passed = true;
              }
            }
            if (!passed) {
              console.log('Rejected for additional field.');
              return false;
            }
          }
        }
        // Everything is good
        return true;
      }
    });
  });
};
