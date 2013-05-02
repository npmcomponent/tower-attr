var attr = 'undefined' === typeof window
  ? require('..')
  : require('tower-attr'); // how to do this better?

var Attr = attr.Attr
  , validator = attr.validator
  , text = require('tower-inflector')
  , assert = require('assert');

describe('Attr', function(){
  it('should define', function(){
    var attr = new Attr('title', 'string');
    
    assert('title' === attr.name);
    assert('string' === attr.type);
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

  describe('validators', function(){
    before(function(){
      text('attr', 'Invalid attribute: {{name}}');
    });

    it('should validate present', function(){
      var attr = new Attr('title')
      attr.validator('present');

      var record = { get: function() { return this.title }, errors: [] };
      record.title = 'hello';
      attr.validate(record);
      assert(0 === record.errors.length);

      record.title = null;
      attr.validate(record);
      assert(1 === record.errors.length);
      assert('Invalid attribute: title' === record.errors['title']);
    });
  });
});