var app		= require('express')()
var server	= require('http').createServer(app)
var io		= require('socket.io').listen(server);

var listenPort	= process.argv[2] || 80;
server.listen(listenPort);

app.get('/', function (req, res) {
 	res.sendfile(__dirname + '/index.html');
});


var usersList	= {}
io.sockets.on('connection', function(socket){

	socket.on('disconnect', function(){
		socket.broadcast.emit('bye', {
			sourceId	: this.id
		});
		// update usersList
		delete usersList[this.id]		
	})

	socket.on('userInfo', function(data){
		var firstInfo	= usersList[this.id] === undefined;

		usersList[this.id]	= data;

		if( firstInfo )	socket.emit('userlist', usersList)

		io.sockets.emit('userInfo', {
			sourceId	: this.id,
			userInfo	: data
		});
	});


	socket.on('ping', function(data){
		socket.emit('pong', data);
	});

	socket.on('clientEcho', function(data){
		io.sockets.emit('clientBroadcast', {
			sourceId	: this.id,
			message		: data
		});
	});
});