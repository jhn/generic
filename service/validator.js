function typeConverter(typeString) {
  switch (typeString) {
    case "Number":
    case "number":
      return "number";
      break;
    case "Date":
    case "date":
      return "date";
      break;
    case "Array":
    case "array":
      return "array";
      break;
    case "Boolean":
    case "boolean":
      return "boolean";
      break;
    case "Object":
    case "object":
      return "object";
      break;
    default:
      return "string";
  };
}

module.exports = function(Field, callback) {
  Field.find({}, function(err, fields) {
    callback({
      validate: function(input) {
        console.log("INPUT:")
        console.log(input);
        if (!input.hasOwnProperty("data")) {
          console.log('Rejected for missing data object.')
          return false;
        }
        var data = input.data;
        for (var i = 0; i < fields.length; i++) {
          var fieldName = fields[i].name;
          var fieldType = typeConverter(fields[i].type);
          var required = fields[i].required;
          var regexString = fields[i].validation;
          // Check that a required field is present
          if (required && !data.hasOwnProperty(fieldName)) {
            console.log('Rejected for missing required field.');
            return false;
          }
          // Check that type matches
          var matchType = typeof data[fieldName];
          if (data.hasOwnProperty(fieldName) && fieldType !== matchType) {
            console.log('Rejected for invalid type match.');
            return false;
          }
          // Validate regex
          if (data.hasOwnProperty(fieldName) && regexString && !data[fieldName].match(new RegExp(regexString))) {
            console.log('Rejected for regex mismatch.');
            return false;
          }
        }
        // Check that no additional fields are present in the input data
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
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
        console.log('Resource validated.')
        return true;
      }
    });
  });
};
