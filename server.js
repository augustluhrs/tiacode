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

let players = {}; // holds all current players

//
// SERVER EVENTS
//

//clients
var inputs = io.of('/')
//listen for anyone connecting to default namespace
inputs.on('connection', (socket) => {
  console.log('new input client!: ' + socket.id);

  //add entry to players object (search by id);
  // players[socket.id] = new Player({id: socket.id, hires: refreshHires(1, [null, null, null], socket.id)});

  //listen for this client to disconnect
  socket.on('disconnect', () => {
    console.log('input client disconnected: ' + socket.id);
    // delete players[socket.id]; //TODO check to see if throws syntax error if strict https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete
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

