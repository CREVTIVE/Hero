// Ratio of the font's cap height to its size, used to vertically center the text.
const FONT_ADJUST = 1;
const FONT_FAMILY = "CREVTIVE";

const { PI, sin, cos, tan, sqrt, pow, abs, floor, round, min, max } = Math;
const TWO_PI = PI * 2;
const HALF_PI = PI / 2;

//////////////////////////////////////////////
/////////////////////////////       MATH
//////////////////////////////////////////////

let rng = Math.random;

// random() → 0–1, random(max), random(min, max), or random(array) → a random element.
function random(a, b){
  const r = rng();
  if(Array.isArray(a)) return a[floor(r * a.length)];
  if(a === undefined) return r;
  if(b === undefined) return r * a;
  return a + r * (b - a);
}

function lerp(a, b, t){
  return a + (b - a) * t;
}

function map(v, a1, b1, a2, b2){
  return a2 + (b2 - a2) * (v - a1)/(b1 - a1);
}

function constrain(v, lo, hi){
  return max(min(v, hi), lo);
}

function dist(x1, y1, x2, y2){
  return Math.hypot(x2 - x1, y2 - y1);
}

function bezierPoint(a, b, c, d, t){
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

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

const measureContext = document.createElement("canvas").getContext("2d");

function fontString(size){
  return size + "px " + FONT_FAMILY;
}

function measure(str, size){
  measureContext.font = fontString(size);
  return measureContext.measureText(str).width;
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

// A 2D canvas at the screen's pixel density, scaled so we can draw in CSS pixels.
function createCanvas2D(w, h){
  const c = document.createElement("canvas");
  c.width = w * density;
  c.height = h * density;
  const ctx = c.getContext("2d");
  ctx.scale(density, density);
  return ctx;
}

// Texture with str centered on it. vCenter centers the visible letters vertically,
// instead of placing the baseline from the font size.
function textGraphic(str, size, w, h, bg = bgColor, fg = fgColor, vCenter = false){
  const ctx = createCanvas2D(w, h);
  ctx.fillStyle = cssColor(bg);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = cssColor(fg);
  ctx.font = fontString(size);
  // p5 centers using the kerned width but draws the letters without kerning; match both.
  ctx.fontKerning = "none";
  let baseline = h/2 + size * FONT_ADJUST/2;
  if(vCenter){
    const ink = ctx.measureText(str);
    baseline = h/2 + (ink.actualBoundingBoxAscent - ink.actualBoundingBoxDescent)/2;
  }
  ctx.fillText(str, w/2 - measure(str, size)/2, baseline);
  return createTexture(ctx.canvas, w, h);
}

// One texture per letter of str, all the same height.
function letterGraphics(str, size){
  return str.split("").map(c => textGraphic(c, size, round(measure(c, size)), size * (FONT_ADJUST + 0.05)));
}

//////////////////////////////////////////////
/////////////////////////////       GLYPHS
//////////////////////////////////////////////
// Letters drawn straight onto the canvas (Arc, Slots, Snap) use one small texture per
// character, sized to the glyph's ink so overlapping letters stay transparent.

const GLYPH_PAD = 2;
let glyphs = new Map();

function glyph(c, size){
  const key = c + size;
  if(!glyphs.has(key)){
    measureContext.font = fontString(size);
    const m = measureContext.measureText(c);
    const left = m.actualBoundingBoxLeft + GLYPH_PAD;
    const top = m.actualBoundingBoxAscent + GLYPH_PAD;
    const w = Math.ceil(left + m.actualBoundingBoxRight + GLYPH_PAD);
    const h = Math.ceil(top + m.actualBoundingBoxDescent + GLYPH_PAD);

    const ctx = createCanvas2D(w, h);
    ctx.fillStyle = cssColor(fgColor);
    ctx.font = fontString(size);
    ctx.fillText(c, left, top);
    glyphs.set(key, { tex: createTexture(ctx.canvas, w, h), left, top, advance: m.width });
  }
  return glyphs.get(key);
}

function freeGlyphs(){
  glyphs.forEach(g => freeTexture(g.tex));
  glyphs = new Map();
}

// Draws a single character with its baseline at y. align is "left" or "center".
function drawGlyph(c, size, x, y, align = "left"){
  const g = glyph(c, size);
  if(align == "center"){
    x -= g.advance/2;
  }
  let x0 = x - g.left;
  let y0 = y - g.top;

  // Without rotation or scaling, line the texture up with device pixels so it stays crisp.
  const m = matrix;
  if(m[0] == 1 && m[1] == 0 && m[4] == 0 && m[5] == 1){
    x0 = round((x0 + m[12]) * density)/density - m[12];
    y0 = round((y0 + m[13]) * density)/density - m[13];
  }

  texture(g.tex);
  quad(x0, y0, g.tex.width, g.tex.height);
}

//////////////////////////////////////////////
/////////////////////////////       COLOR
//////////////////////////////////////////////

function hexColor(hex){
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16 & 255)/255, (n >> 8 & 255)/255, (n & 255)/255];
}

function cssColor(c){
  return "rgb(" + c.map(v => round(v * 255)).join(",") + ")";
}

//////////////////////////////////////////////
/////////////////////////////       SCENE
//////////////////////////////////////////////

class Scene {
  constructor(txt){
    this.txt = txt;
    this.size = fitTextSize(txt);
    this.ticker = 0;
    this.textures = [];
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

  // Registers textures so they are freed when the scene ends.
  track(...textures){
    this.textures.push(...textures);
    return textures.length == 1 ? textures[0] : textures;
  }

  remove(){
    this.textures.forEach(freeTexture);
    freeGlyphs();
  }
}
