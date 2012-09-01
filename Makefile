server:
	forever -w --watchDirectory . server.js 8000

serverSimple:
	node server.js 8000
	
deploy:
	yes | jitsu deploy