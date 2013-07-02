
/**
 * Module dependencies.
 */

var validator = require('tower-validator').ns('attr');
var text = require('tower-text');
var type = require('tower-type');
var kindof = 'undefined' === typeof window ? require('type-component') : require('type');
var validators = require('./lib/validators');

text('attr', 'Invalid attribute: {{name}}');

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
  if (!type) {
    options = { type: 'string' };
  } else {
    var kind = kindof(type);
    if ('object' === kind) {
      options = type;
    } else if ('function' === kind) {
      options = { value: type };
      // XXX: array too
    } else {
      if ('object' !== kindof(options)) {
        options = { value: options };
      } else {
        options || (options = {}); 
      }
      options.type = type;
    }
  }

  this.name = name;
  this.type = options.type || 'string';
  // I18n path
  this.path = path || options.path || 'attr.' + name;

  if (undefined !== options.value) {
    this.value = options.value;
    this.hasDefaultValue = true;
    this.defaultType = kindof(options.value);
  }

  this.validators = options.validators;

  if (options.alias) this.aliases = [ options.alias ];
  else if (options.aliases) this.aliases = options.aliases;

  // XXX: maybe it should allow any custom thing to be set?
  if (options.options) this.options = options.options;
}

/**
 * Add validator to stack.
 */

Attr.prototype.validator = function(key, val){
  var assert = validator(key);
  // XXX: need some sort of error handling so it's
  // easier to tell `assert` is undefined.

  // lazily instantiate validators
  (this.validators || (this.validators = []))
    .push(function validate(attr, obj, fn){
      if (!assert(attr, obj, val)) {
        // XXX: hook into `tower-inflector` for I18n
        var error = text.has(attr.path)
          ? text(attr.path).render(attr)
          : text('attr').render(attr);

        obj.errors[attr.name] = error;
        obj.errors.push(error);
      }
    });
};

Attr.prototype.alias = function(key){
  (this.aliases || (this.aliases = [])).push(key);
};

Attr.prototype.validate = function(obj, fn){
  if (!this.validators) return fn();

  var self = this;

  // XXX: part-async-series
  this.validators.forEach(function(validate){
    validate(self, obj);
  });

  if (fn) fn(); // XXX
};

/**
 * Convert a value into a proper form.
 *
 * Typecasting.
 *
 * @param {Mixed} val
 */

Attr.prototype.typecast = function(val){
  return type(this.type).sanitize(val);
};

/**
 * Get default value.
 *
 * @param {Mixed} obj the object/record/instance to use
 *    in computing the default value (if it's a function).
 */

Attr.prototype.apply = function(obj){
  if (!this.hasDefaultValue) return;

  // XXX: this should be computed in the constructor.
  switch (this.defaultType) {
    case 'function':
      return this.value(obj);
      break;
    case 'array':
      return this.value.concat();
      break;
    default:
      return this.value;
      break;
  }
};

validators(exports);