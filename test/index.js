
if ('undefined' === typeof window) {
  var attr = require('..');
  var assert = require('assert');
} else {
  var attr = require('tower-attr');
  var assert = require('timoxley-assert');
}

var Attr = attr.Attr;
var validator = attr.validator;

describe('Attr', function(){
  it('should define', function(){
    var attr = new Attr('title', 'string', {}, 'some.nested.path.title');
    
    assert('title' === attr.name);
    assert('string' === attr.type);
    assert('some.nested.path.title' === attr.path);
  });

  it('should lazily instantiate validators', function(){
    var attr = new Attr('title', 'string');
    assert(undefined === attr.validators);

    attr.validator('lte', 200);
    assert(1 === attr.validators.length);
  });

  it('should lazily instantiate aliases', function(){
    var attr = new Attr('title', 'string');    
    assert(undefined === attr.aliases);

    attr.alias('t');
    assert(1 === attr.aliases.length);
    assert('t' === attr.aliases[0]);
  });

  it('should default to `string` type', function(){
    var attr = new Attr('title');

    assert('string' === attr.type);
  });

  describe('default value', function(){
    it('should allow default values', function(){
      function compare(val, attr) {
        assert(val === attr.value);
      }

      compare(false, new Attr('completed', 'boolean', false));
      compare(true, new Attr('completed', 'boolean', true));
      compare(undefined, new Attr('completed', 'boolean'));
    });

    it('should concat array if default', function(){
      var array = [1, 2, 3];
      var attr = new Attr('tags', 'array', array);
      var val = attr.apply();
      assert('1,2,3' === val.join(','));
      assert(array !== val); // that it's a new one.
      assert(array === attr.value); // that the passed on is the same
    });

    it('should apply type "function" to object', function(){
      var attr = new Attr('tags', function(obj){
        return obj.x;
      });
      assert('foo' === attr.apply({ x: 'foo' }));
    });
  });

  it('should handle param overloading', function(){
    function one(attr) {
      assert('title' === attr.name);
      assert('string' === attr.type);
      assert(undefined === attr.validators);
    }

    one(new Attr('title'));
    one(new Attr('title', 'string'));
    one(new Attr('title', { type: 'string' }));

    function two(attr) {
      assert('title' === attr.name);
      assert('string' === attr.type);
      assert(0 === attr.validators.length);
    }

    two(new Attr('title', 'string', { validators: [] }));
    two(new Attr('title', { type: 'string', validators: [] }));
    two(new Attr('title', { validators: [] }));
    // XXX: doesn't handle this, waiting to see if it should.
    // two(new Attr({ name: 'title', validators: [] }));
  });

  it('should typecast', function(){
    var attr = new Attr('tags', 'array');
    assert.deepEqual([ 'x' ], attr.typecast('x'));
    assert.deepEqual([ 'x', 'y' ], attr.typecast([ 'x', 'y' ]));
    assert.deepEqual([ 'x', 'y' ], attr.typecast('x,y'));
  });

  it('should allow arbitrary metadata', function(){
    var attr = new Attr('pages', { inMenu: true });
    assert.equal(true, attr.inMenu);
  });

  describe('validators', function(){
    it('should validate present', function(){
      var attr = new Attr('title')
      attr.validator('present');

      var record = { title: 'hello' };
      var errors = attr.validate(record);
      assert.deepEqual(errors, {});

      record.title = null;
      errors = attr.validate(record);
      assert.deepEqual(errors, { present: false });
    });

    it('should validate min/max', function(){
      var attr = new Attr('title')
      attr.validator('min', 3);
      attr.validator('max', 10);

      var record = { title: 'no' };
      var errors = attr.validate(record);
      assert.deepEqual(errors, { min: false });

      record.title = 'above the max';
      errors = attr.validate(record);
      assert.deepEqual(errors, { max: false });
    });
  });
});