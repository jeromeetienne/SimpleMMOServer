var app		= require('express')()

var server	= require('http').createServer(app)
server.listen(process.argv[2] || 80);

app.get('/'				, function (req, res) { res.sendfile(__dirname + '/index.html'); });
app.get('/examples/manual_chat.html'	, function (req, res) { res.sendfile(__dirname + '/examples/manual_chat.html'); });
app.get('/examples/client_chat.html'	, function (req, res) { res.sendfile(__dirname + '/examples/client_chat.html'); });
app.get('/examples/client.js'		, function (req, res) { res.sendfile(__dirname + '/examples/client.js'); });

var usersInfo	= {}
var io		= require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
	socket.on('connectRequest', function(data){
		console.assert(usersInfo[this.id] === undefined);	
		usersInfo[this.id]	= data;
		// reply
		socket.emit('connectReply', {
			sourceId	: this.id,
			usersInfo	: usersInfo
		});
		// notify other clients
		socket.broadcast.emit('userInfo', {
			sourceId	: this.id,
			userInfo	: data
		});
	});
	// handle userInfo
	socket.on('userInfo', function(data){
		usersInfo[this.id]	= data;
		io.sockets.emit('userInfo', {
			sourceId	: this.id,
			userInfo	: data
		});
	});
	// handle disconnection
	socket.on('disconnect', function(){
		socket.broadcast.emit('userLeft', {
			sourceId	: this.id
		});
		delete usersInfo[this.id]		
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
	// handle clientEcho
	socket.on('clientBroadcast', function(data){
		socket.broadcast.emit('clientBroadcast', {
			sourceId	: this.id,
			message		: data
		});
	});
});