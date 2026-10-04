// Each word is shown for SCENE_LENGTH frames with a randomly picked scene, looping forever.
const WORDS = ["WE'RE", "CREVTIVE"];
const SCENE_LENGTH = 30;
const FRAME_RATE = 30;

let font;
let bgColor, fgColor;

let scenes;
let scene;
let wordIndex = 0;
let frameCounter = 0;

function preload(){
  font = loadFont("fonts/CREVTIVE-Extended-Black.woff");
}

function setup(){
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(FRAME_RATE);
  textureMode(NORMAL);

  bgColor = color("#000000");
  fgColor = color("#ffffff");

  scenes = [Arc, Bend, Box, BugEyes, Halo, RiseSun, Shutters, Shutters2, SlotMachine, Snap, Split, Starburst, Twist];

  // The heaviest scenes are skipped on phones and tablets.
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    pixelDensity(1);
    scenes = scenes.filter(s => ![Bend, BugEyes, SlotMachine].includes(s));
  }

  nextScene();
}

function draw(){
  background(bgColor);
  ortho(-width/2, width/2, -height/2, height/2, -10000, 10000);

  push();
    translate(-width/2, -height/2);
    scene.update();
    scene.display();
  pop();

  frameCounter++;
  if(frameCounter % SCENE_LENGTH == 0){
    nextScene();
  }
}

function nextScene(){
  if(scene){
    scene.remove();
  }

  const SceneType = random(scenes);
  scene = new SceneType(WORDS[wordIndex]);
  wordIndex = (wordIndex + 1) % WORDS.length;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
