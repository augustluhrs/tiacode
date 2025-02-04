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
let wheel;
let emotions = []; 
let animals = [];
let emotionImages = {};
let animalImages = {}; //so we can use key of filename instead of iterating through array, but still good to use array for dropdown

function preload() {
  font = loadFont("./assets/fonts/Lugrasimo.ttf");
  wheel = loadImage("./assets/icons/emotionWheel.png"); //had to remove background in photoshop

  //go through emotions and animal folders for name/image pairs
  fetch('/emotions')
    .then(response => response.json())
    .then(data => {
        emotions = data;
        console.log(emotions);

        //load all those images
        for (let emotion of emotions){
          emotionImages[emotion.file] = loadImage(`./assets/emotions/${emotion.file}`);
        }
        console.log(emotionImages);

    })
    .catch(error => console.error('Error fetching emotion files:', error));
  fetch('/animals')
    .then(response => response.json())
    .then(data => {
        animals = data;
        for (let animal of animals){
          animalImages[animal.file] = loadImage(`./assets/animals/${animal.file}`);
        }
        console.log(animals);
    })
    .catch(error => console.error('Error fetching animal files:', error));
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
  nameInput.hide();
  messageInput.hide();
  emotionDropdown.hide();
  colorPickerPrimary.hide();
  // colorPickerSecondary.hide();
  checkInButt.hide();
})

//
//  VARIABLES
//

let player = {}; //stores the info about the player in check in mode, then is sent to server to init
let gardenState = {}; //this contains the information about the entire garden: players and environment
let animalSize; //the size to draw the avatars -- relative so initialized in set up
let hasCheckedIn = false; //our state toggle -- so they go to the check in screen before garden
let emotionSize;
//
//  MAIN
//

function setup(){
  createCanvas(windowWidth - 5, windowHeight - 5); //TODO better way of ensuring scrollbars don't show up
  // image(forest, width/2, height/2, windowWidth, windowHeight);

  //layout
  rectMode(CENTER);
  imageMode(CENTER);
  angleMode(RADIANS);
  textFont(font);
  textAlign(CENTER, CENTER);
  strokeWeight(2);

  //relative scaling of visual elements depending on screen size
  animalSize = width / 20;
  emotionSize = width / 15;

  updateCSSFontSize();
  textSize(width/35);
  //for UI elements, share same size for positioning
  divWidth = width * .33;
  divHeight = height * .1;

  initUI(); //sets up all our UI ( separate so setup isn't cluttered)

  console.log("✨ ✨ ✨ setup done ✨ ✨ ✨ ");
} 

