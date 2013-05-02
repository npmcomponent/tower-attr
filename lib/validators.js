
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
  attr.validator('present', function(attr, obj){
    return null != obj.get(attr.name);
  });

  ['eq', 'neq', 'in', 'nin', 'contains', 'gte', 'gt', 'lt', 'lte'].forEach(function(key){
    attr.validator(key, function(attr, obj, val){
      return validator(key)(obj.get(attr.name), val);
    });
  });
}