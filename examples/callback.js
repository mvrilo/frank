var frank = require('../lib/frank'),
    server = frank();

server.get('/', function(req, res) {
  res.end('as a callback');
});

server.listen(8000)
