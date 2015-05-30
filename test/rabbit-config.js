var env = function(name) {
  return process.env["RABBITMQ_" + name.toUpperCase()];
};

module.exports = {
  host: env('host') || 'localhost',
  port: parseInt(env('port') || 5672),
  login: env('login') || 'guest',
  password: env('password') || 'guest',
  vhost: env('vhost') || '/'
};
