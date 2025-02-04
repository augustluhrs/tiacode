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

//for file system requests (used in emotions folder)
const fs = require('fs');
const path = require('path');
app.get('/emotions', (req, res) => {
  const folderPath = path.join(__dirname, 'public/assets/emotions');
  console.log(folderPath);
  fs.readdir(folderPath, (err, files) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading directory' });
      }

      // Create an array of objects with name properties
      const emotionObjects = files.map(file => ({ emotion: path.parse(file).name, file: file }));
      res.json(emotionObjects);
  });
});
app.get('/animals', (req, res) => {
  const folderPath = path.join(__dirname, 'public/assets/animals');
  console.log(folderPath);
  fs.readdir(folderPath, (err, files) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading directory' });
      }

      // Create an array of objects with name properties
      const animalObjects = files.map(file => ({ animal: path.parse(file).name, file: file }));
      res.json(animalObjects);
  });
});

//
// GAME VARIABLES
//

let gardenState = { // holds all info from the garden (including players), used for update
  players: {},
  width: 1920,
  height: 1080,
}; 

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
    pos: {x: -100, y: -100}, //to start off screen while player checks in 
    colorPrimary: "#bb33bb",
    colorSecondary: "#ffffff",
    animal: {
      // image: null,
      file: null,
    },
    emotion: {
      // image: null,
      file: null,
      pos: {x: -100, y: -100}
    },
  };
  socket.emit("playerInit", gardenState.players[socket.id]);

  //receiving player input from checkin screen, sending to garden after
  socket.on("checkIn", (data)=>{
    gardenState.players[socket.id] = data;
    let randomX = Math.floor((Math.random() * gardenState.width * .8) + gardenState.width * .1);
    let randomY = Math.floor((Math.random() * gardenState.height * .8) + gardenState.height * .1);
    gardenState.players[socket.id].pos.x = randomX;
    gardenState.players[socket.id].pos.y = randomY;
    gardenState.players[socket.id].emotion.pos.x = randomX;
    gardenState.players[socket.id].emotion.pos.y = randomY;
    
    console.log(`${data.name} has checked in at ${gardenState.players[socket.id].pos.x}, ${gardenState.players[socket.id].pos.y}`);
    socket.emit("goToGarden");
  })

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

