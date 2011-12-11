var connect = require('connect');
var http = require('../lib/frank').createServer();

http.get('/okay').send('okay');
http.get('/test').send('test');

http.use(connect.errorHandler());

// http.use(connect.logger('tiny'));
http.logger('tiny');
http.listen(8000);
