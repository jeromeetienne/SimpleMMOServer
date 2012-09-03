var SimpleMMOServer	= function(userInfo){
	var socket	= io.connect();
	//var socket = io.connect('http://jetienne.tquery-multiplayerserver.jit.su:80/');
	this._socket	= socket;
	//////////////////////////////////////////////////////////////////////////
	//		userInfo						//
	//////////////////////////////////////////////////////////////////////////
	this._userInfo	= userInfo || {
		humanName	: "user"+Math.floor(Math.random()*100000)
	};
	// emit initial userInfo
	socket.emit('userInfo', this._userInfo);

	this._usersInfo	= {};
	// listen on user info
	socket.on('userInfo', function(data){
		console.log('received userInfo', JSON.stringify(data, null, '\t'))
		// 
		var oldUserInfo	= this._usersInfo[data.sourceId]
		// test if it is a new user
		var newUser	= oldUserInfo === undefined ? true : false;
		// update usersInfo
		this._usersInfo[data.sourceId]	= data.userInfo;
		// notify event
		if( newUser )	this.dispatchEvent('userJoin', data);
		
		this.dispatchEvent('userInfoChange', data.sourceId, data.userInfo, oldUserInfo);
	}.bind(this));
	// listen on bye
	// - TODO rename that 'userLeft'
	socket.on('bye', function(data){
		console.log('received bye ', JSON.stringify(data, null, '\t'));

		var userInfo	= this._usersInfo[data.sourceId];
		delete this._usersInfo[data.sourceId]
		this.dispatchEvent('userLeft', {
			sourceId	: data.sourceId,
			userInfo	: userInfo
		});
	}.bind(this));
	// listen on 'userList'
	socket.on('userlist', function(data){
		console.log('received userList ', JSON.stringify(data, null, '\t'), this);
		this._usersInfo	= data;
		this.dispatchEvent('usersInfoChange', this._usersInfo);
	}.bind(this));

	//////////////////////////////////////////////////////////////////////////
	//		Ping							//
	//////////////////////////////////////////////////////////////////////////

	// ping server every seconds
	this._latency	= undefined;
	setInterval(function(){
		socket.emit('ping', { time	: Date.now() });
	}, 1000)
	socket.on('pong', function(data){
		var rtt		= Date.now() - data.time;
		var smoother	= 0.3;
		this._latency	= this._latency === undefined ? rtt : this._latency;
		this._latency	= (1-smoother)*this._latency  + smoother * rtt;
		//console.log('received pong. rtt ', rtt, 'ms.', 'Smoothed Latency:', this._latency);
		this.dispatchEvent('pong', data)
	}.bind(this));


	//////////////////////////////////////////////////////////////////////////
	//		Chat							//
	//////////////////////////////////////////////////////////////////////////

	socket.on('clientEcho', function(data){
		this.dispatchEvent('clientEcho', data)
	}.bind(this));
}


SimpleMMOServer.prototype.clientEcho	= function(data){
	this._socket.emit('clientEcho', data)
}

SimpleMMOServer.prototype.latency	= function(){
	return this._latency;
}

SimpleMMOServer.prototype.usersInfo	= function(){
	return this._usersInfo;
}

SimpleMMOServer.prototype.userInfo	= function(value){
	if( value === undefined ) 	return this._userInfo;
	this._userInfo	= value;
	// emit  userInfo
	this._socket.emit('userInfo', this._userInfo);
	console.log('userInfo', this._userInfo)
	return this;
}
//////////////////////////////////////////////////////////////////////////////////
//		SimpleMMOServer microevent					//
//////////////////////////////////////////////////////////////////////////////////

SimpleMMOServer.MicroeventMixin	= function(destObj){
	destObj.addEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
		return fct;
	};
	destObj.removeEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	};
	destObj.dispatchEvent		= function(event /* , args... */){
		if(this._events === undefined) 	this._events	= {};
		if( this._events[event] === undefined )	return;
		var tmpArray	= this._events[event].slice(); 
		for(var i = 0; i < tmpArray.length; i++){
			tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	};
};

SimpleMMOServer.MicroeventMixin(SimpleMMOServer.prototype);


