'use strict';

var path = require('path'),
	_ = require('underscore'),
	nodeStatic = require('node-static');

exports.register = function(app) {
	var logger = app.lib.logger('static server'),
		serversHash = [],
		cwd = process.cwd(),
		options = app.config.http['static'].options;

	_(app.config.http['static'].locations).each(function(location) {
		logger.log('init url "%s" with root "%s"', location.url, location.root);

		app.httpServer.addRequestListener(function(req, res, next) {
			if (
				(_(location.url).isRegExp() && location.url.test(req.url)) ||
				(_(location.url).isString() && req.url.indexOf(location.url) === 0)
			) {
				var root = path.join(cwd, location.root),
					id = String(location.url) + ';' + root;

				if (!serversHash[id]) {
					serversHash[id] = new nodeStatic.Server(root, options);
				}

				var server = serversHash[id];
				server.serve(req, res);
			} else {
				next();
			}
		});
	});

};
