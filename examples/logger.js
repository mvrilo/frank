var http = require('../lib/frank').createServer();

http.get('/okay').send('okay');
http.get('/test').send('test');

http.logger('tiny');
http.listen(8000);
