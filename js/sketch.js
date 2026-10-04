// Each word is shown for SCENE_LENGTH frames with a randomly picked scene, looping forever.
const WORDS = ["WE'RE", "CREVTIVE"];
const SCENE_LENGTH = 30;
const FRAME_RATE = 30;
// Render at the screen's pixel density, capped to keep phones fast and cool.
const MAX_DENSITY = 2;

const bgColor = hexColor("#000000");
const fgColor = hexColor("#ffffff");

let scenes;
let scene;
let wordIndex = 0;
let frameCounter = 0;

async function start(){
  const font = new FontFace(FONT_FAMILY, "url(../fonts/CREVTIVE-Extended-Black.woff)");
  document.fonts.add(await font.load());

  initGL();
  resize();
  window.addEventListener("resize", resize);

  scenes = [Arc, Bend, Box, BugEyes, Halo, RiseSun, Shutters, Shutters2, SlotMachine, Snap, Split, Starburst, Twist];

  nextScene();
  requestAnimationFrame(loop);
}

// Runs draw() at FRAME_RATE, with the same timing tolerance as p5.
let lastFrame = 0;
function loop(now){
  requestAnimationFrame(loop);
  if(now - lastFrame >= 1000/FRAME_RATE - 5){
    lastFrame = now;
    draw();
  }
}

function draw(){
  scene.update();
  render();

  frameCounter++;
  if(frameCounter % SCENE_LENGTH == 0){
    nextScene();
  }
}

function render(){
  background(bgColor);
  scene.display();
}

function nextScene(){
  if(scene){
    scene.remove();
  }

  const SceneType = random(scenes);
  scene = new SceneType(WORDS[wordIndex]);
  wordIndex = (wordIndex + 1) % WORDS.length;
}

function resize(){
  resizeGL(window.innerWidth, window.innerHeight, min(window.devicePixelRatio || 1, MAX_DENSITY));

  // Resizing a canvas wipes it, so repaint the current frame right away instead of
  // leaving it blank until the next tick. The animation itself doesn't advance.
  if(scene && scene.ticker > 0){
    render();
  }
}

start();
