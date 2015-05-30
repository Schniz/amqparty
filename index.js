var amqp = require('amqp');
var BluebirdPromise = require('bluebird');
var debug = require('debug')('amqparty');
var Sender = require('./sender');

var Amqparty = function() {
};

Amqparty.prototype.handle = function(options, callback) {
  var connection = this.connection;
  var actionName = options.name;
  var queue = connection.queue(actionName + '.request', { durable: true, autoDelete: false });
  var exchange = connection.exchange(options.exchange, { type: 'direct', autoDelete: false, durable: true });
  queue.subscribe(function(message, headers) {
    var responseKey = actionName + '.response.' + headers.messageUuid;
    var resolve = function(data) {
      exchange.publish(responseKey, data, {
        headers: {
          messageUuid: headers.messageUuid
        }
      });
    };
    var reject = function(data) {
      exchange.publish(responseKey, data, {
        headers: {
          messageUuid: headers.messageUuid,
          isError: true
        }
      });
    };
    callback(message, resolve, reject);
  });
  queue.bind(exchange.name, actionName + '.request');
};

/**
 * connects the amqparty with your amqp server.
 * gets its parameters like in https://github.com/postwait/node-amqp#connection-options-and-url
 * @return {Promise} On connect the 'then' will be called.
 */
Amqparty.prototype.connect = function() {
  var args = Array.prototype.slice.apply(arguments);
  var self = this;
  return new BluebirdPromise(function(resolve) {
    debug('connecting with settings:', args);
    self.connection = amqp.createConnection.apply(amqp, args);
    self.connection.on('ready', resolve);
  });
};


/**
 * creates a send method
 * @param  {Object} options an object in the form of
 *                  {
 *                  	exchange: 'exchange-name',
 *                  	name      'name-of-action',
 *                  }
 * @return {Promise} A promise of the response or an error.
 */
Amqparty.prototype.sender = function(options) {
  var sender = new Sender({
    exchange: options.exchange,
    name: options.name,
    connection: this.connection
  });
  return sender.send;
};

var defaultAmqparty = new Amqparty();
defaultAmqparty.Amqparty = Amqparty;
module.exports = defaultAmqparty;
