var amqp = require('amqp');
var BluebirdPromise = require('bluebird');
var debug = require('debug')('amqparty');

var Amqparty = function() {
};

Amqparty.prototype.connect = function() {
  var args = Array.prototype.slice.apply(arguments);
  var self = this;
  return new BluebirdPromise(function(resolve) {
    debug('connecting with settings:', args);
    self.connection = amqp.createConnection.apply(amqp, args);
    self.connection.on('ready', resolve);
  });
};

var defaultAmqparty = new Amqparty();
defaultAmqparty.Amqparty = Amqparty;
module.exports = defaultAmqparty;
