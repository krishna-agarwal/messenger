var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var clients = {};

io.on('connection',function(socket) {
	console.log('connected');
	socket.emit('userList',Object.keys(clients))
	var userName = null;
	socket.on('addUser',function(data){
		console.log(data);
		userName = data.name;
		if(!clients[userName]){
			clients[userName] = socket;
			io.emit('userList',Object.keys(clients));
		}else{
			socket.emit('userExist',{'msg' : userName+' already taken :('})
		}
		
	});

	socket.on('message',function(data){
		console.log(data);
		var from = data.from;
		var to = data.to;
		if(to == "Broadcast"){
			socket.broadcast.emit('broadcastMessage',data);
		}else{
			clients[to].emit('newMessage',data);
		}
	});

	socket.on('typing',function(data){
		console.log(data);
		var from = data.from;
		var to = data.to;
		if(to != "Broadcast"){
			clients[to].emit('newTyping',data);
		}
	});

	socket.on('disconnect',function(){
	    console.log('disconnect');
	    delete clients[userName];

	    io.emit('userList',Object.keys(clients));
  	});
})

server.listen(8080);
console.log('Messanger app is ready on port 8080, bring it on');