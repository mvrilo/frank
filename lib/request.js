var connect = require('connect');

module.exports = {
  setHeader : function(field, value) {
    var route = this.handler[this.route];
    route.header = {};
    route.header[field] = value;
    return this;
  },
  basicAuth : function(user, pwd) {
    this.handler[this.route].middleware.push(
      connect.basicAuth(function(u, p) {
        return u === user && p === pwd;
      })
    );
    return this;
  }
};
