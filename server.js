/*
    ~ * ~ * ~ * 
    SERVER
    ~ * ~ * ~ * 
*/

//create server
let port = process.env.PORT || 8000;
let express = require('express');
const e = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function(){
  console.log('Server is listening at port: ', port);
});

//where we look for files
app.use(express.static('public'));

//create socket connection
let io = require('socket.io')(server);

//
// GAME VARIABLES
//

// let players = {}; // holds all current players
let gardenState = {players: {}}; // holds all info from the garden (including players), used for update

let moveSpeed = 5;

//
// SERVER EVENTS
//

setInterval(()=>{
  //the loop that sends the current state of information to all connected pages
  inputs.emit('update', gardenState);
  garden.emit('update', gardenState);
}, 2); // x milliseconds -- 10 was too laggy

//clients
var inputs = io.of('/')
//listen for anyone connecting to default namespace
inputs.on('connection', (socket) => {
  console.log('new input client!: ' + socket.id);

  //add entry to players object (search by id);
  gardenState.players[socket.id] = {
    name: "", 
    message: "",
    pos: {x: 0, y: 0}, 
    // color: {r: 0, g: 0, b: 0},
    color: "#bb33bb",
    avatar: {},
    emotion: {},
  };
  socket.emit("playerInit", gardenState.players[socket.id]);

  //listen for movement events emitted from user WASD or arrow keys
  socket.on('move', (direction)=>{
    switch(direction){
      case "up":
        gardenState.players[socket.id].pos.y -= moveSpeed;
        break;
      case "down":
        gardenState.players[socket.id].pos.y += moveSpeed;
        break;
      case "left":
        gardenState.players[socket.id].pos.x -= moveSpeed;
        break;
      case "right":
        gardenState.players[socket.id].pos.x += moveSpeed;
        break;
    }
  });

  //listen for this client to disconnect
  socket.on('disconnect', () => {
    console.log('input client disconnected: ' + socket.id);
    delete gardenState.players[socket.id]; //TODO check to see if throws syntax error if strict https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete
  });

});

//garden screen
var garden = io.of('/garden');

//listen for anyone connecting to /garden namespace
garden.on('connection', (socket) => {
  console.log('garden!: ' + socket.id);

  //listen for this client to disconnect
  socket.on('disconnect', () => {
    console.log('garden disconnected: ' + socket.id);
  });

});

//
// FUNCTIONS
//

