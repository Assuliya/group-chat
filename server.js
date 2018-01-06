// Import express and path modules.
var express = require( "express");
var path = require( "path");
// Create the express app.
var app = express();
// Define the static folder.
app.use(express.static(path.join(__dirname, "./static")));
// Setup ejs templating and define the views folder.
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// Root route to render the index.ejs view.
app.get('/', function(req, res) {
 res.render("index");
})
// Start Node server listening on port 8000.
var server = app.listen(8000, function() {
 console.log("listening on port 8000");
})

var users = [];
var messages = [];

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
  console.log("Client/socket is connected!");
  console.log("Client/socket id is: ", socket.id);
  var user_id = socket.id;

  socket.on( "new_user", function (data){
    console.log( 'New User', data.name);
    users.push({name:data.name, id: user_id})
    console.log(users)
    socket.broadcast.emit( 'joined_user', {name: data.name, id: user_id});
    socket.emit( 'existing_users', {users: users});
    socket.emit( 'existing_messages', {messages: messages});

  })

  socket.on('disconnect', function (socket) {
    console.log("Client/socket is disconnected!");
    for(var i = 0; i < users.length; i++){
      var name
      if(users[i].id == user_id){
        name = users[i].name
        users.splice(i, 1)
      }
      io.emit( 'disconnected_user', {id: user_id, name: name});
    }
  })

  socket.on( "form", function (data){
    var user_name
    for(var i = 0; i < users.length; i++){
      if(users[i].id == user_id){
        user_name = users[i].name
      }
    }
    messages.push({name: user_name, id: user_id, message: data.values.message})
    console.log(messages)
    io.emit( 'new_message', {name: user_name, id: user_id, message: data.values.message});
  })
})
