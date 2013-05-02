
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , validator = require('tower-validator').ns('attr')
  , text = require('tower-inflector');

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
  } else if ('object' === typeof type) {
    options = type;
  } else {
    options || (options = {});
    options.type = type;
  }

  this.name = name;
  this.type = options.type || 'string';
  // XXX: I18n path, maybe should be
  // model.user.attr.
  this.path = options.path || 'attr.' + name;

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

// XXX: maybe this goes into a separate module.
exports.validator('present', function(attr, obj){
  return null != obj.get(attr.name);
});

['eq', 'neq', 'in', 'nin', 'contains', 'gte', 'gt', 'lt', 'lte'].forEach(function(key){
  exports.validator(key, function(attr, obj, val){
    return operator(key)(obj.get(attr.name), val);
  });
});