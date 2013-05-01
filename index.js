
/**
 * Module dependencies.
 */

var operator = require('tower-operator');

/**
 * Expose `attr`.
 */

exports = module.exports = attr;

/**
 * Mixin `attr`.
 *
 * Example:
 *
 *    model.use(require('tower-attr'));
 *
 * @param {Object} statics Constructor object to mixin methods.
 * @api public
 */

function attr(statics) {
  statics.attr = exports.attr;
  statics.validate = exports.validate;
}

/**
 * Define attr with the given `name` and `options`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Function} self
 * @api public
 */

exports.attr = function(name, options){
  options || (options = {});
  options.type || (options.type = 'string');
  options.name = name;

  // set?
  this.attrs.push(options);
  this.attrs[options.name] = options;

  // implied pk
  if ('_id' === name || 'id' === name) {
    options.primaryKey = true;
    this.primaryKey = name;
  }

  // getter / setter method
  this.prototype[name] = function(val){
    if (0 === arguments.length) {
      if (undefined === this.attrs[name] && options.defaultValue)
        return this.attrs[name] = options.defaultValue();
      else
        return this.attrs[name];
    }

    var prev = this.attrs[name];
    this.dirty[name] = val;
    this.attrs[name] = val;
    this.constructor.emit('change ' + name, this, val, prev);
    this.emit('change ' + name, val, prev);
    return this;
  };

  return this;
};

/**
 * Add validation `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.validate = function(fn){
  this.validators.push(fn);
  return this;
};