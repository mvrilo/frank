var frank = require('../lib/frank'),
    server = frank();

server.get('/').send('not so minimal api ftw too');
server.listen(8000)
