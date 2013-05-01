var towerAttr = 'undefined' == typeof window
  ? require('..')
  : require('tower-attr'); // how to do this better?

var assert = require('assert');

describe('towerAttr', function(){
  it('should test', function(){
    assert.equal(1 + 1, 2);
  });
});
