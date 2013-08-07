
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

  var define = function define(key) {
    attr.validator(key, function(self, obj, val){
      return validator(key)(obj.get(self.name), val);
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
}