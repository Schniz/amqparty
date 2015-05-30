var expect = require('chai').expect;

var amqparty = require('..');
var rabbitConfig = require('./rabbit-config');

describe('Full trip', function() {
  before(function(done) {
    amqparty.connect(rabbitConfig).then(function() {
      amqparty.handle({
        exchange: 'joe',
        name: 'userInfo'
      }, function(data, resolve, reject) {
        if (data.email === 'gal@spitfire.co.il') {
          return resolve({ name: 'Gal Schlezinger' });
        }
        return reject({ message: 'User not found' });
      });
      done();
    }).catch(done);
  });

  describe('sending good/malformed data', function() {
    var send = null;

    before(function() {
      send = amqparty.sender({
        exchange: 'joe',
        name: 'userInfo'
      });
    });

    it('should send data and receive the handling', function(done) {
      send({ email: 'gal@spitfire.co.il' }).then(function(data) {
        expect(data.name).to.equal('Gal Schlezinger');
        done();
      }).catch(done);
    });

    it('should go to catch if there is no user', function(done) {
      send({ email: 'nobody@spitfire.co.il' }).then(function(data) {
        done(new Error('The code should throw an error'));
      }).catch(function() {
        done();
      });
    });
  });
});
