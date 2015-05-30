AMQParty
========
All I wanted was to build a great microservices using RabbitMQ.
but I can't understand all these terms... and all this boilerplate.. waaaa...

So lets party.

Installing
----------

```bash
npm install --save amqparty
```

Using
-----

```js
const amqparty = require('amqparty');

// Just connect with the amqp library settings
amqparty.connect({ ...amqpProperties }).then(() => {
  console.log("Connected..");
  const send = amqparty.sender({ exchange: 'joe', name: 'userInfo' });

  send({
    some: 'data',
    iWould: 'like to send'
  }).then(data => {
    console.log('got myself: ', data);
  }).catch(err => {
    console.error('oh noes: ', err);
  });
});
```

Handling data in a service
--------------------------

```js
const amqparty = require('amqparty');

const listen = () => {
  console.log("Started...");
  amqparty.handle({
    exchange: 'joe',
    name: 'userInfo'
  }, (data, resolve, reject) => {
    // Do your thing here...
    resolve({
      heyYou: 'ohai'
    });
  });
};

amqparty.connect({ ...amqProperties }).then(listen);
```

How it works
------------

### sender
- creates a queue('joe', 'userInfo')
- returns a function that:
  - generates a uuid
  - add a subscriber to the subscribers object:
    - will call the callback
    - unbind the queue
    - remove the subscriber from the subscribers object
  - binds the queue to `userInfo.response.${uuid}`
  - sends data

### handle({ exchange: 'joe', name: 'userInfo' }, callback...)
creates a queue (`userInfo`) that binds to `userInfo.request`
