var f = require('../lib/frank'), server = f(),
    get = server.get, run = server.run;

get('/').send('minimal api ftw');
run(8000);
