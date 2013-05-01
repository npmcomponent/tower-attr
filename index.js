
/**
 * Module dependencies.
 */

var operator = require('tower-operator');

/**
 * Expose `Attr`.
 */

exports = module.exports = Attr;

/**
 * Expose `validator`.
 */

exports.validator = validator;

/**
 * Instantiate a new `Attr`.
 */

function Attr(name, type, options){
  if (!type) {
    options = { type: 'string' };
  } else if ('object' === typeof type) {
    options = type;
  } else {
    options || (options = {});
    options.type = type;
  }

  this.name = name;
  this.type = options.type || 'string';

  if (options.validators) this.validators = [];
  if (options.alias) this.aliases = [ options.alias ];
  else if (options.aliases) this.aliases = options.aliases;

  // XXX: maybe it should allow any custom thing to be set?
}

/**
 * Add validator to stack.
 */

Attr.prototype.validator = function(key, val){
  var assert = validator(key);

  // lazily instantiate validators
  (this.validators || (this.validators = []))
    .push(function validate(attr, obj, fn){
      if (!assert(attr, obj, val)) {
        // XXX: hook into `tower-inflector` for I18n
        var error = 'Invalid attribute: ' + attr.name;
        obj.errors[attr.name] = error;
        obj.errors.push(error);
      }
    });
}

Attr.prototype.alias = function(key){
  (this.aliases || (this.aliases = [])).push(key);
}

Attr.prototype.validate = function(obj, fn){
  if (!this.validators) return fn();

  var self = this;

  // XXX: part-async-series
  this.validators.forEach(function(validate){
    validate(self, obj);
  });

  if (fn) fn(); // XXX
}

/**
 * Define a reusable attribute validator.
 *
 * @param {String} name
 * @param {Function} fn
 */

function validator(name, fn) {
  if (1 === arguments.length)
    return validator.collection[name];

  validator.collection[name] = fn;
  validator.collection.push(fn);
}

validator.collection = [];

// XXX: maybe this goes into a separate module.
validator('present', function(attr, obj){
  return null != obj.get(attr.name);
});

['eq', 'neq', 'in', 'nin', 'contains', 'gte', 'gt', 'lt', 'lte'].forEach(function(key){
  validator(key, function(attr, obj, val){
    return operator(key)(obj.get(attr.name), val);
  });
});