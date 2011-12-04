require.paths.unshift(__dirname + '/../deps');

var http = require('http'),
	url = require('url'),
	fs = require('fs'),
	util = require('util'),
	mime = require('mime/mime').lookup,
	jsp = require('uglifyjs/uglify-js').parser,
	min = require('uglifyjs/uglify-js').uglify;

var core = {
	list : [/* data from chain.cache */],
	server : http.createServer(function(req, res) {
		for (var i in core.list) {
			if (url.parse(req.url).pathname === core.list[i].route && req.method === core.list[i].method || req.method === 'HEAD') {
				if (typeof core.list[i].end !== 'function') {
					if (typeof core.list[i].header === 'object') {
						core.list[i].header.Server = 'Node.js Frank';
						core.list[i].header.Date = +new Date().toUTCString();
						res.writeHead(core.list[i].statusCode, core.list[i].header);
					}
					else {
						res.writeHead(core.list[i].statusCode, {
							'Content-Type':core.list[i].dataType + '; charset=UTF-8',
							Server:'Node.js Frank',
							'Date':+new Date().toUTCString(),
							'Content-Length':core.list[i].end.length
						});
					}
					res.end(core.list[i].end);

					// logging
					var logdata = req.socket.remoteAddress + " - " + req.method.toUpperCase() + " " + req.url;
					util.log(logdata);
				}
				else {
					// the 'then' method
					core.list[i].end(req, res);
				}
			}
			else {
				if (core.list[i].route.toLowerCase() === 'not found' || core.list[i].route.toLowerCase() === 'not found') {
					if (typeof core.list[i].end !== 'function') {
						res.writeHead(404, {
							'Content-Type':core.list[i].dataType + '; charset=UTF-8',
							Server:'Node.js Frank', 
							'Date':+new Date().toUTCString(),
							'Content-Length':core.list[i].end.length
						});
						
						res.end(core.list[i].end);
					}
					else {
						// the 'then' method
						core.list[i].end(req, res);
					}
				}
			}
		}
	})
};

function readDirRecursive(dir) {
	if (fs.statSync(dir).isDirectory()) {
		var body = '',
			dataType = '',
			alpha = [];
		fs.readdirSync(dir).forEach(function(v, k) {
			alpha.push(v);
		});
		alpha.sort().forEach(function(v, k) {
			if (fs.statSync(dir + '/' + v).isFile()) {
				dataType = mime(dir + '/' + v);
				body += fs.readFileSync(dir + '/' + v, 'utf8');
			}
			else if (fs.statSync(dir + '/' + v).isDirectory()) {
				return readDirRecursive(dir + '/' + v).body;
			}
		});
		return {
			body : body,
			dataType : dataType
		};
	}
}

var static_list = {};

function static_handler(route, path) {
	if (fs.statSync(path).isDirectory()) {
		static_list[path] = [];
		fs.readdirSync(path).forEach(function(file) {
			if (fs.statSync(path+"/"+file).isDirectory()) {
				static_handler(route+"/"+file, path+"/"+file);
			}
			else {
				static_list[path].push(file);
				core.list.push({
					route : route+"/"+file,
					method : "GET",
					statusCode: 200,
					dataType : mime(file),
					end : fs.readFileSync(path+"/"+file)
				});
			}
		});
	}
	else {
		throw new Error('Path given is not a directory.');
	}
}

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
		},
		set_public_dir : function(route, path) { // PUBLIC PATH
			if (typeof path === 'undefined') {
				path = route.substr(1);
			}
			static_handler(route, path);
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
		jsmin : function(obj) {
			var beautify = false;

			if (typeof obj !== 'object') {
				obj = {
					strict_semicolons : false,
					toplevel_names : true,
					sequence : true,
					dead_code : true,
					indent_start : 0,
					indent_level : 2,
					quote_keys : false
				};
			}
			else {
				if (typeof obj.strict_semicolons === 'undefined') {
					obj.strict_semicolons = false;
				}
				if (typeof obj.toplevel_names === 'undefined') {
					obj.toplevel_names = true;
				}
				if (typeof obj.sequence === 'undefined') {
					obj.sequence = true;
				}
				if (typeof obj.dead_code === 'undefined') {
					obj.dead_code = true;
				}
				if (typeof obj.indent_start === 'undefined') {
					obj.indent_start = 0;
				}
				if (typeof obj.indent_level === 'undefined') {
					obj.indent_level = 0;
				}
				if (typeof obj.quote_keys === 'undefined') {
					obj.quote_keys = false;
				}
				if (typeof obj.indent_start !== 'undefined' || typeof obj.indent_level !== 'undefined' || typeof obj.quote_keys !== 'undefined') {
					beautify = true;
				}
			}

			jscode = jsp.parse(chain.cache.end, obj.strict_semicolons);
			jscode = min.ast_mangle(jscode, obj.toplevel_names);
			jscode = min.ast_squeeze(jscode, {
				make_seqs : obj.sequence,
				dead_jscode : obj.dead_jscode
			});

			var finalCode = min.gen_code(jscode, beautify ? {
					indent_start : obj.indent_start,
					indent_level : obj.indent_level,
					quote_keys : obj.quote_keys
				} : undefined);

			chain.cache.end = finalCode + "\n";

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
	setPublic : function(route, path) {
		return chain.first.set_public_dir(route, path);
	},
	server : core.server,
	run : function(port) {
		console.log("\nFrank is singin' at http://127.0.0.1:"+port+"/\n");
		if (typeof port !== 'number') {
			port = 8888;
		}
		return core.server.listen(port);
	}
};

module.exports = api;
