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
frank.createServer = frank;
module.exports = frank;

'get post put head'.split(' ').forEach(function(method) {
  frank.fn[method] = function(path, fn) {
    this.server = this.server || connect();
    this.handler = handler = this.handler || {};

    this.path = path;
    this.route = route = [method.toUpperCase(), path].join(' ');

    handler[route] = {};
    handler[route].method = method.toUpperCase();
    handler[route].middleware = [];
    handler[route].path = path;

    if (fn) this.then(fn);

    if (!this.scope) this.__proto__ = frank.fn.__proto__;
    return this;
  };
});

frank.fn.then = function(callback) {
  this.handler[this.route].callback = callback;
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

  Object.keys(this.handler).forEach(function(key) {
    var handler = this.handler[key],
        path = handler.path,
        method = handler.method,
        middleware = handler.middleware,
        body = handler.body,
        contentType = handler.contentType,
        callback = handler.callback;

    if (middleware.length) {
      middleware.forEach(function(plugin, i) {
        server.use(path, plugin);
      });
    }

    if (callback) {
      server.use(path, callback);
    }
    else {
      server.use(path, function(req, res) {
        if (req.method == method) {
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', body.length);
          res.end(body);
        }
      });
    }
  });

  return server;
};
