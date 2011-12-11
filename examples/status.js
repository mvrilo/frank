var http = require('../lib/frank').createServer();

http.get('/').status(203).send('not so minimal api ftw too');
http.listen(8000);
