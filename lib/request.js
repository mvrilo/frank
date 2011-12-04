module.exports = {
  setHeader : function(field, value) {
    this.handler[this.route]['header'] = {};
    this.handler[this.route]['header'][field] = value;
    return this;
  },
  basicAuth : function(user, pwd) {
    this.handler[this.route]['auth'] = [user, pwd];
    return this;
  }
};
