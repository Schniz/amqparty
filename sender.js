var BluebirdPromise = require('bluebird');
var debug = require('debug')('amqparty:sender');
var uuid = require('uuid').v4;

var Sender = function Sender(options) {
  this.connection = options.connection;
  this.exchangeName = options.exchange;
  this.actionName = options.name;
  this.queueName = this.actionName + '.response.' + uuid();
  debug('Created a sender with queue name: `' + this.queueName + '` in exchange `' + this.exchangeName + '`');
  this.createQueueAndExchange();
  this.subscribers = {};
  this.subscribe();
  this.send = this.send.bind(this);
};

Sender.prototype.subscribe = function() {
  var self = this;
  self.queue.subscribe(function(message, headers, deliveryInfo) {
    debug('received a response for ' + headers.messageUuid);
    var action = self.subscribers[deliveryInfo.routingKey];
    if (!action) {
      return;
    } else if (headers.isError) {
      return action(message);
    }
    action(null, message);
  });
};

Sender.prototype.send = function(data) {
  var self = this;
  return new BluebirdPromise(function(resolve, reject) {
    var myUuid = uuid();
    var requestId = self.actionName + '.response.' + myUuid;
    self.subscribers[requestId] = function(err, responseData) {
      debug('started to handle ' + myUuid);
      self.queue.unbind(self.exchangeName, requestId);
      self.subscribers[requestId] = undefined;
      if (err) {
        return reject(err);
      } else {
        return resolve(responseData);
      }
    };
    self.queue.bind(self.exchangeName, requestId);
    self.exchange.publish(self.actionName + '.request', data, {
      headers: {
        messageUuid: myUuid
      }
    });
    debug('send message ' + myUuid);
  });
};

Sender.prototype.createQueueAndExchange = function() {
  this.queue = this.connection.queue(this.queueName, { durable: true, autoDelete: false });
  this.exchange = this.connection.exchange(this.exchangeName, { type: 'direct', autoDelete: false, durable: true });
};

module.exports = Sender;
