# frank

yet another sinatra-like microframework
---------------------

**Example:**

    var f = require('frank'),
		get = f.get, run = f.run;

    get('/').write('ok').end();
    get('/js').send('path/to/javascript.js').end();

    run(8888);

more info soon...

MIT License


2010, Murilo Santana


mvrilo@gmail.com
