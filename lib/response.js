module.exports = {
  json : function(obj) {
    this.handler[this.route]['body'] = obj;
    return this;
  },
  send : function(str) {
    this.handler[this.route]['body'] = str;
    return this;
  }
};
