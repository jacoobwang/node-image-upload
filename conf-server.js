
;(function() {
	'use strict';

	 var root = this;
	 var conf = function(obj) {
	 	return {
	 		port: 8000 || process.env.PORT,
			referer: 'http://localhost/',
			tempPath: 'temp',
			uploadPath: 'image-upload/upload',
	 	};
	 }

	 // -------------------------------------------------------
	 if(typeof exports !== 'undefined') {
	 	if(typeof module !== 'undefined' && module.exports) {
	 		exports = module.exports = conf;
	 	}
	 	exports.conf = conf;
	 } else if (typeof define === 'function' && define.amd) {
	 	define('underscore', function() {
	 		return conf;
	 	})
	 } else {
	 	root.conf = conf;
	 }
}).call(this);
