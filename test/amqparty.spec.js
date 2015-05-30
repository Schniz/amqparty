var expect = require('chai').expect;

var amqparty = require('..');
var rabbitConfig = require('./rabbit-config');

describe('Full trip', function() {
  before(function(done) {
    amqparty.connect(rabbitConfig).then(function() {
      done();
    }).catch(done);
  });

  it('should send data and receive the handling', function(done) {
    var send = amqparty.sender({
      exchange: 'joe',
      name: 'userInfo'
    });

    send({ email: 'gal@spitfire.co.il' }).then(function(data) {
      expect(data.name).to.equal('Gal Schlezinger');
      done();
    }).catch(done);
  });
});
