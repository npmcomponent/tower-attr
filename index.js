
/**
 * Module dependencies.
 */

var validator = require('tower-validator').ns('attr');
// commented out by npm-component: var types = require('tower-type');
var kindof = 'undefined' === typeof window ? require('type-component') : require('component-type');
// commented out by npm-component: var each = require('part-async-series');
// commented out by npm-component: var isBlank = require('part-is-blank');
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
    } else if ('array' === kind) {
      options = { type: 'array', value: type };
    } else {
      if ('object' !== kindof(options)) {
        options = { value: options };
      } else {
        options || (options = {});
      }

      // if `type` isn't in the list,
      // it's a default value.
      if (undefined !== options.value || types.defined(type))
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
  this.valueType = kindof(this.value);

  switch (this.valueType) {
    case 'function':
      this.apply = functionType;
      break;
    case 'array':
      this.apply = arrayType;
      break;
    case 'date':
      this.apply = dateType;
      break;
  }
}

/**
 * Add validator to stack.
 */

Attr.prototype.validator = function(key, val){
  var self = this;
  var assert = validator(key);
  this.validators || (this.validators = []);
  var validate;

  if (4 === assert.length) {
    validate = function(obj, errors, fn){
      assert(self, obj, val, function(err){
        if (err) errors[key] = false;
      });
    };
  } else {
    validate = function(obj, errors, fn){
      if (!assert(self, obj, val))
        errors[key] = false;
      fn();
    }
  }

  this.validators.push(validate);
};

Attr.prototype.alias = function(key){
  (this.aliases || (this.aliases = [])).push(key);
};

Attr.prototype.validate = function(data, errors, fn){
  if (!this.validators) return fn();

  var validators = this.validators;
  var i = 0;
  var validator;
  
  function next() {
    validator = validators[i++];
    if (validator) {
      validator(data, errors, next); 
    } else {
      if (isBlank(errors))
        fn();
      else
        fn(errors);
    }
  }

  next();

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

function functionType(obj, val) {
  return this.value(obj, val);
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