var http = require('../lib/frank').createServer();

http.get('/').send('not so minimal api ftw too');
http.listen(8000);
