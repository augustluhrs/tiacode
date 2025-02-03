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

socket.on("goToGarden", ()=>{
  hasCheckedIn = true;
  colorPickerPrimary.hide();
  colorPickerSecondary.hide();
  checkInButt.hide();
})

//
//  VARIABLES
//

let player = {}; //stores the info about the player in check in mode, then is sent to server to init
let gardenState = {}; //this contains the information about the entire garden: players and environment
let avatarSize; //the size to draw the avatars -- relative so initialized in set up
let hasCheckedIn = false; //our state toggle -- so they go to the check in screen before garden

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

  //relative scaling of visual elements depending on screen size
  avatarSize = width / 20;
  updateFontSize();

  initUI(); //sets up all our UI ( separate so setup isn't cluttered)
} 

function draw(){

  if (!hasCheckedIn){
    //check in screen
    background("#efa2ee"); //light pink / lilac
  } else {
    background("#93a800"); //good green

    //
    // DISPLAYING AVATARS AND ENVIRONMENT
    //
  
    for (let [id, player] of Object.entries(gardenState.players)){
      stroke(player.colorSecondary);
      fill(player.colorPrimary);
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
}

//
//  UI FUNCTIONS
//

let colorPickerPrimary, colorPickerSecondary, checkInButt;

function initUI() {
  //assumes landscape since needs keyboard anyway
  //i should probably use more css, but i understand the js way more

  //container divs for all UI elements share same size for positioning
  let divWidth = width * .33;
  let divHeight = height * .4;

  //color pickers
  // colorDiv = createDiv("").id("colorDiv");
  // colorDiv.position((width * .3) - (divWidth / 2), (height * .7) - (divHeight / 2)).size(divWidth, divHeight);
  colorPickerPrimary = createColorPicker("#bb33bb");
  colorPickerPrimary.position((width * .3) - (divWidth / 2), (height * .7) - (divHeight / 2)).size(divWidth, divHeight * .25);
  colorPickerPrimary.input(()=>{
    player.colorPrimary = colorPickerPrimary.value();
  });
  colorPickerSecondary = createColorPicker("#ffffff");
  colorPickerSecondary.position((width * .3) - (divWidth / 2), (height * .9) - (divHeight / 2)).size(divWidth, divHeight * .25);
  colorPickerSecondary.input(()=>{
    player.colorSecondary = colorPickerSecondary.value();
  });

  // check-in button
  checkInButt = createButton('CHECK IN and GO TO GARDEN').class("butts");
  checkInButt.position(width * .7 - (divWidth / 2), height * .9 - (divHeight / 2)).size(divWidth, divHeight * .3)
  checkInButt.mousePressed(()=>{
    //position has to come from server...
    socket.emit("checkIn", player);
    console.log('checked in');
  })
  
}

//
//  MISC FUNCTIONS
//

function updateFontSize() { //thanks chat gpt, i was doing this a dumb way before
  let cssRule = document.styleSheets[0].cssRules;
  for (let rule of cssRule) {
    if (rule.selectorText === 'body' || rule.selectorText === '.butts') {
      rule.style.fontSize = (width / 31) + 'px';
    }
    if (rule.selectorText === '.inputs') {
      rule.style.fontSize = (width / 38) + 'px';
    }
  }
}
