// Ratio of the font's cap height to its size, used to vertically center the text.
const FONT_ADJUST = 1;

//////////////////////////////////////////////
/////////////////////////////       EASING
//////////////////////////////////////////////

function easeOutCirc(t){
  return sqrt(1 - pow(t - 1, 2));
}

function easeInCirc(t){
  return 1 - sqrt(1 - pow(t, 2));
}

// Eases out from a to mid over the first half of t (0–1), then eases in from mid to b.
function easyEase(t, a, b, mid = (a + b)/2){
  return t < 0.5
    ? lerp(a, mid, easeOutCirc(t * 2))
    : lerp(mid, b, easeInCirc(t * 2 - 1));
}

//////////////////////////////////////////////
/////////////////////////////       TEXT
//////////////////////////////////////////////

function measure(str, size){
  textFont(font);
  textSize(size);
  return textWidth(str);
}

// Largest size (in steps of 2) at which str spans the canvas width, capped to 7/8 of its height.
function fitTextSize(str){
  let size = 2;
  let measured = 0;
  while(measured < width){
    measured = measure(str, size);
    size += 2;
  }
  return min(size, (height * 7/8)/FONT_ADJUST);
}

// Left edge of each letter when str is centered on the canvas.
function letterPositions(str, size){
  const left = width/2 - measure(str, size)/2;
  return str.split("").map((c, n) => left + measure(str.slice(0, n + 1), size) - measure(c, size));
}

// Offscreen buffer with str centered on it. vCenter centers on the bounding box instead of the baseline.
function textGraphic(str, size, w, h, bg = bgColor, fg = fgColor, vCenter = false){
  const pg = createGraphics(w, h);
  pg.background(bg);
  pg.fill(fg);
  pg.noStroke();
  pg.textFont(font);
  pg.textSize(size);
  if(vCenter){
    pg.textAlign(CENTER, CENTER);
    pg.text(str, w/2, h/2);
  } else {
    pg.textAlign(CENTER);
    pg.text(str, w/2, h/2 + size * FONT_ADJUST/2);
  }
  return pg;
}

// One buffer per letter of str, all the same height.
function letterGraphics(str, size){
  return str.split("").map(c => textGraphic(c, size, round(measure(c, size)), size * (FONT_ADJUST + 0.05)));
}

//////////////////////////////////////////////
/////////////////////////////       SCENE
//////////////////////////////////////////////

class Scene {
  constructor(txt){
    this.txt = txt;
    this.size = fitTextSize(txt);
    this.ticker = 0;
    this.graphics = [];
  }

  update(){
    this.ticker++;
    this.animate(min(this.ticker/SCENE_LENGTH, 1));
  }

  // t runs 0–1 over the scene.
  animate(t){}

  display(){}

  // Progress (0–1) of an element whose start is delayed by `delay` frames.
  delayed(delay){
    return constrain(this.ticker - delay, 0, SCENE_LENGTH)/SCENE_LENGTH;
  }

  // Registers offscreen buffers so they are uploaded once and freed when the scene ends.
  track(...pgs){
    pgs.forEach(freezeTexture);
    this.graphics.push(...pgs);
    return pgs.length == 1 ? pgs[0] : pgs;
  }

  remove(){
    this.graphics.forEach(freeTexture);
  }
}

//////////////////////////////////////////////
/////////////////////////////       GPU TEXTURES
//////////////////////////////////////////////
// p5 1.5 re-uploads a p5.Graphics texture every time it is drawn, and never deletes it
// from the GPU, even after pg.remove(). Our text buffers never change once drawn, so we
// upload each one once and delete it ourselves when its scene ends.

function freezeTexture(pg){
  // Creating the texture uploads the pixels; skip every later upload.
  _renderer.getTexture(pg).update = () => false;
}

function freeTexture(pg){
  const textures = _renderer.textures;
  const i = textures.findIndex(tex => tex.src === pg);
  if(i >= 0){
    drawingContext.deleteTexture(textures[i].glTex);
    textures.splice(i, 1);
  }
  pg.remove();
}
