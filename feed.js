var multer  = require('multer');
var express = require('express');
var winston = require('winston');
var fs = require('fs');

var app = express();

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/js', express.static(__dirname + '/js'));

app.use(multer({
	dest : "./uploads/",
	changeDest: function(dest, req, res) {
		return dest+=req.query.path;
	},
	rename: function (fieldname, filename) {
		return filename;
	},
	onFileUploadStart: function (file) {
		winston.log('info', "Upload of " + file.originalname + ' is starting')
	},
	onFileUploadData: function (file, data, req, res) {
		winston.log('debug', data.length + ' of ' + file.originalname + ' arrived')
	},
	onFileUploadComplete: function (file, req, res) {
		winston.log('info', file.originalname + ' uploaded to  ' + file.path + '.');
		res.jsonp({message: file.originalname});
	}
}));

app.get('/file/remove', function(req, res, next) {
	winston.log('info', req.query);
	fs.unlinkSync('uploads/'+req.query.file);
	res.end();
});

app.get('/file', function(req, res, next) {
	winston.log('info', "Send: "+req.params.name);
	res.sendFile(req.query.path, { root: __dirname+"/uploads/" });
}) 

app.get('/',function(req,res){
	res.sendFile("/index.html", { root: __dirname });
});

app.get('/list', function(req, res) {
	var filesList = [];
	var dir = fs.readdirSync("uploads/"+req.query.path);
	winston.log('info', "Get list: uploads/"+req.query.path);
	for (file in dir) {
		if (req.query.search === undefined || req.query.search === "") {
			filesList.push({name: dir[file],
				isDir: fs.lstatSync("uploads/"+req.query.path+dir[file]).isDirectory()
			});
		} else {
			if (dir[file].indexOf(req.query.search)!==-1) {
				filesList.push({
					name: dir[file],
					isDir: fs.lstatSync("uploads/"+req.query.path+dir[file]).isDirectory()
				});
			}
		}
	}
	res.send(filesList);
});

app.post('/uploadDone', function(req, res) {
	res.end();
})

/*Start */
app.listen(3000,function(){
	console.log("Working on port 3000");
});
