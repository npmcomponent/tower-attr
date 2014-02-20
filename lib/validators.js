
/**
 * Module dependencies.
 */

// commented out by npm-component: var validator = require('tower-validator');

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
    return null != obj[self.name];
  });

  function define(key) {
    attr.validator(key, function(self, obj, val){
      return validator(key)(obj[self.name], val);
    });
  }

  define('eq');
  define('neq');
  define('in');
  define('nin');
  define('contains');
  define('gte');
  define('gt');
  define('lt');
  define('lte');

  validator('string.gte', function(a, b){
    return a.length >= b;
  });

  validator('string.lte', function(a, b){
    return a.length <= b;
  });

  define('string.gte');
  define('string.lte');

  attr.validator('min', attr.validator('string.gte'));
  attr.validator('max', attr.validator('string.lte'));
}