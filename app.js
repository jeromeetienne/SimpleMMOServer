var app		= require('express')()
var server	= require('http').createServer(app)
var io		= require('socket.io').listen(server);

var listenPort	= process.argv[2] || 80;
console.log('listenPort', listenPort)
server.listen(listenPort);

app.get('/', function (req, res) {
 	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});

	// handle pings
	socket.on('ping', function(data){
		socket.emit('pong', data);
		console.log('received ping from ', this.id);
	});
	
	var helloData;
	socket.on('hello', function(data){
		if( helloData )	return;
		helloData	= data;
		socket.broadcast.emit('hello', helloData);
	});
	
	socket.on('disconnect', function(){
		io.sockets.emit('disconnect', helloData);		
	})
});