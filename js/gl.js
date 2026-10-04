// A tiny WebGL renderer with the handful of p5-style calls the scenes use:
// a matrix stack, textured triangle strips/fans, solid rects and images.
// Coordinates match p5's WEBGL mode after translate(-width/2, -height/2):
// origin top-left, y down, z toward the viewer.

let canvas, gl;
let width = 0, height = 0, density = 1;

const TRIANGLE_STRIP = 5;   // gl.TRIANGLE_STRIP
const TRIANGLE_FAN = 6;     // gl.TRIANGLE_FAN

const MAX_VERTICES = 4096;
const FLOATS_PER_VERTEX = 5;   // x, y, z, u, v

let program, uMatrix, uColor, uUseTexture;
let vertexBuffer;
const vertexData = new Float32Array(MAX_VERTICES * FLOATS_PER_VERTEX);
let vertexCount = 0;
let shapeMode = TRIANGLE_STRIP;

let matrix = identity();
const matrixStack = [];
const mvp = new Float32Array(16);

let currentTexture = null;
let currentColor = [1, 1, 1, 1];

const VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  uniform mat4 uMatrix;
  varying highp vec2 vTexCoord;
  void main(){
    vTexCoord = aTexCoord;
    gl_Position = uMatrix * vec4(aPosition, 1.0);
  }`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying highp vec2 vTexCoord;
  uniform sampler2D uTexture;
  uniform vec4 uColor;
  uniform bool uUseTexture;
  void main(){
    gl_FragColor = uUseTexture ? texture2D(uTexture, vTexCoord) * uColor : uColor;
  }`;

function initGL(){
  canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  gl = canvas.getContext("webgl", { alpha: false, antialias: true, depth: true, premultipliedAlpha: false });

  program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  gl.useProgram(program);

  uMatrix = gl.getUniformLocation(program, "uMatrix");
  uColor = gl.getUniformLocation(program, "uColor");
  uUseTexture = gl.getUniformLocation(program, "uUseTexture");

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData.byteLength, gl.DYNAMIC_DRAW);

  const stride = FLOATS_PER_VERTEX * 4;
  const aPosition = gl.getAttribLocation(program, "aPosition");
  const aTexCoord = gl.getAttribLocation(program, "aTexCoord");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(aTexCoord);
  gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, stride, 12);

  // Same depth and blend setup as p5.
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function compileShader(type, source){
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function resizeGL(w, h, d){
  width = w;
  height = h;
  density = d;
  canvas.width = w * d;
  canvas.height = h * d;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function background(color){
  gl.clearColor(color[0], color[1], color[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  matrix = identity();
  matrixStack.length = 0;
}

//////////////////////////////////////////////
/////////////////////////////       TRANSFORMS
//////////////////////////////////////////////
// Column-major 4x4 matrices; each call post-multiplies, like p5.

function identity(){
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

function push(){
  matrixStack.push(matrix.slice());
}

function pop(){
  matrix = matrixStack.pop();
}

function translate(x, y, z = 0){
  const m = matrix;
  for(let i = 0; i < 4; i++){
    m[12 + i] += m[i] * x + m[4 + i] * y + m[8 + i] * z;
  }
}

// scale(s) scales uniformly on all three axes, like p5.
function scale(x, y, z = 1){
  if(y === undefined){
    y = z = x;
  }
  const m = matrix;
  for(let i = 0; i < 4; i++){
    m[i] *= x;
    m[4 + i] *= y;
    m[8 + i] *= z;
  }
}

// Mixes column a and column b of the matrix: a' = ca·a + sa·b, b' = cb·a + sb·b.
function mixColumns(a, b, ca, sa, cb, sb){
  const m = matrix;
  for(let i = 0; i < 4; i++){
    const ai = m[a * 4 + i];
    const bi = m[b * 4 + i];
    m[a * 4 + i] = ca * ai + sa * bi;
    m[b * 4 + i] = cb * ai + sb * bi;
  }
}

function rotateX(angle){
  const c = Math.cos(angle), s = Math.sin(angle);
  mixColumns(1, 2, c, s, -s, c);
}

function rotateY(angle){
  const c = Math.cos(angle), s = Math.sin(angle);
  mixColumns(0, 2, c, -s, s, c);
}

function rotateZ(angle){
  const c = Math.cos(angle), s = Math.sin(angle);
  mixColumns(0, 1, c, s, -s, c);
}

function shearX(angle){
  mixColumns(0, 1, 1, 0, Math.tan(angle), 1);
}

//////////////////////////////////////////////
/////////////////////////////       DRAWING
//////////////////////////////////////////////

function texture(tex){
  currentTexture = tex;
  currentColor = [1, 1, 1, 1];
}

function fill(color){
  currentTexture = null;
  currentColor = [color[0], color[1], color[2], 1];
}

function beginShape(mode){
  shapeMode = mode;
  vertexCount = 0;
}

function vertex(x, y, z, u, v){
  if(v === undefined){   // vertex(x, y, u, v)
    v = u;
    u = z;
    z = 0;
  }
  const i = vertexCount++ * FLOATS_PER_VERTEX;
  vertexData[i] = x;
  vertexData[i + 1] = y;
  vertexData[i + 2] = z;
  vertexData[i + 3] = u;
  vertexData[i + 4] = v;
}

function endShape(){
  // Orthographic projection over the canvas (y down), as set up by the p5 version.
  const m = matrix;
  const sx = 2/width, sy = -2/height, sz = -1/10000;
  for(let c = 0; c < 4; c++){
    mvp[c * 4] = sx * m[c * 4] - m[c * 4 + 3];
    mvp[c * 4 + 1] = sy * m[c * 4 + 1] + m[c * 4 + 3];
    mvp[c * 4 + 2] = sz * m[c * 4 + 2];
    mvp[c * 4 + 3] = m[c * 4 + 3];
  }
  gl.uniformMatrix4fv(uMatrix, false, mvp);
  gl.uniform4fv(uColor, currentColor);
  gl.uniform1i(uUseTexture, currentTexture ? 1 : 0);
  if(currentTexture){
    gl.bindTexture(gl.TEXTURE_2D, currentTexture.glTexture);
  }

  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexData.subarray(0, vertexCount * FLOATS_PER_VERTEX));
  gl.drawArrays(shapeMode, 0, vertexCount);
}

function quad(x, y, w, h, u0 = 0, v0 = 0, u1 = 1, v1 = 1){
  beginShape(TRIANGLE_STRIP);
    vertex(x, y, u0, v0);
    vertex(x, y + h, u0, v1);
    vertex(x + w, y, u1, v0);
    vertex(x + w, y + h, u1, v1);
  endShape();
}

function image(tex, x, y){
  texture(tex);
  quad(x, y, tex.width, tex.height);
}

function rect(x, y, w, h){
  quad(x, y, w, h);
}

//////////////////////////////////////////////
/////////////////////////////       TEXTURES
//////////////////////////////////////////////

// Uploads a 2D canvas once. width/height are in CSS pixels, like a p5.Graphics.
function createTexture(source, w, h){
  const glTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, glTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  source.width = source.height = 0;   // the pixels live on the GPU now
  return { glTexture, width: w, height: h };
}

function freeTexture(tex){
  gl.deleteTexture(tex.glTexture);
}
