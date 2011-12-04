var connect = require('connect'),
    request = require('./request'),
    response = require('./response'),
    merge = connect.utils.merge;

function frank() {
  if (!(this instanceof frank)) return new frank(); 
  this.scope = true;
}

frank.fn = frank.prototype;
frank.fn.__proto__ = merge(request, response);
module.exports = frank;

'get post put head'.split(' ').forEach(function(method) {
  frank.fn[method] = function(path) {
    this.server = connect();
    this.handler = {};

    this.path = path;
    this.route = [method.toUpperCase(), path].join(' ');

    this.handler[this.route] = {};
    this.handler[this.route]['method'] = method.toUpperCase();
    this.handler[this.route]['path'] = path;

    if (!this.scope) this.__proto__ = frank.fn.__proto__;
    return this;
  };
});

frank.fn.then = function(callback) {
  this.handler[this.route]['callback'] = callback;
  return this;
}

frank.fn.listen = function(port, msg) {
  this.port = port;
  msg = msg || "Frank is smoking at " + port;
  frank.server.call(this).listen(port);
  console.log(msg);
};
frank.fn.run = frank.fn.listen;

frank.server = function() {
  var self = this, server = this.server;
  server.use(connect.favicon());

  for (var key in this.handler) {
    var path = this.handler[key].path,
        auth = this.handler[key].auth,
        callback = this.handler[key].callback;

    if (auth) {
      server.use(path, connect.basicAuth(function(user, pwd) {
        return auth[0] === user && auth[1] === pwd;
      }));
    }

    if (callback) {
      server.use(path, callback);
    }
    else {
      server.use(path, function(req, res) {
        if (req.method == self.handler[key].method) {
          res.end(self.handler[key].body);
        }
      });
    }
  }
  return server;
};
