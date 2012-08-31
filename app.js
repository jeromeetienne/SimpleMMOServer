var app		= require('express')()
var server	= require('http').createServer(app)
var io		= require('socket.io').listen(server);

var listenPort	= process.argv[2] || 80;
server.listen(listenPort);

app.get('/', function (req, res) {
 	res.sendfile(__dirname + '/index.html');
});


var userList	= {}
io.sockets.on('connection', function(socket){

	socket.emit('userlist', userList)

	socket.on('ping', function(data){
		socket.emit('pong', data);
		console.log('received ping from ', this.id);
	});
	
	socket.on('hello', function(data){
		if(userList[this.id])	return;
		userList[this.id]	= data;
		
		var msg		= {};
		msg[this.id]	= data;
		socket.broadcast.emit('hello', msg);
	});
	
	socket.on('disconnect', function(){
		var msg		= {};
		msg[this.id]	= userList[this.id];
		io.sockets.emit('bye', msg);
		delete userList[this.id]		
	})
});