var env = function(name) {
  return process.env["RABBITMQ_" + name.toUpperCase()];
};

module.exports = {
  host: env('host'),
  port: env('port'),
  user: env('user'),
  password: env('password'),
  vhost: env('vhost')
};
