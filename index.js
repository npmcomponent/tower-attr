
/**
 * Module dependencies.
 */

var validator = require('tower-validator').ns('attr');
var types = require('tower-type');
var kindof = 'undefined' === typeof window ? require('type-component') : require('type');
var validators = require('./lib/validators');

/**
 * Expose `attr`.
 */

exports = module.exports = attr;

/**
 * Expose `Attr`.
 */

exports.Attr = Attr;

/**
 * Expose `validator`.
 */

exports.validator = validator;

/**
 * Get an `Attr` instance.
 */

function attr(name, type, options, path) {
  return new Attr(name, type, options, path);
}

/**
 * Instantiate a new `Attr`.
 */

function Attr(name, type, options, path){
  if (undefined === type) {
    // .attr('title')
    options = { type: 'string' };
  } else {
    var kind = kindof(type);

    if ('object' === kind) {
      // .attr('title', { value: 'Hello World', type: 'string' })
      options = type;
    } else if ('function' === kind) {
      // .attr('title', function(){})
      options = { value: type };
      // XXX: array too
    } else {
      if ('object' !== kindof(options)) {
        options = { value: options };
      } else {
        options || (options = {});
      }

      // if `type` isn't in the list,
      // it's a default value.
      if (types.defined(type))
        options.type = type;
      else
        options.value = type;
    }
  }

  this.name = name;
  this.path = path || 'attr.' + name;

  for (var key in options) this[key] = options[key];
  if (!this.type) this.type = 'string';
  
  // override `.apply` for complex types
  switch (kindof(this.value)) {
    case 'function':
      this.apply = functionType;
      break;
    case 'array':
      this.apply = arrayType;
      break;
    case 'date':
      this.apply = dateType;
      break;
    default:
      return this.value;
      break;
  }
}

/**
 * Add validator to stack.
 */

Attr.prototype.validator = function(key, val){
  var assert = validator(key);

  (this.validators || (this.validators = []))
    .push(function validate(attr, obj, errors){
      if (!assert(attr, obj, val)) {
        errors[key] = false;
        return false;
      }
      return true;
    });
};

Attr.prototype.alias = function(key){
  (this.aliases || (this.aliases = [])).push(key);
};

Attr.prototype.validate = function(obj, fn){
  if (!this.validators) return fn();

  var self = this;
  // XXX: maybe there's a way to lazily create this so
  // it doesn't happen for every single attribute.
  var errors = {};

  // XXX: part-async-series
  for (var i = 0, n = this.validators.length; i < n; i++) {
    this.validators[i](self, obj, errors);
  }

  if (fn) {
    if (isBlank(errors))
      fn();
    else
      fn(errors);
  }

  return errors;
};

/**
 * Convert a value into a proper form.
 *
 * Typecasting.
 *
 * @param {Mixed} val
 * @param {Mixed} obj The object instance this attr value is relative to.
 */

Attr.prototype.typecast = function(val, obj){
  return types(this.type).sanitize(val, obj);
};

/**
 * Get default value.
 *
 * @param {Mixed} obj the object/record/instance to use
 *    in computing the default value (if it's a function).
 */

Attr.prototype.apply = function(obj){
  return this.value;
};

/**
 * Types for applying default values.
 */

function functionType(obj) {
  return this.value(obj);
}

function arrayType(obj) {
  return this.value.concat();
}

function dateType(obj) {
  return new Date(this.value.getTime());
}

/**
 * Define basic validators.
 */

validators(exports);