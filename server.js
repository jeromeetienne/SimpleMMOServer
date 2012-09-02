var app		= require('express')()

var server	= require('http').createServer(app)
server.listen(process.argv[2] || 80);

app.get('/examples/manual_chat.html'	, function (req, res) { res.sendfile(__dirname + '/examples/manual_chat.html'); });
app.get('/examples/client_example.html'	, function (req, res) { res.sendfile(__dirname + '/examples/client_example.html'); });
app.get('/examples/client.js'		, function (req, res) { res.sendfile(__dirname + '/examples/client.js'); });

var usersList	= {}
var io		= require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
	// handle userInfo
	socket.on('userInfo', function(data){
		var firstInfo	= usersList[this.id] === undefined;
		usersList[this.id]	= data;
		if( firstInfo )	socket.emit('userlist', usersList)
		io.sockets.emit('userInfo', {
			sourceId	: this.id,
			userInfo	: data
		});
	});
	// handle disconnection
	socket.on('disconnect', function(){
		socket.broadcast.emit('bye', {
			sourceId	: this.id
		});
		delete usersList[this.id]		
	})
	// handle ping
	socket.on('ping', function(data){
		socket.emit('pong', data);
	});
	// handle clientEcho
	socket.on('clientEcho', function(data){
		io.sockets.emit('clientEcho', {
			sourceId	: this.id,
			message		: data
		});
	});
});