
/**
 * Module dependencies.
 */

var operator = require('tower-operator');

/**
 * Expose `Attr`.
 */

module.exports = Attr;

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
  var assert = operator(key);

  // lazily instantiate validators
  (this.validators || (this.validators = []))
    .push(function validate(obj, fn){
      if (!assert(obj[key], val))
        obj.errors.push('XXX: Invalid attribute');
    });
}

Attr.prototype.alias = function(key){
  (this.aliases || (this.aliases = [])).push(key);
}