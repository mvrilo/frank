var frank = require('../lib/frank'),
    server = frank();

server.get('/admin').basicAuth('admin', 'admin').send('auth fine');
server.get('/test').basicAuth('test', 'test').send('ok');
server.get('/').send('no authorization required');

server.listen(8000)
