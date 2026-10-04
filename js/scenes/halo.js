// The word scrolls around a tilted ring, inverted on the inside face.
class Halo extends Scene {
  constructor(txt){
    super(txt);
    const w = round(measure(txt, this.size)) + 200;
    const h = this.size * (FONT_ADJUST + 0.1);
    this.pgA = this.track(textGraphic(txt, this.size, w, h, bgColor, fgColor));
    this.pgB = this.track(textGraphic(txt, this.size, w, h, fgColor, bgColor));

    this.res = 100;
    this.ang = TWO_PI/this.res;
    this.radius = width/2;
    this.sec = (TWO_PI * this.radius)/this.res;

    this.xRotMax = random(-PI/4, PI/4);
    this.zRotMax = random(-PI/4, PI/4);
  }

  animate(t){
    this.xRot = easyEase(t, 0, this.xRotMax);
    this.zRot = easyEase(t, 0, this.zRotMax);
  }

  display(){
    const loopLength = this.pgA.width;
    const stripH = this.pgA.height;

    translate(width/2, height/2);
    rotateX(this.xRot);
    rotateZ(this.zRot);

    [this.pgA, this.pgB].forEach((pg, m) => {
      texture(pg);
      beginShape(TRIANGLE_STRIP);
        for(let n = 0; n <= this.res; n++){
          const x = cos(n * this.ang + PI) * (this.radius - m/2);
          const z = sin(n * this.ang + PI) * (this.radius - m/2);
          const yTop = -stripH/2 + m;
          const yBot = stripH/2 - m;

          const d = (n * this.sec + this.ticker * 2 + 600) % loopLength;
          const u = 1 - d/loopLength;

          vertex(x, yTop, z, u, 0);
          vertex(x, yBot, z, u, 1);

          // Close the seam where the texture wraps around.
          if(d > loopLength - this.sec){
            vertex(x, yTop, z, 1, 0);
            vertex(x, yBot, z, 1, 1);
          }
        }
      endShape();
    });
  }
}
