module.exports = function(ddb, callback) {
  ddb.scan('field', {}, function(err, fields) {
    callback({
      validate: function(input) {
        if (!input[process.env.GENERIC_RESOURCE_ID_NAME]) {
          console.log('ID field not present.');
          return false;
        }
        console.log("INPUT:")
        console.log(input);
        for (var i = 0; i < fields.items.length; i++) {
          var fieldName = fields.items[i].name;
          var fieldType = fields.items[i].type.toLowerCase()
          var required = fields.items[i].required === 'true' ? true : false;
          var regexString = fields.items[i].validation;
          // Check that a required field is present
          if (required && !input.hasOwnProperty(fieldName)) {
            console.log('Rejected for missing required field.');
            return false;
          }
          // Check that type matches
          var matchType = Array.isArray(input[fieldName]) ? 'array' : typeof input[fieldName];
          if (input.hasOwnProperty(fieldName) && fieldType !== matchType) {
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
            for (var i = 0; i < fields.items.length; i++) {
              if (fields.items[i].name === key) {
                passed = true;
              }
            }
            if (!passed && key !== process.env.GENERIC_RESOURCE_ID_NAME) {
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
