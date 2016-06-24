var _confServer = require('./conf-server.js')(),
	fs = require('fs'),
	http = require('http'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	schedule = require('node-schedule'),
	session = require('express-session'),
	multer = require('multer'),
	morgan = require('morgan'),
	request = require('request'),

	uploader = multer({
		storage: multer.diskStorage({
			destination: function(req, file, cb) {
				cb(null, _confServer.tempPath)
			},
			filename: function(req, file, cb) {
				var now = new Date();
				cb(null, now.getFullYear() + 
						('0' + (now.getMonth()+1)).slice(-2) + 
						('0' + now.getDate()).slice(-2) + 
						('0' + now.getHours()).slice(-2) + 
						('0' + now.getMinutes()).slice(-2) + 
						('0' + now.getSeconds()).slice(-2) + 
						('0' + Math.floor(Math.random()*100)).slice(-2)
					)
			}
		})
	});


var	express = require('express'),
	app = express();

app.use(bodyParser.urlencoded({extended: true,limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));	

app.use(express.static(__dirname + '/image-upload'));	
app.use('/create', express.static(__dirname + '/image-upload/upload.html'));


/* 附件上传 */
app.post('/api/upload', function(req, res) {
	var base64Data = req.body.img,
		filename   = req.body.file,
		filetype   = req.body.type;
	var dataBuffer = new Buffer(base64Data, 'base64');
	fs.writeFile(_confServer.uploadPath+'/'+filename, dataBuffer, function(err) {
		if(err){
		  res.send(err);
		}else{
			if(filetype == "small"){
				res.send('upload/'+filename);
				return;
			}
		  	res.send("保存成功！");
		}
	});
});
app.post('/api/uploads', function(req, res, next) {
	fs.exists(_confServer.tempPath, function(isExists) {
		if(!isExists) {
			fs.mkdirSync(_confServer.tempPath);
		}
		next();
	});
}, uploader.single('file'), function(req, res, next) {
	res.send(req.file);
});

var server = app.listen(_confServer.port, function() {
	console.log('UFT Server Listening on port %d', server.address().port);
});