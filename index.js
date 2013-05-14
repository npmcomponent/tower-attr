
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , validator = require('tower-validator').ns('attr')
  , text = require('tower-inflector')
  , type = require('tower-type')
  , kindof = require('type-component')
  , validators = require('./lib/validators');

text('attr', 'Invalid attribute: {{name}}');

/**
 * Expose `attr`.
 */

exports = module.exports = attr;

/**
 * Expose `Attr`.
 */

exports.Attr = Attr;

// XXX:
// module.exports = attr;
// attr('user.email')
// attr.on('define', function(name, obj));

/**
 * Expose `validator`.
 */

exports.validator = validator;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Get an `Attr`.
 */

function attr(name, type, options) {
  if (exports.collection[name])
    return exports.collection[name];

  var instance = new Attr(name, type, options);
  exports.collection[name] = instance;
  exports.collection.push(instance);
  exports.emit('define', name, instance);
  return instance;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);

/**
 * Instantiate a new `Attr`.
 */

function Attr(name, type, options){
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
  // XXX: I18n path, maybe should be
  // model.user.attr.
  this.path = options.path || 'attr.' + name;
  if (undefined !== options.value) {
    this.value = options.value;
    this.hasDefaultValue = true;
    this.defaultType = kindof(options.value);
  }

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
 * Convert a value into a proper form.
 *
 * Typecasting.
 *
 * @param {Mixed} val
 */

Attr.prototype.typecast = function(val){
  return type(this.type).sanitize(val);
}

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
}

validators(exports);