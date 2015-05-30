AMQParty
========

Instead of using `exchnage` and `queues` and stuff..

```js
const amqparty = require('amqparty'); // default instance of amqparty.Amqparty;
amqparty.connect({ ...amqpProperties }).then(() => {
  console.log("Connected..");
  const send = amqparty.sender({ exchange: 'joe', name: 'userInfo' });

  send({
    some: 'data',
    iWould: 'like to send'
  }).then(data => {
    console.log('data: ', data);
  }).catch(err => {
    console.error('error: ', err);
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
    // Do your thing
    resolve({
      myResponse: 'yay'
    });
  });
};

amqparty.connect({ ...amqProperties }).then(listen);
```

How should it work?
-------------------

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
