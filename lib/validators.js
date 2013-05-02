
/**
 * Module dependencies.
 */

var validator = require('tower-validator');

/**
 * Expose `validators`.
 */

module.exports = validators;

/**
 * Define default validators.
 */

function validators(attr) {
  // XXX: maybe this goes into a separate module.
  attr.validator('present', function(self, obj){
    return null != obj.get(self.name);
  });

  ['eq', 'neq', 'in', 'nin', 'contains', 'gte', 'gt', 'lt', 'lte'].forEach(function(key){
    attr.validator(key, function(self, obj, val){
      return validator(key)(obj.get(self.name), val);
    });
  });
}