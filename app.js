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

	socket.emit('userlist', usersList)

	socket.on('ping', function(data){
		socket.emit('pong', data);
		console.log('received ping from ', this.id);
	});
	
	socket.on('hello', function(data){
		if(usersList[this.id])	return;
		usersList[this.id]	= data;
		
		var msg		= {};
		msg[this.id]	= data;
		socket.broadcast.emit('hello', msg);
	});

	socket.on('clientBroadcast', function(data){
		data.sourceId	= this.id,
		io.sockets.emit('clientBroadcast', data);
	});
	
	socket.on('disconnect', function(){
		var msg		= {};
		msg[this.id]	= usersList[this.id];
		io.sockets.emit('bye', msg);
		// update usersList
		delete usersList[this.id]		
	})
});