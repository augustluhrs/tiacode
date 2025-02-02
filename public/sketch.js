/*
    ~ * ~ * ~ * 
    CLIENT
    ~ * ~ * ~ * 
*/

//
//  ASSET LOAD
//

let font;
let monsterAssets = {};

function preload() {
  font = loadFont("../assets/fonts/MochiyPopOne-Regular.ttf");
}

//
//  SOCKET SERVER STUFF
//

//open and connect the input socket
let socket = io('/');

//listen for the confirmation of connection 
socket.on('connect', () => {
  console.log('now connected to server');
  // playerID = socket.id;
});

socket.on('playerInit', (data)=>{
  player = data;
});

// socket.on('move') //no, just update loop for everyone, simpler?
socket.on("update", (data)=>{
  gardenState = data;
})

//
//  VARIABLES
//

let player = {}; //stores the info about the player, not technically needed after joining garden
let gardenState = {}; //this contains the information about the entire garden: players and environment
let avatarSize; //the size to draw the avatars -- relative so initialized in set up

//
//  MAIN
//

function setup(){
  createCanvas(windowWidth - 5, windowHeight - 5); //TODO better way of ensuring scrollbars don't show up
  // background(82,135,39);
  // image(forest, width/2, height/2, windowWidth, windowHeight);

  //layout
  rectMode(CENTER);
  imageMode(CENTER);
  angleMode(RADIANS);
  textFont(font);
  textAlign(CENTER, CENTER);
  strokeWeight(2);

  avatarSize = width / 20;

} 

function draw(){
  background("#93a800");

  //
  // DISPLAYING AVATARS AND ENVIRONMENT
  //

  for (let [id, player] of Object.entries(gardenState.players)){
    fill(player.color)
    ellipse(player.pos.x, player.pos.y, avatarSize);
  }

  //
  // USER CONTROLS
  //
  if (keyIsDown(87) || keyIsDown(UP_ARROW)){ //87 is the key code for "w"
    socket.emit("move", "up");
  }
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)){ //83 is the key code for "s"
    socket.emit("move", "down");
  }
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)){ //65 is the key code for "a"
    socket.emit("move", "left");
  }
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)){ //68 is the key code for "d"
    socket.emit("move", "right");
  }
 
  
}

//
//  SHOW FUNCTIONS
//

//
//  MISC FUNCTIONS
//