function draw(){
  if (!hasCheckedIn){
    //check in screen
    background("#efa2ee"); //light pink / lilac

    push();
    stroke(71, 55, 13);
    fill(77, 130, 4);
    textSize(width/25);
    text("GARDEN OF ??? DELIGHTS", width / 2, height * .075);
    pop();

    //labels for UI
    push();
    textAlign(LEFT, CENTER);
    text("name",(width * .15), (height * .2));
    text("what's on your mind?",(width * .15), (height * .35));
    text("how you feelin'?",(width * .15), (height * .5));
    text("name color",(width * .15), (height * .7));
    pop();

    //emotion wheel display
    image(wheel, width * .7, height * .4, width * .25, width * .25);
  } else {
    background("#93a800"); //good green
    textSize(width/80);
    // strokeWeight(1);
    stroke(player.colorSecondary);
    fill(player.colorPrimary);
    //
    // DISPLAYING AVATARS AND ENVIRONMENT
    //

    //draw emotions first so avatars always over
    for (let [id, p] of Object.entries(gardenState.players)){
      //using p for player so doesn't confuse with global player variable
      if (p.emotion.file !== null){
        // console.log(p.emotion);
        // console.log(emotionSize);
        image(emotionImages[p.emotion.file], p.emotion.pos.x, p.emotion.pos.y, emotionSize, emotionSize);
      }
    }
  
    for (let [id, p] of Object.entries(gardenState.players)){
      //using p for player so doesn't confuse with global player variable
      push();
      if (p.animal.file == null){ continue;} //skip if they haven't checked in yet
      image(animalImages[p.animal.file], p.pos.x, p.pos.y, animalSize, animalSize);
      stroke(p.colorSecondary);
      fill(p.colorPrimary);
      // ellipse(p.pos.x, p.pos.y, animalSize);
      //show messages if close -- for now, if shift down
      if (keyIsDown(SHIFT)){
        text(p.message, p.pos.x, p.pos.y - (animalSize * .75));
      } else {
        text(p.name, p.pos.x, p.pos.y - (animalSize * .75));
      }
      pop();
    }

    text("press shift to show messages", width / 2, height * .95);
  
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

let nameInput, messageInput, emotionDropdown, colorPickerPrimary, colorPickerSecondary, checkInButt;
let divWidth, divHeight;

function initUI() {
  //assumes landscape since needs keyboard anyway
  //i should probably use more css, but i understand the js way more

  //name and message inputs
  nameInput = createInput("").class("inputs");
  nameInput.position((width * .3) - (divWidth / 2), (height * .3) - (divHeight / 2)).size(divWidth, divHeight / 2);
  nameInput.input(()=>{
    player.name = nameInput.value();
  });
  messageInput = createInput("").class("inputs");
  messageInput.position((width * .3) - (divWidth / 2), (height * .45) - (divHeight / 2)).size(divWidth, divHeight / 2);
  messageInput.input(()=>{
    player.message = messageInput.value();
  });

  //emotion dropdown -- for secondary color
  emotionDropdown = createSelect(true).class("dropdowns"); //allow for multiple selections
  emotionDropdown.position((width * .3) - (divWidth / 2), (height * .6) - (divHeight / 2)).size(divWidth, divHeight);
  for (let emotion of emotions){
    emotionDropdown.option(emotion.emotion, emotion.file);
    // console.log(emotion);

  }
  emotionDropdown.changed(()=>{
    console.log(emotionDropdown.value());
    player.emotion.file = emotionDropdown.value();
  })

  //color picker -- now just one, emotion is stroke
  colorPickerPrimary = createColorPicker("#bb33bb");
  colorPickerPrimary.position((width * .3) - (divWidth / 2), (height * .8) - (divHeight / 2)).size(divWidth, divHeight);
  colorPickerPrimary.input(()=>{
    player.colorPrimary = colorPickerPrimary.value();
  });
  // colorPickerSecondary = createColorPicker("#ffffff");
  // colorPickerSecondary.position((width * .3) - (divWidth / 2), (height * .8) - (divHeight / 2)).size(divWidth, divHeight);
  // colorPickerSecondary.input(()=>{
  //   player.colorSecondary = colorPickerSecondary.value();
  // });

  // check-in button
  checkInButt = createButton('CHECK IN').class("butts");
  checkInButt.position((width * .7) - (divWidth / 2), height * .75 - (divHeight / 2)).size(divWidth, divHeight * 1.5)
  checkInButt.mousePressed(()=>{
    //pick random animal for now
    player.animal.file = random(animals).file;
    socket.emit("checkIn", player);
    console.log(player);
    console.log('checked in');
  })
  
}

//
//  MISC FUNCTIONS
//

function updateCSSFontSize() { //thanks chat gpt, i was doing this a dumb way before
  let cssRule = document.styleSheets[0].cssRules;
  for (let rule of cssRule) {
    if (rule.selectorText === 'body' || rule.selectorText === '.butts') {
      rule.style.fontSize = (width / 31) + 'px';
    }
    if (rule.selectorText === '.inputs') {
      rule.style.fontSize = (width / 42) + 'px';
    }
    if (rule.selectorText === '.dropdowns') {
      rule.style.fontSize = (width / 50) + 'px';
    }
  }
}
