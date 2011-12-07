var cons = require('consolidate').render;

module.exports = {
  send : function(str, type) {
    type = type || 'text/plain';
    this.handler[this.route].contentType = type;
    this.handler[this.route].body = str;
    return this;
  },
  render : function(ext, path, options) {
    var self = this;
    if (!options) {
      options = path;
      path = ext;
      ext = path.replace(/^.*\.(.*)$/, "$1");
    }
    ext = ext.replace('.', '');
    cons[ext].call(null, path, options, function(err, str) {
      if (!err) self.send(str, 'text/html');
    });
  }
};
