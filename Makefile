serverProd:
	node server.js 4000
	
server:
	forever -w --watchDirectory . server.js 4000

deploy:
	yes | jitsu deploy
