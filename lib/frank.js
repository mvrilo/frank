var http = require('http'),
	url = require('url'),
	fs = require('fs'),
	mime = require('mime').lookup,
	jsmin = require('jsmin').jsmin,
	qs = require('querystring');

function readDirRecursive(dir) {
	if (fs.statSync(dir).isDirectory()) {
		var body = '',
			dataType = '',
			alpha = [];
		fs.readdirSync(dir).forEach(function(v, k) {
			alpha.push(v)
		});
		alpha.sort().forEach(function(v, k) {
			if (fs.statSync(dir + '/' + v).isFile()) {
				dataType = mime(dir + '/' + v);
				body += fs.readFileSync(dir + '/' + v, 'utf8');
			}
			else if (fs.statSync(dir + '/' + v).isDirectory()) {
				readDirRecursive(dir + '/' + v).body;
			}
		});
		return {
			body : body,
			dataType : dataType
		};
	}
}

var core = {
	list : [/* data from chain.cache */],
	server : http.createServer(function(req, res) {
		for (var i in core.list) {
			if (url.parse(req.url).pathname === core.list[i].route && req.method === core.list[i].method) {
				if (typeof core.list[i].end !== 'function') {
					if (core.list[i].header) {
						core.list[i].header.server = 'Node.js Frank';
						res.writeHead(core.list[i].statusCode, core.list[i].header);
					}
					else {
						res.writeHead(core.list[i].statusCode, {'Content-Type':core.list[i].dataType, Server:'Node.js Frank', 'Content-Length':core.list[i].end.length});
						res.write(core.list[i].end);
						res.end();
					}
				}
				else {
					core.list[i].end(req, res);
				}
			}
			else {
				if (core.list[i].route.toLowerCase() === 'not found' || core.list[i].route.toLowerCase() === 'not found') {
					if (typeof core.list[i].end !== 'function') {
						res.writeHead(404, {'Content-Type':core.list[i].dataType, Server:'Node.js Frank', 'Content-Length':core.list[i].end.length});
						res.write(core.list[i].end);
						res.end();
					}
					else {
						core.list[i].end(req, res);
					}
				}
			}
		}
	})
};

var chain = {
	cache : {
		// route
		// statusCode
		// method
		// header
		// dataType
		// end
	},
	first : {
		request : function(route, method, statusCode) {
			chain.cache = {};
			chain.cache.route = route;
			chain.cache.method = method;
			chain.cache.statusCode = statusCode;
			return chain.second;
		}
	},
	second : {
		then : function(cb) {
			if (typeof cb !== 'function') {
				throw new Error('argument must be a function');
			}
			chain.cache.end = cb;
			return chain.fourth;
		},
		header : function(head) {
			if (typeof head !== 'object') {
				throw new Error('argument must be an object');
			}
			chain.cache.header = head;
			return {
				write : chain.second.write,
				send : chain.second.send
			};
		},
		write : function(str, dataType) {
			if (typeof str !== 'string') {
				throw new Error('argument must be a string');
			}
			chain.cache.dataType = dataType || 'text/plain';
			chain.cache.end = str;
			if (/javascript/.test(dataType)) {
				return {
					minify : chain.third.jsmin,
					end : chain.fourth.run
				};
			}
			else {
				return chain.fourth;
			}
		},
		send : function(file, dataType) {
			if (fs.statSync(file).isFile()) {
				chain.cache.end = fs.readFileSync(file, 'utf8');
				chain.cache.dataType = dataType || mime(file);
				if (chain.cache.dataType.match(/javascript/)) {
					return {
						minify : chain.third.jsmin,
						end : chain.fourth.end
					};
				}
			}
			return chain.fourth;
		},
		sendDir : function(dir, type) {
			chain.cache.dataType = type || readDirRecursive(dir).dataType;
			chain.cache.end = readDirRecursive(dir).body;

			if (chain.cache.dataType.match(/javascript/)) {
				return {
					minify : chain.third.jsmin,
					end : chain.fourth.end
				};
			}
			else {
				return chain.fourth;
			}
		}
	},
	third : {
		jsmin : function(level) {
			chain.cache.end = jsmin(chain.cache.end, level);
			return chain.fourth;
		}
	},
	fourth : {
		end : function() {
			core.list.push(chain.cache);
		}
	}
};

var api = {
	get : function(route, statusCode) {
		if (!statusCode) {
			statusCode = 200;
		}
		return chain.first.request(route, 'GET', statusCode);
	},
	post : function(route, statusCode) {
		if (!statusCode) {
			statusCode = 200;
		}
		return chain.first.request(route, 'POST', statusCode);
	},
	server : core.server,
	run : function(port) {
		console.log("\nFrank is singin' at http://localhost:"+port+"\n");

		if (typeof port !== 'number') {
			port = 8888;
		}
		return core.server.listen(port);
	}
};

module.exports = api;
