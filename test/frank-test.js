var f = require('../lib/frank'),
	server = f.server,
	get = f.get, run = f.run;

get('/').write('<h1>it works!</h1>', 'html').end();
get('/write').write(' TEXT PLAIN :D ').end();
get('/minify').write('var opa = function() { \ndocument.write("ok") \n};', 'text/javascript').minify(3).end();
get('/send').send('./frank-test.html').end();
get('/function').then(function(req, res) {
	res.writeHead(200, {'content-type':'text/plain'});
	res.end('FUNCTION OK');
}).end();
get('not found').write('ok').end();

run(8888);
