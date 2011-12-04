module.exports = {
  json : function(obj) {
    this.handler[this.route]['body'] = JSON.stringify(obj);
    return this;
  },
  send : function(str) {
    this.handler[this.route]['body'] = str;
    return this;
  }
};
