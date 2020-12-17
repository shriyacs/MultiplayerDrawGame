var User = require('./game').User;
var Room = require('./game').Room;
var room1 = new Room();
var port = 8000;
var GameRoom = require('./game').GameRoom;
var room1 = new GameRoom();

// Server code
var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({ port: port });

server.on('connection', function(socket) {
 var user = new User(socket);
 room1.addUser(user);
 console.log("A connection established");
 var message = "Welcome " + user.id
 + " joining the party. Total connection: "
 + room1.users.length;
});

console.log("WebSocket server is running.");
console.log("Listening to port " + port + ".");