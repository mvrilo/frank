var f = require('../lib/frank').createServer(),
    get = f.get, log = f.log, run = f.run;

get('/').send('minimal api ftw');
log('tiny');
run(8000);
