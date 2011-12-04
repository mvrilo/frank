var frank = require('../lib/frank'),
    server = frank();

server
  .get('/')
  .basicAuth('admin', 'admin')
  .send('not so minimal api ftw too');

server.listen(8000)
